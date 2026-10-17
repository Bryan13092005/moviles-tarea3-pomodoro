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

import { useState, useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import {
  initialState,
  start,
  pause,
  resume,
  resetConfirmed,
  completePhase,
  recalculateOnResume,
  type TimerState,
  type TickResult,
  type FaseCompletadaEvent,
} from '@/domain/timer';
import { DURACION_POR_FASE } from '@/constants/pomodoro';
import { guardarEstado, cargarEstado } from '@/services/storage';
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
  iniciar: () => Promise<void>;
  pausar: () => Promise<void>;
  reanudar: () => Promise<void>;
  solicitarReinicio: (aceptar: boolean) => Promise<void>;
  detenerAlarma: () => void;
  solicitarPermiso: () => Promise<void>;
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
  setState: React.Dispatch<React.SetStateAction<TimerState>>,
  setTiempoMostrar: React.Dispatch<React.SetStateAction<number>>,
  setAlarmaActiva: (v: boolean) => void,
) {
  const estadoTransicion = completePhase(
    { ...state, fase: faseAnterior },
    DURACION_POR_FASE,
  );
  setState(estadoTransicion);
  setTiempoMostrar(estadoTransicion.tiempoRestante);
  void guardarEstado(estadoTransicion);
  setAlarmaActiva(true);
  void alarmService.play();
}

export function useTimer(): UseTimerReturn {
  const [state, setState] = useState<TimerState>(initialState());
  const [alarmaActiva, setAlarmaActiva] = useState(false);
  const [permisoConcedido, setPermisoConcedido] = useState<boolean | null>(null);
  const [mostrarBannerPermiso, setMostrarBannerPermiso] = useState(false);
  /** Estado separado para forzar re-render cada segundo mientras corre. */
  const [tiempoMostrar, setTiempoMostrar] = useState(state.tiempoRestante);

  /**
   * Persiste el siguiente estado: setState + AsyncStorage.
   */
  const persist = useCallback(
    (next: TimerState) => {
      setState(next);
      void guardarEstado(next);
    },
    [],
  );

  // --- Carga al montar y recalcula si estaba corriendo (RF-13, Decisión 3) ---
  useEffect(() => {
    let montado = true;
    (async () => {
      const guardado = await cargarEstado();
      if (!montado) return;

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
            setState,
            setTiempoMostrar,
            setAlarmaActiva,
          );
        } else {
          setState(siguiente as TimerState);
        }
      }

      setPermisoConcedido(await solicitarPermisoAlarma(alarmService));
    })();
    return () => {
      montado = false;
    };
  }, []);

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
        setState,
        setTiempoMostrar,
        setAlarmaActiva,
      );
    }
  }, [state, tiempoMostrar]);

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
            setState,
            setTiempoMostrar,
            setAlarmaActiva,
          );
        } else {
          persist(resultado as TimerState);
        }
      }
    });
    return () => suscripcion.remove();
  }, [state, persist]);

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
      const siguiente = start(current, ahoraEnSegundos(), DURACION_POR_FASE);
      void guardarEstado(siguiente);
      setTiempoMostrar(siguiente.tiempoRestante);
      return siguiente;
    });
  }, []);

  const pausar = useCallback(async () => {
    setState(current => {
      const siguiente = pause(current, ahoraEnSegundos());
      void guardarEstado(siguiente);
      setTiempoMostrar(siguiente.tiempoRestante);
      return siguiente;
    });
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
      void guardarEstado(siguiente);
      return siguiente;
    });
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
        void guardarEstado(siguiente);
        setTiempoMostrar(siguiente.tiempoRestante);
        return siguiente;
      });
    },
    [],
  );

  const detenerAlarma = useCallback(() => {
    setAlarmaActiva(false);
    void alarmService.stop(); // RF-11
  }, []);

  const solicitarPermiso = useCallback(async () => {
    const tienePermiso = await solicitarPermisoAlarma(alarmService);
    setPermisoConcedido(tienePermiso);
    setMostrarBannerPermiso(!tienePermiso); // RNF-02, Constitución §1.3
  }, []);

  return {
    state,
    tiempoMostrar,
    alarmaActiva,
    permisoConcedido,
    mostrarBannerPermiso,
    mensajePermiso: MENSAJE_PERMISO_ALARMA,
    iniciar,
    pausar,
    reanudar,
    solicitarReinicio,
    detenerAlarma,
    solicitarPermiso,
  };
}
