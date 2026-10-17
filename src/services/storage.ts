/**
 * Persistencia atómica del estado del temporizador en AsyncStorage.
 * Clave única: @pomodoro/state.
 * Guarda tras cada cambio de estado; carga al iniciar la app.
 * 100 % local, sin red (RNF-01, Constitución 1.1).
 * (RF-13, Decisión 3, Constitución 1.2, §4)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type TimerState } from '../domain/timer';

const CLAVE = '@pomodoro/state';

/**
 * Guarda el estado de forma sincrónica/atómica tras cada cambio.
 * Constitución §4: evitar pérdida de estado si el SO mata la app.
 */
export async function guardarEstado(state: TimerState): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(state));
  } catch (error: unknown) {
    // RF-05: no bloquear la app por una falla de almacenamiento; propagar el
    // motivo para que el hook lo exponga en un banner no bloqueante.
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al guardar el estado: ${mensaje}`);
  }
}

/**
 * Carga el estado guardado. Devuelve null si no hay previo (instalación nueva).
 */
export async function cargarEstado(): Promise<TimerState | null> {
  const raw = await AsyncStorage.getItem(CLAVE);
  if (raw === null) {
    return null;
  }
  return JSON.parse(raw) as TimerState;
}
