/**
 * Hook orquestador del temporizador Pomodoro.
 * Une la lógica pura (src/domain/timer.ts), la persistencia (src/services/storage.ts)
 * y el servicio de alarma (src/services/alarm.ts).
 *
 * Enfoque: el estado del temporizador (status, tiempoRestante, startedAt, fase,
 * pomodoros) SOLO cambia por acciones del usuario o cuando una fase termina.
 * Un estado separado `tiempoMostrar` se actualiza cada segundo mediante un
 * interval basado en timestamps, para que el reloj se vea avanzando en pantalla
 * sin crear race conditions entre el interval y las acciones del usuario.
 * Cuando una fase completa, `manejarFaseCompletada` fija `tiempoMostrar`
 * con la duración completa de la siguiente fase preparada (RF-10, RF-12).
 * RF-02…RF-14, RF-08, RF-09, RNF-01, RNF-02.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AppState } from 'react-native';

import {
  initialState,
  start,
  pause,
  resume,
  resetConfirmed,
  completePhase,
  recalculateOnResume,
  reinicioCompleto,
  type TimerState,
  type TickResult,
  type FaseCompletadaEvent,
  type FasePomodoro,
} from '@/domain/timer';
import { DURACION_POR_FASE } from '@/constants/pomodoro';
import {
  validarConfiguracion,
  puedeCambiarCicloPomodoros,
  CONFIG_FABRICA,
  type Configuracion,
} from '@/domain/config';
import { guardarEstado, cargarEstado, guardarConfiguracion, cargarConfiguracion } from '@/services/storage';
import { alarmService } from '@/services/alarm';
import { solicitarPermisoAlarma, MENSAJE_PERMISO_ALARMA } from '@/services/permissions';

/** Date.now() devuelve ms; el dominio trabaja en segundos. */
const ahoraEnSegundos = (): number => Math.floor(Date.now() / 1000);

/**
 * Calcula el tiempo restante basado en startedAt (timestamps).
 * Si el temporizador no está corriendo, devuelve el tiempoRestante guardado.
 */
function tiempoRestanteActual(state: TimerState): number {
  if (state.status !== 'corriendo' || !state.startedAt) {
    return state.tiempoRestante;
  }
  const transcurrido = ahoraEnSegundos() - state.startedAt;
  return Math.max(0, state.tiempoRestante - transcurrido);
}

export interface UseTimerReturn {
  state: TimerState;
  tiempoMostrar: number; // tiempo restante calculado en tiempo real para mostrar
  alarmaActiva: boolean;
  permisoConcedido: boolean | null; // null = aún no consultado
  mostrarBannerPermiso: boolean;
  mensajePermiso: string;
  errorPersistencia: string | null;
  /** Motivo del último fallo de lectura del almacenamiento al iniciar (RF-04). null = sin fallo. */
  errorCarga: string | null;
  /** Vuelve a intentar la lectura del almacenamiento (RF-05). */
  reintentarCarga: () => Promise<void>;
  /** Limpia el error de carga y oculta el banner de error (RF-04 / RF-05). */
  limpiarErrorCarga: () => void;
  iniciar: () => Promise<void>;
  pausar: () => Promise<void>;
  reanudar: () => Promise<void>;
  solicitarReinicio: (aceptar: boolean) => Promise<void>;
  reiniciarCompleto: () => Promise<void>;
  detenerAlarma: () => void;
  solicitarPermiso: () => Promise<void>;
  /** Oculta el banner de permiso sin solicitarlo. */
  cerrarBannerPermiso: () => void;
  /** Configuración actual de ajustes (duraciones y ciclo de pomodoros). */
  configuracion: Configuracion;
  /** Cantidad de pomodoros por ciclo configurada. */
  cicloPomodoros: number;
  /** Guarda nuevos valores, los persiste y los aplica a la siguiente iteración de cada fase (sin tocar la fase en curso). Lanza si hay errores de validación o si el nuevo cicloPomodoros es menor que los pomodoros completados (RF-11). */
  guardarAjustes: (campos: Partial<Configuracion>) => Promise<Configuracion>;
  /** Restablece a valores de fábrica si confirmar es true (detiene el temporizador y resetea pomodoros); si false, preserva todo. */
  restablecerAjustes: (confirmar: boolean) => Promise<void>;
}

