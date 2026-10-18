/**
 * Puerto e implementación del servicio de alarma/vibración.
 * Implementación con expo-notifications: sonido + vibración, incluso en
 * modo silencio / No molestar / pantalla bloqueada (Constitución §1.3, Decisión 1).
 * El puerto permite ser mockeado en pruebas unitarias (no se toca el módulo nativo).
 * (RF-08, RF-09, RF-10, RF-11, Decisión 1/8/9)
 * El constructor registra el manejador de notificaciones en primer plano (RF-10).
 */

import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { FasePomodoro } from '../constants/pomodoro';

/** Nombre legible de cada fase para mostrar en la notificación (RF-01). */
const NOMBRE_FASE: Record<FasePomodoro, string> = {
  estudio: 'Estudio',
  descansoCorto: 'Descanso Corto',
  descansoLargo: 'Descanso Largo',
};

export interface IAlarmService {
  /** Solicita el permiso de notificaciones al SO. */
  requestPermission(): Promise<boolean>;
  /** Indica si el permiso está habilitado. */
  hasPermission(): Promise<boolean>;
  /** Suena/vibra la alarma de fin de fase. */
  play(fase?: FasePomodoro): Promise<void>;
  /** Cancela notificaciones programadas (descarta alarma). */
  stop(): Promise<void>;
  /** Programa en el SO la notificación de fin de fase para `finMs` (funciona en segundo plano). */
  scheduleEnd(fase: FasePomodoro, finMs: number): Promise<void>;
  /** Cancela la notificación de fin de fase programada. */
  cancelScheduledEnd(): Promise<void>;
}

const ID_FIN_FASE = 'pomodoro-fin-fase';
// Los canales de Android son inmutables una vez creados: el id lleva versión.
const ID_CANAL_ALARMA = 'pomodoro-alarma-v2';
const PATRON_VIBRACION = [0, 1000, 500, 1000, 500, 1000];
// La notificación se repite para simular una alarma recurrente (~30 s, igual que el silencio automático).
const REPETICIONES = 5;
const INTERVALO_REPETICION_MS = 6000;
// Mientras la alarma de fin de fase está activa, cancelScheduledEnd no debe borrar su serie
// (el cambio de fase dispara esa limpieza justo después de play()).
let alarmaEnCurso = false;
let canalAlarma: Promise<unknown> | null = null;

/** Canal con uso de audio ALARM: suena en silencio, vibración y No molestar. */
function asegurarCanalAlarma(): Promise<unknown> {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!canalAlarma) {
    canalAlarma = Notifications.setNotificationChannelAsync(ID_CANAL_ALARMA, {
      name: 'Fin de etapa (alarma)',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      enableVibrate: true,
      vibrationPattern: PATRON_VIBRACION,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
  return canalAlarma;
}

async function programarSerie(
  fase: FasePomodoro | undefined,
  inicioMs: number,
): Promise<void> {
  await asegurarCanalAlarma();
  for (let i = 0; i < REPETICIONES; i++) {
    const fecha = new Date(Math.max(inicioMs + i * INTERVALO_REPETICION_MS, Date.now() + 500));
    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_FIN_FASE}-${i}`, // mismo id: reemplaza en vez de duplicar
      content: contenidoFin(fase),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fecha,
        channelId: ID_CANAL_ALARMA,
      },
    });
  }
}

/**
 * Indica cómo se presenta una alarma cuando llega mientras la aplicación está
 * en primer plano.
 *
 * Expo solo programa la notificación (`trigger: null`); la presentación en
 * pantalla depende de un manejador registrado. Sin este manejador, la notificación
 * programada no se muestra mientras la app está abierta y solo aparece al
 * volver a ella (Constitución §1.3: la alarma debe avisarse).
 */
function registrarManejadorEnPrimerPlano(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

function contenidoFin(fase?: FasePomodoro) {
  return {
    title: 'Pomodoro',
    body: fase ? `¡Fase ${NOMBRE_FASE[fase]} finalizada!` : 'La fase ha finalizado.',
    sound: true,
    vibrate: PATRON_VIBRACION,
    priority: 'high' as const,
  };
}

export class ExpoAlarmService implements IAlarmService {
  constructor() {
    registrarManejadorEnPrimerPlano();
  }

  async requestPermission(): Promise<boolean> {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.status === 'granted') return true;
    // Si el SO ya no permite mostrar el diálogo, el único camino es Ajustes.
    if (!actual.canAskAgain) {
      await Linking.openSettings();
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async hasPermission(): Promise<boolean> {
    const status = await Notifications.getPermissionsAsync();
    return status.status === 'granted';
  }

  async play(fase?: FasePomodoro): Promise<void> {
    alarmaEnCurso = true;
    // Mismos identificadores que scheduleEnd: reemplaza la serie del SO en vez de duplicarla.
    await programarSerie(fase, Date.now());
  }

  async scheduleEnd(fase: FasePomodoro, finMs: number): Promise<void> {
    alarmaEnCurso = false;
    await programarSerie(fase, finMs);
  }

  async cancelScheduledEnd(): Promise<void> {
    if (alarmaEnCurso) return;
    for (let i = 0; i < REPETICIONES; i++) {
      await Notifications.cancelScheduledNotificationAsync(`${ID_FIN_FASE}-${i}`);
    }
  }

  async stop(): Promise<void> {
    alarmaEnCurso = false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  }
}

export const alarmService: IAlarmService = new ExpoAlarmService();
