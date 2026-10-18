/**
 * Constantes y tipos de dominio del temporizador Pomodoro.
 * Valores por defecto según Spec 001 y Constitución §2.3.
 */

import { CONFIG_FABRICA } from '../domain/config';

/** Valores de fábrica: única fuente (CONFIG_FABRICA). Para pruebas, cambiarlos allí. */
export const POMODORO_CONFIG = CONFIG_FABRICA;

export type FasePomodoro = 'estudio' | 'descansoCorto' | 'descansoLargo';

export const DURACION_POR_FASE: Record<FasePomodoro, number> = {
  estudio: POMODORO_CONFIG.estudio,
  descansoCorto: POMODORO_CONFIG.descansoCorto,
  descansoLargo: POMODORO_CONFIG.descansoLargo,
};
