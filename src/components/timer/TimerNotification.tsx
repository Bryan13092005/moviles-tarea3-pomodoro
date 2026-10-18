/**
 * Componente sin interfaz: refleja el temporizador en una notificación
 * persistente con cronómetro nativo mientras corre o está en pausa.
 * Solo se actualiza cuando cambia el estado, no cada segundo.
 */

import { useEffect } from 'react';

import { type TimerState } from '@/domain/timer';
import { mostrarProgreso, ocultarProgreso } from '@/services/timerNotification';

export type TimerNotificationProps = {
  state: TimerState;
};

export function TimerNotification({ state }: TimerNotificationProps) {
  const { status, fase, startedAt, tiempoRestante } = state;

  useEffect(() => {
    if (status === 'detenido') {
      void ocultarProgreso();
      return;
    }
    const corriendo = status === 'corriendo' && startedAt !== null;
    // startedAt y tiempoRestante están en segundos (dominio); Notifee usa ms.
    const finMs = corriendo ? (startedAt + tiempoRestante) * 1000 : 0;
    void mostrarProgreso(fase, tiempoRestante, corriendo, finMs);
  }, [status, fase, startedAt, tiempoRestante]);

  useEffect(() => () => void ocultarProgreso(), []);

  return null;
}
