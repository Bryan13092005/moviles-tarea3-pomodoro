/// <reference types="jest" />

/**
 * Pruebas del servicio de alarma/vibración con expo-notifications (mockeado).
 * RF-10, Decisión 1/8/9.
 */

import * as Notifications from 'expo-notifications';
import { ExpoAlarmService } from '../services/alarm';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  dismissAllNotificationsAsync: jest.fn(async () => undefined),
  AndroidImportance: { MAX: 5 },
  AndroidAudioUsage: { ALARM: 4 },
  AndroidAudioContentType: { SONIFICATION: 4 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  AndroidNotificationPriority: { HIGH: 'high' },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

beforeEach(() => jest.clearAllMocks());

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
        content: expect.objectContaining({ body: 'La fase ha finalizado.' }),
      }),
    );
  });

  it('programa una serie repetida de avisos y cancela toda la serie', async () => {
    const service = new ExpoAlarmService();
    await service.scheduleEnd('estudio', Date.now() + 60_000);
    const llamadas = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length;
    expect(llamadas).toBeGreaterThan(1);
    await service.cancelScheduledEnd();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(llamadas);
  });
});
