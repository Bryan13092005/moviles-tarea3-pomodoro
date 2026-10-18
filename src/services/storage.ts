/**
 * Persistencia atómica del estado del temporizador en AsyncStorage.
 * Clave única: @pomodoro/state.
 * Guarda tras cada cambio de estado; carga al iniciar la app.
 * 100 % local, sin red (RNF-01, Constitución 1.1).
 * (RF-13, Decisión 3, Constitución 1.2, §4)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type TimerState } from '../domain/timer';
import { type Configuracion } from '../domain/config';

const CLAVE = '@pomodoro/state';
const CLAVE_CONFIG = '@pomodoro/config';

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
  try {
    const parsed = JSON.parse(raw) as TimerState;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('El estado guardado no es un objeto válido');
    }
    return parsed;
  } catch (error: unknown) {
    // RF-04: distinguir "no hay previo" (null → fábrica) de "datos corruptos"
    // (error visible y la app no inicia).
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al leer el estado guardado: ${mensaje}`);
  }
}

/**
 * Guarda la configuración de ajustes del usuario (duraciones preferidas y ciclo de pomodoros).
 * Clave separada de @pomodoro/state: la configuración es un ajuste independiente del
 * ciclo de vida del temporizador (Decisión 1, plan §6).
 * Constitución §4: guardar antes de suspender.
 */
export async function guardarConfiguracion(config: Configuracion): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al guardar la configuración: ${mensaje}`);
  }
}

/**
 * Carga la configuración de ajustes. Devuelve null si no hay previo (instalación nueva;
 * el hook debe usar CONFIG_FABRICA en ese caso).
 */
export async function cargarConfiguracion(): Promise<Configuracion | null> {
  const raw = await AsyncStorage.getItem(CLAVE_CONFIG);
  if (raw === null) {
    return null;
  }
  return JSON.parse(raw) as Configuracion;
}
