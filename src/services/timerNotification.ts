/**
 * Notificación persistente con cronómetro nativo (Notifee). En Android la
 * cuenta regresiva la dibuja el sistema, por lo que sigue corriendo aunque la
 * app esté en segundo plano. Es independiente de la alarma de fin de fase
 * (alarm.ts). Requiere development build (no funciona en Expo Go).
 */

import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { Platform } from 'react-native';

import { type FasePomodoro } from '../constants/pomodoro';
import { formatMMSS } from '../domain/timer';

const ID_NOTIFICACION = 'pomodoro-progreso';
const ID_CANAL = 'pomodoro-progreso';

const NOMBRE_FASE: Record<FasePomodoro, string> = {
  estudio: 'Estudio',
  descansoCorto: 'Descanso corto',
  descansoLargo: 'Descanso largo',
};

const soportado = Platform.OS === 'android' || Platform.OS === 'ios';
let canalCreado: Promise<string> | null = null;

function asegurarCanal(): Promise<string> {
  if (!canalCreado) {
    canalCreado = notifee.createChannel({
      id: ID_CANAL,
      name: 'Temporizador en curso',
      importance: AndroidImportance.LOW, // sin sonido ni vibración
      visibility: AndroidVisibility.PUBLIC,
    });
  }
  return canalCreado;
}

/**
 * Muestra o actualiza la notificación. Corriendo: cuenta regresiva nativa hasta
 * `finMs`. Pausado: muestra el tiempo restante fijo.
 */
export async function mostrarProgreso(
  fase: FasePomodoro,
  segundosRestantes: number,
  corriendo: boolean,
  finMs: number,
): Promise<void> {
  if (!soportado) return;
  try {
    const channelId = await asegurarCanal();
    await notifee.displayNotification({
      id: ID_NOTIFICACION,
      title: `${NOMBRE_FASE[fase]}${corriendo ? '' : ' (en pausa)'}`,
      body: corriendo ? 'Tiempo restante' : formatMMSS(segundosRestantes),
      android: {
        channelId,
        ongoing: true,
        onlyAlertOnce: true,
        autoCancel: false,
        showChronometer: corriendo,
        chronometerDirection: 'down',
        timestamp: corriendo ? finMs : undefined,
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Sin permiso o fallo del SO: el temporizador en pantalla no se ve afectado.
  }
}

export async function ocultarProgreso(): Promise<void> {
  if (!soportado) return;
  try {
    await notifee.cancelNotification(ID_NOTIFICACION);
  } catch {
    // Nada que ocultar.
  }
}
