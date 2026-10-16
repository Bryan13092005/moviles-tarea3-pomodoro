/**
 * Lógica pura del dominio del temporizador Pomodoro.
 * Todas las funciones reciben el estado y un `now` inyectado (timestamp),
 * nunca llaman a Date.now() ni a APIs de dispositivo.
 * Origen: Spec 001 (RF-02…RF-07, RF-10, RF-12, RF-14) y decisiones 1-9.
 */

import {
  DURACION_POR_FASE,
  POMODORO_CONFIG,
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
 * (RF-02, caso límite)
 */
export function start(state: TimerState, now: number): TimerState {
  if (state.status === 'corriendo') {
    return state;
  }
  const tiempoRestante =
    state.tiempoRestante <= 0 ? state.duracionFase : state.tiempoRestante;
  return {
    ...state,
    status: 'corriendo',
    startedAt: now,
    tiempoRestante,
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
 * avanza a la siguiente fase detenida con su duración completa.
 * Estudio -> descanso corto; al llegar al límite -> descanso largo y pomodoros = 0.
 * Descanso -> Estudio.
 * (RF-10, RF-12, Decisión 1/2/7, Constitución 2.2)
 */
export function completePhase(
  state: TimerState,
  duraciones: Record<FasePomodoro, number>,
): TimerState {
  let siguienteFase: FasePomodoro;
  let nuevosPomodoros = state.pomodoros;

  if (state.fase === 'estudio') {
    nuevosPomodoros = state.pomodoros + 1;
    if (nuevosPomodoros >= POMODORO_CONFIG.cicloPomodoros) {
      siguienteFase = 'descansoLargo';
      nuevosPomodoros = 0;
    } else {
      siguienteFase = 'descansoCorto';
    }
  } else {
    siguienteFase = 'estudio';
  }

  return {
    ...state,
    fase: siguienteFase,
    status: 'detenido',
    startedAt: null,
    tiempoRestante: duraciones[siguienteFase],
    duracionFase: duraciones[siguienteFase],
    pomodoros: nuevosPomodoros,
  };
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