/**
 * Aplica una transición de fase completada: guarda, activa alarma y prepara
 * la siguiente fase detenida (sin iniciarla automáticamente).
 * Además sincroniza `tiempoMostrar` con la duración completa de esa fase,
 * para que la pantalla muestre la siguiente fase en cuanto termina
 * (RF-10, RF-12, Decisión 7).
 */
function manejarFaseCompletada(
  faseAnterior: FaseCompletadaEvent['faseAnterior'],
  state: TimerState,
  persist: (next: TimerState) => void,
  setTiempoMostrar: React.Dispatch<React.SetStateAction<number>>,
  setAlarmaActiva: (v: boolean) => void,
  alarmTimeoutRef: React.MutableRefObject<number | null>,
  duraciones: Record<FasePomodoro, number>,
  cicloPomodoros: number,
) {
  const estadoTransicion = completePhase(
    { ...state, fase: faseAnterior },
    duraciones,
    cicloPomodoros,
  );
  persist(estadoTransicion);
  setTiempoMostrar(estadoTransicion.tiempoRestante);
  setAlarmaActiva(true);
  void alarmService.play(faseAnterior);
  // RF-05: silencio automático a los 30 s sin interacción del usuario
  alarmTimeoutRef.current = setTimeout(() => {
    setAlarmaActiva(false);
    alarmTimeoutRef.current = null;
    void alarmService.stop();
  }, 30_000);
}

