/**
 * Constantes y tipos de dominio del temporizador Pomodoro.
 * Valores por defecto según Spec 001 y Constitución §2.3.
 */

export const POMODORO_CONFIG = {
  /** Tiempo de Estudio: 25 minutos (1500 s) */
  estudio: 1 * 60,
  /** Descanso Corto: 5 minutos (300 s) */
  descansoCorto: 5 * 60,
  /** Descanso Largo: 15 minutos (900 s) */
  descansoLargo: 15 * 60,
  /** Cantidad de pomodoros por ciclo antes del Descanso Largo */
  cicloPomodoros: 4,
} as const;

export type FasePomodoro = 'estudio' | 'descansoCorto' | 'descansoLargo';

export const DURACION_POR_FASE: Record<FasePomodoro, number> = {
  estudio: POMODORO_CONFIG.estudio,
  descansoCorto: POMODORO_CONFIG.descansoCorto,
  descansoLargo: POMODORO_CONFIG.descansoLargo,
};
