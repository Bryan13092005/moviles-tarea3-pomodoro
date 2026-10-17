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
});