export function useTimer(): UseTimerReturn {
  const [state, setState] = useState<TimerState>(initialState());
  const [alarmaActiva, setAlarmaActiva] = useState(false);
  const [permisoConcedido, setPermisoConcedido] = useState<boolean | null>(null);
  const [mostrarBannerPermiso, setMostrarBannerPermiso] = useState(false);
  /** Motivo del último fallo de persistencia (RF-05). null = sin fallo. */
  const [errorPersistencia, setErrorPersistencia] = useState<string | null>(null);
  /** Motivo del último fallo de lectura del almacenamiento al iniciar (RF-04). null = sin fallo. */
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  /** Estado separado para forzar re-render cada segundo mientras corre. */
  const [tiempoMostrar, setTiempoMostrar] = useState(state.tiempoRestante);
  /** Configuración de ajustes del usuario (duraciones y ciclo de pomodoros). */
  const [configuracion, setConfiguracion] = useState<Configuracion>(CONFIG_FABRICA);
  /** Duraciones y ciclo derivados de la configuración actual (se aplican a la siguiente iteración de cada fase). */
  const duraciones = useMemo<Record<FasePomodoro, number>>(() => ({
    estudio: configuracion.estudio,
    descansoCorto: configuracion.descansoCorto,
    descansoLargo: configuracion.descansoLargo,
  }), [configuracion.estudio, configuracion.descansoCorto, configuracion.descansoLargo]);
  const cicloPomodoros = configuracion.cicloPomodoros;
  /** ID del setTimeout de silencio automático a los 30 s (RF-05). */
  const alarmTimeoutRef = useRef<number | null>(null);

  /**
   * Persiste el siguiente estado: setState + AsyncStorage.
   * Si guardarEstado falla, guarda el motivo en errorPersistencia sin
   * bloquear la aplicación (RF-05).
   */
  const persist = useCallback(
    (next: TimerState) => {
      setState(next);
      guardarEstado(next).catch((error) => {
        setErrorPersistencia(error instanceof Error ? error.message : String(error));
      });
    },
    [],
  );

  /**
   * Carga configuración y estado del almacenamiento. Se ejecuta al montar
   * (reintento automático al relanzar la app, RF-05). No borra un error previo
   * al inicio: ese rol le corresponde a `reintentarCarga` (botón "Reintentar").
   * Si la lectura falla, expone el motivo en `errorCarga` y no inicia el
   * temporizador ni persiste una sesión parcial (RF-04).
   */
  const cargarSesion = useCallback(async () => {
    try {
      // La configuración se carga primero para que toda la carga use una sola copia de datos.
      const guardadoConfig = await cargarConfiguracion();
      const configCargada: Configuracion = { ...CONFIG_FABRICA, ...guardadoConfig };
      const duracionesCargadas: Record<FasePomodoro, number> = {
        estudio: configCargada.estudio,
        descansoCorto: configCargada.descansoCorto,
        descansoLargo: configCargada.descansoLargo,
      };
      setConfiguracion(configCargada);

      const guardado = await cargarEstado();
      if (guardado) {
        let siguiente: TimerState | TickResult = guardado;
        if (guardado.status === 'corriendo') {
          siguiente = recalculateOnResume(guardado, ahoraEnSegundos());
        }
        if ('tipo' in siguiente && siguiente.tipo === 'FASE_COMPLETADA') {
          const ev = siguiente as FaseCompletadaEvent;
          manejarFaseCompletada(
            ev.faseAnterior,
            guardado,
            persist,
            setTiempoMostrar,
            setAlarmaActiva,
            alarmTimeoutRef,
            duracionesCargadas,
            configCargada.cicloPomodoros,
          );
        } else {
          setState(siguiente as TimerState);
        }
      } else {
        const inicial = initialState(duracionesCargadas);
        setState(inicial);
        setTiempoMostrar(inicial.tiempoRestante);
      }

      setPermisoConcedido(await solicitarPermisoAlarma(alarmService));
    } catch (error: unknown) {
      // RF-04: error visible de lectura, la app no inicia el temporizador.
      setErrorCarga(error instanceof Error ? error.message : String(error));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Vuelve a leer el almacenamiento (RF-05). Limpia el error previo antes de
   * reintentar para que un intento exitoso oculte el banner de error.
   */
  const reintentarCarga = useCallback(async () => {
    setErrorCarga(null);
    await cargarSesion();
  }, [cargarSesion]);

  /** Limpia el error de carga y oculta el banner de error (RF-04 / RF-05). */
  const limpiarErrorCarga = useCallback(() => {
    setErrorCarga(null);
  }, []);

  // --- Carga al montar y recalcula si estaba corriendo (RF-13, Decisión 3) ---
  useEffect(() => {
    // RF-05: al montar (relanzar la app) se reintenta la lectura automáticamente.
    // `cargarSesion` solo asigna estado tras `await` (no hay `setState`
    // síncrono durante la ejecución del efecto), por lo que no hay render en
    // cascada; se suprime la advertencia estática de la regla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarSesion();
    return () => {
      if (alarmTimeoutRef.current !== null) {
        clearTimeout(alarmTimeoutRef.current);
        alarmTimeoutRef.current = null;
      }
    };
  }, [cargarSesion]);

  // --- Programar el aviso de fin de fase en el SO para que suene en segundo plano ---
  useEffect(() => {
    if (state.status !== 'corriendo' || !state.startedAt) return undefined;
    const finMs = (state.startedAt + state.tiempoRestante) * 1000;
    void alarmService.scheduleEnd(state.fase, finMs)?.catch?.(() => undefined);
    return () => {
      void alarmService.cancelScheduledEnd()?.catch?.(() => undefined);
    };
  }, [state.status, state.startedAt, state.tiempoRestante, state.fase]);

  // --- Detectar fin de fase por timestamps (RF-03, RF-10, RF-12) ---
  // Depende también de `tiempoMostrar` para ejecutarse cada segundo mientras
  // el temporizador corre y detectar cuando el tiempo llega a 0. Sin esto,
  // el effect solo se ejecuta cuando cambia `state` (que no ocurre cada
  // segundo durante el conteo), por lo que el fin de fase no se detecta
  // en tiempo real mientras la app está abierta (RF-10).
  useEffect(() => {
    if (state.status !== 'corriendo') return;
    const restante = tiempoRestanteActual(state);
    if (restante <= 0) {
      manejarFaseCompletada(
        state.fase,
        state,
        persist,
        setTiempoMostrar,
        setAlarmaActiva,
        alarmTimeoutRef,
        duraciones,
        cicloPomodoros,
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, tiempoMostrar, alarmTimeoutRef, duraciones, cicloPomodoros]);

  // --- Recalcular al volver de segundo plano / desbloquear dispositivo ---
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && state.status === 'corriendo') {
        const resultado = recalculateOnResume(state, ahoraEnSegundos());
        if ('tipo' in resultado && resultado.tipo === 'FASE_COMPLETADA') {
          const ev = resultado as FaseCompletadaEvent;
          manejarFaseCompletada(
            ev.faseAnterior,
            state,
            persist,
            setTiempoMostrar,
            setAlarmaActiva,
            alarmTimeoutRef,
            duraciones,
            cicloPomodoros,
          );
        } else {
          persist(resultado as TimerState);
        }
      }
    });
    return () => suscripcion.remove();
  }, [state, persist, alarmTimeoutRef, duraciones, cicloPomodoros]);

  // --- Interval que actualiza tiempoMostrar cada segundo (RF-03) ---
  // Solo toca el estado de visualización, nunca el estado del temporizador.
  // Usa el setter funcional para leer el state más reciente sin stale closure.
  useEffect(() => {
    if (state.status !== 'corriendo') return undefined;
    const id = setInterval(() => {
      setTiempoMostrar(tiempoRestanteActual(state));
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  // Si no corre, la pantalla siempre refleja el tiempo del estado (evita quedarse en 00:00
  // tras terminar una fase mientras la app estaba en segundo plano).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.status !== 'corriendo') setTiempoMostrar(state.tiempoRestante);
  }, [state.status, state.tiempoRestante, state.fase]);

  // --- Acciones (setters funcionales para evitar stale closures) ---
  const iniciar = useCallback(async () => {
    // RF-08: si no hay permiso, impedir iniciar y solicitarlo
    const tienePermiso = await solicitarPermisoAlarma(alarmService);
    setPermisoConcedido(tienePermiso);
    if (!tienePermiso) {
      setMostrarBannerPermiso(true);
      return;
    }
    setMostrarBannerPermiso(false);
    setState(current => {
      const siguiente = start(current, ahoraEnSegundos(), duraciones, cicloPomodoros);
      persist(siguiente);
      setTiempoMostrar(siguiente.tiempoRestante);
      return siguiente;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duraciones, cicloPomodoros]);

  const pausar = useCallback(async () => {
    setState(current => {
      const siguiente = pause(current, ahoraEnSegundos());
      persist(siguiente);
      setTiempoMostrar(siguiente.tiempoRestante);
      return siguiente;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reanudar = useCallback(async () => {
    // Validar permiso de forma asíncrona y, si no hay, no reanudar
    const tienePermiso = await solicitarPermisoAlarma(alarmService);
    setPermisoConcedido(tienePermiso);
    if (!tienePermiso) {
      setMostrarBannerPermiso(true);
      return;
    }
    setMostrarBannerPermiso(false);
    setState(current => {
      if (current.status !== 'pausado') return current;
      const siguiente = resume(current, ahoraEnSegundos());
      persist(siguiente);
      return siguiente;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solicitarReinicio = useCallback(
    async (aceptar: boolean) => {
      if (!aceptar) {
        // RF-07: cancelar conserva exactamente el tiempo y estado previo
        return;
      }
      // RF-05 / RF-06: confirmar reinicio -> duración completa, detenido, misma fase
      setState(current => {
        const siguiente = resetConfirmed(current);
        persist(siguiente);
        setTiempoMostrar(siguiente.tiempoRestante);
        return siguiente;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reiniciarCompleto = useCallback(async () => {
    // RF-08/RF-09: devuelve todo al estado inicial del pomodoro y persiste
    const siguiente = reinicioCompleto(duraciones);
    setState(siguiente);
    setTiempoMostrar(siguiente.tiempoRestante);
    persist(siguiente);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duraciones]);

  const detenerAlarma = useCallback(() => {
    setAlarmaActiva(false);
    if (alarmTimeoutRef.current !== null) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    void alarmService.stop(); // RF-11
  }, []);

  const solicitarPermiso = useCallback(async () => {
    const tienePermiso = await solicitarPermisoAlarma(alarmService);
    setPermisoConcedido(tienePermiso);
    setMostrarBannerPermiso(!tienePermiso); // RNF-02, Constitución §1.3
  }, []);

  const cerrarBannerPermiso = useCallback(() => {
    setMostrarBannerPermiso(false);
  }, []);

  // Al volver de Ajustes del SO, se vuelve a consultar el permiso.
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') return;
      void alarmService.hasPermission().then((concedido) => {
        setPermisoConcedido(concedido);
        if (concedido) setMostrarBannerPermiso(false);
      });
    });
    return () => suscripcion.remove();
  }, []);

  const guardarAjustes = useCallback(
    async (campos: Partial<Configuracion>): Promise<Configuracion> => {
      // RF-11: rechazar si el nuevo cicloPomodoros es menor que los pomodoros completados
      if (
        campos.cicloPomodoros !== undefined &&
        !puedeCambiarCicloPomodoros(state.pomodoros, campos.cicloPomodoros)
      ) {
        throw new Error(
          `No se pueden establecer ${campos.cicloPomodoros} pomodoros por ciclo: ya llevas ${state.pomodoros} completados, ese número corresponde a un pomodoro ya expirado.`,
        );
      }

      // RF-01, RF-06: validar campos antes de guardar
      const resultado = validarConfiguracion(campos);
      if (!resultado.valido) {
        const mensajes = Object.entries(resultado.errores)
          .map(([campo, error]) => `${campo}: ${error}`)
          .join('; ');
        throw new Error(mensajes);
      }

      // Los campos de tiempo entran en minutos (rango RANGOS) y se guardan en segundos (modelo de dominio).
      const configuracionNueva: Configuracion = { ...configuracion };
      if (campos.estudio !== undefined) {
        configuracionNueva.estudio = campos.estudio * 60;
      }
      if (campos.descansoCorto !== undefined) {
        configuracionNueva.descansoCorto = campos.descansoCorto * 60;
      }
      if (campos.descansoLargo !== undefined) {
        configuracionNueva.descansoLargo = campos.descansoLargo * 60;
      }
      if (campos.cicloPomodoros !== undefined) {
        configuracionNueva.cicloPomodoros = campos.cicloPomodoros;
      }

      // RF-03: persistir en clave separada
      await guardarConfiguracion(configuracionNueva);
      setConfiguracion(configuracionNueva);
      // Una fase detenida que aún no empezó (instalación nueva o siguiente fase ya
      // preparada) no está "en curso": toma los nuevos valores de inmediato.
      if (state.status === 'detenido' && state.tiempoRestante === state.duracionFase) {
        const nuevaDuracion = configuracionNueva[state.fase];
        const siguiente: TimerState = {
          ...state,
          duracionFase: nuevaDuracion,
          tiempoRestante: nuevaDuracion,
        };
        persist(siguiente);
        setTiempoMostrar(nuevaDuracion);
      }
      // RF-02, RF-10: no se toca state.tiempoRestante ni duracionFase de una fase en curso;
      // los nuevos valores aplican a la siguiente iteración de cada fase.
      return configuracionNueva;
    },
    [configuracion, state, persist],
  );

  const restablecerAjustes = useCallback(async (confirmar: boolean): Promise<void> => {
    // RF-09: cancelar preserva valores y estado exactamente
    if (!confirmar) {
      return;
    }
    // RF-08: valores de fábrica, detiene el temporizador, resetea pomodoros a 0
    await guardarConfiguracion(CONFIG_FABRICA);
    setConfiguracion(CONFIG_FABRICA);
    const siguiente = reinicioCompleto();
    setState(siguiente);
    setTiempoMostrar(siguiente.tiempoRestante);
    persist(siguiente);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    tiempoMostrar,
    alarmaActiva,
    permisoConcedido,
    mostrarBannerPermiso,
    mensajePermiso: MENSAJE_PERMISO_ALARMA,
    errorPersistencia,
    errorCarga,
    configuracion,
    cicloPomodoros,
    guardarAjustes,
    restablecerAjustes,
    iniciar,
    pausar,
    reanudar,
    solicitarReinicio,
    reiniciarCompleto,
    detenerAlarma,
    solicitarPermiso,
    cerrarBannerPermiso,
    reintentarCarga,
    limpiarErrorCarga,
  };
}
