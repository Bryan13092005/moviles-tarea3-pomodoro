/**
 * Lógica pura del dominio del temporizador Pomodoro.
 * Todas las funciones reciben el estado y un `now` inyectado (timestamp),
 * nunca llaman a Date.now() ni a APIs de dispositivo.
 * Origen: Spec 001 (RF-02…RF-07, RF-10, RF-12, RF-14) y decisiones 1-9.
 */

import {
  DURACION_POR_FASE,
  type FasePomodoro,
} from '../constants/pomodoro';

export type { FasePomodoro };

export type EstadoTemporizador = 'detenido' | 'corriendo' | 'pausado';

export interface TimerState {
  /** Fase que se muestra actualmente. */
  fase: FasePomodoro;
  /** 'detenido' | 'corriendo' | 'pausado'. */
  status: EstadoTemporizador;
  /** Segundos restantes de la fase mostrada. */
  tiempoRestante: number;
  /** Duración configurada (segundos) de la fase que se muestra. */
  duracionFase: number;
  /** Pomodoros completados en el ciclo actual (0..cicloPomodoros). */
  pomodoros: number;
  /** Timestamp en que se puso el temporizador en 'corriendo', o null. */
  startedAt: number | null;
  /** Fase completada inmediatamente antes de la actual (null al instalar). */
  faseAnterior: FasePomodoro | null;
}

export type FaseCompletadaEvent = {
  tipo: 'FASE_COMPLETADA';
  faseAnterior: FasePomodoro;
};

export type TickResult = TimerState | FaseCompletadaEvent;

/**
 * Estado de instalación nueva: fase Estudio, 25:00, detenido, listo para iniciar.
 * (RF-01, Decisión 6)
 */
export function initialState(): TimerState {
  return {
    fase: 'estudio',
    status: 'detenido',
    tiempoRestante: DURACION_POR_FASE.estudio,
    duracionFase: DURACION_POR_FASE.estudio,
    pomodoros: 0,
    startedAt: null,
    faseAnterior: null,
  };
}

/** Segundos configurados para la fase dada. */
export function durationFor(
  fase: FasePomodoro,
  duraciones: Record<FasePomodoro, number>,
): number {
  return duraciones[fase];
}

/** Formato MM:SS con dos dígitos. Cubre 00:00, 00:01, 59:59. (RF-03, RF-14) */
export function formatMMSS(segundos: number): string {
  const m = Math.floor(Math.max(0, segundos) / 60);
  const s = Math.max(0, segundos) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Inicia el temporizador si está detenido.
 * Si el tiempo restante es 0 (fase completa), lo restaura a la duración completa.
 * Si ya está corriendo, no-op.
 * Nuevo (Spec 002):
 * - al iniciar un descanso (corto o largo) incrementa pomodoros en 1 (RF-04, Decisión 5);
 * - al iniciar estudio con faseAnterior === 'descansoLargo' resetea pomodoros a 0 (RF-05, Decisión 6).
 * `duraciones` se recibe por consistencia con completePhase; el valor de inicio de la
 * fase en curso se conserva en state.duracionFase (RF-07).
 */
export function start(
  state: TimerState,
  now: number,
  duraciones: Record<FasePomodoro, number>,
  cicloPomodoros: number,
): TimerState {
  if (state.status === 'corriendo') {
    return state;
  }
  const tiempoRestante =
    state.tiempoRestante <= 0 ? state.duracionFase : state.tiempoRestante;
  let nuevosPomodoros = state.pomodoros;
  if (state.fase === 'descansoCorto' || state.fase === 'descansoLargo') {
    nuevosPomodoros = Math.min(state.pomodoros + 1, cicloPomodoros); // RF-04; Decisión 6: no excede el límite del ciclo
  }
  if (state.fase === 'estudio' && state.faseAnterior === 'descansoLargo') {
    nuevosPomodoros = 0; // RF-05
  }
  return {
    ...state,
    status: 'corriendo',
    startedAt: now,
    tiempoRestante,
    pomodoros: nuevosPomodoros,
  };
}

/**
 * Pausa un temporizador en curso: hace snapshot del restante transcurrido.
 * (RF-04)
 */
export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'corriendo' || state.startedAt === null) {
    return state;
  }
  const transcurrido = now - state.startedAt;
  const nuevoRestante = Math.max(0, state.tiempoRestante - transcurrido);
  return {
    ...state,
    status: 'pausado',
    startedAt: null,
    tiempoRestante: nuevoRestante,
  };
}

/**
 * Reanuda un temporizador pausado: startedAt = now, conserva el restante.
 * (RF-04)
 */
