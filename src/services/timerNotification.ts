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
// Los canales de Android son inmutables: el id lleva versión para que el cambio de importancia aplique.
const ID_CANAL = 'pomodoro-progreso-v3';
const CANALES_OBSOLETOS = ['pomodoro-progreso', 'pomodoro-progreso-v2'];

const NOMBRE_FASE: Record<FasePomodoro, string> = {
  estudio: 'Estudio',
  descansoCorto: 'Descanso corto',
  descansoLargo: 'Descanso largo',
};

const soportado = Platform.OS === 'android' || Platform.OS === 'ios';
let canalCreado: Promise<string> | null = null;

function asegurarCanal(): Promise<string> {
  if (!canalCreado) {
    // Elimina los canales viejos (LOW/silenciados) que Android conserva con su configuración.
    for (const id of CANALES_OBSOLETOS) {
      void notifee.deleteChannel(id).catch(() => undefined);
    }
    canalCreado = notifee.createChannel({
      id: ID_CANAL,
      name: 'Temporizador en curso',
      importance: AndroidImportance.DEFAULT, // "Predeterminada" (LOW aparecía como silenciada)
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
        // El sistema la retira al llegar a 0 para que el cronómetro no corra en negativo.
        timeoutAfter: corriendo ? Math.max(1, finMs - Date.now()) : undefined,
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
