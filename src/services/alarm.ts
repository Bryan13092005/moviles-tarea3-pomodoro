/**
 * Puerto e implementación del servicio de alarma/vibración.
 * Implementación con expo-notifications: sonido + vibración, incluso en
 * modo silencio / No molestar / pantalla bloqueada (Constitución §1.3, Decisión 1).
 * El puerto permite ser mockeado en pruebas unitarias (no se toca el módulo nativo).
 * (RF-08, RF-09, RF-10, RF-11, Decisión 1/8/9)
 * El constructor registra el manejador de notificaciones en primer plano (RF-10).
 */

import * as Notifications from 'expo-notifications';

export interface IAlarmService {
  /** Solicita el permiso de notificaciones al SO. */
  requestPermission(): Promise<boolean>;
  /** Indica si el permiso está habilitado. */
  hasPermission(): Promise<boolean>;
  /** Suena/vibra la alarma de fin de fase. */
  play(): Promise<void>;
  /** Cancela notificaciones programadas (descarta alarma). */
  stop(): Promise<void>;
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

export class ExpoAlarmService implements IAlarmService {
  constructor() {
    registrarManejadorEnPrimerPlano();
  }

  async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async hasPermission(): Promise<boolean> {
    const status = await Notifications.getPermissionsAsync();
    return status.status === 'granted';
  }

  async play(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pomodoro',
        body: 'La fase ha finalizado.',
        sound: true,
        vibrate: [0, 250, 250, 250],
        priority: 'high' as const,
      },
      trigger: null, // notificación inmediata
    });
  }

  async stop(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const alarmService: IAlarmService = new ExpoAlarmService();