export function resume(state: TimerState, now: number): TimerState {
  if (state.status !== 'pausado') {
    return state;
  }
  return {
    ...state,
    status: 'corriendo',
    startedAt: now,
  };
}

/**
 * Reinicio confirmado: devuelve la fase mostrada a su duración completa,
 * la deja detenida, misma fase, pomodoros intactos. (RF-05, RF-06, Decisión 5)
 */
export function resetConfirmed(state: TimerState): TimerState {
  return {
    ...state,
    tiempoRestante: state.duracionFase,
    status: 'detenido',
    startedAt: null,
  };
}

/**
 * Cancelar reinicio: conserva exactamente el tiempo y estado previo. (RF-07)
 */
export function resetCancelled(state: TimerState): TimerState {
  return state;
}

/**
 * Tick: recalcula restante transcurrido desde startedAt.
 * Si llega a <= 0, devuelve evento FASE_COMPLETADA sin iniciar la siguiente.
 * (RF-03, RF-10, RF-12, Decisión 1/2)
 */
export function tick(state: TimerState, now: number): TickResult {
  if (state.status !== 'corriendo' || state.startedAt === null) {
    return state;
  }
  const transcurrido = now - state.startedAt;
  const nuevoRestante = state.tiempoRestante - transcurrido;
  if (nuevoRestante <= 0) {
    return { tipo: 'FASE_COMPLETADA', faseAnterior: state.fase };
  }
  return {
    ...state,
    tiempoRestante: nuevoRestante,
    startedAt: now,
  };
}

/**
 * Completa la fase actual: suena la alarma (efecto manejado en el hook),
 * avanza a la siguiente fase detenida con su duración completa (sin iniciarla automáticamente).
 * Estudio -> Descanso Corto, o Descanso Largo si pomodoros + 1 >= cicloPomodoros (RF-01/RF-02).
 * Descanso -> Estudio (RF-03).
 * Los pomodoros NO se modifican aquí: se incrementan al iniciar el descanso (RF-04, Decisión 5)
 * y se reinician al iniciar estudio tras Descanso Largo (RF-05, Decisión 6).
 * Guarda faseAnterior para que start() pueda aplicar RF-05.
 * (Decisión 1, Constitución 2.2)
 */
export function completePhase(
  state: TimerState,
  duraciones: Record<FasePomodoro, number>,
  cicloPomodoros: number,
): TimerState {
  let siguienteFase: FasePomodoro;

  if (state.fase === 'estudio') {
    const pomodorosSiguiente = state.pomodoros + 1;
    if (pomodorosSiguiente >= cicloPomodoros) {
      siguienteFase = 'descansoLargo'; // RF-02
    } else {
      siguienteFase = 'descansoCorto'; // RF-01
    }
  } else {
    siguienteFase = 'estudio'; // RF-03
  }

  return {
    ...state,
    fase: siguienteFase,
    faseAnterior: state.fase,
    status: 'detenido',
    startedAt: null,
    tiempoRestante: duraciones[siguienteFase], // duración completa de la siguiente (RF-07)
    duracionFase: duraciones[siguienteFase],   // valor con el que empieza (RF-07)
    // pomodoros se conserva intacto (no se incrementa ni reinicia aquí)
  };
}

/**
 * Reinicio completo de pomodoro: devuelve el estado inicial del pomodoro
 * (fase Estudio, 25:00, detenido, 0 pomodoros, startedAt/faseAnterior nulos).
 * No recibe parámetros; es la función base del botón "Reinicio Completo de
 * Pomodoro" (RF-08, RF-09).
 */
export function reinicioCompleto(): TimerState {
  return initialState();
}

/**
 * Recalcula al reabrir la app.
 * - Pausado: conserva el restante sin descontar.
 * - Corriendo: restante = restante_guardado - (now - startedAt).
 *   Si <= 0, la fase terminó (evento FASE_COMPLETADA).
 * (RF-13, Decisión 3, Constitución 1.2)
 */
export function recalculateOnResume(
  state: TimerState,
  now: number,
): TimerState | TickResult {
  if (state.status === 'pausado') {
    return state;
  }
  if (state.status === 'corriendo' && state.startedAt !== null) {
    const transcurrido = now - state.startedAt;
    const nuevoRestante = state.tiempoRestante - transcurrido;
    if (nuevoRestante <= 0) {
      return { tipo: 'FASE_COMPLETADA', faseAnterior: state.fase };
    }
    return {
      ...state,
      tiempoRestante: nuevoRestante,
      startedAt: now,
    };
  }
  return state;
}
