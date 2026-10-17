/// <reference types="jest" />

/**
 * Pruebas del servicio de alarma/vibración con expo-notifications (mockeado).
 * RF-10, Decisión 1/8/9.
 */

import * as Notifications from 'expo-notifications';
import { ExpoAlarmService } from '../services/alarm';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
}));

describe('ExpoAlarmService', () => {
  it('registra el manejador para presentar notificaciones en primer plano', () => {
    new ExpoAlarmService();
    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
  });

  it('RF-01: play(fase) incluye el nombre de la fase finalizada en el body de la notificación', async () => {
    const service = new ExpoAlarmService();
    await service.play('descansoLargo');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          body: '¡Fase Descanso Largo finalizada!',
          sound: true,
          vibrate: [0, 250, 250, 250],
          priority: 'high',
        }),
      }),
    );
  });

  it('RF-01: play() sin fase conserva el body por defecto', async () => {
    const service = new ExpoAlarmService();
    await service.play();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          body: 'La fase ha finalizado.',
        }),
      }),
    );
  });
});
