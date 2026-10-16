/**
 * Flujo de permiso de notificaciones con explicación contextual
 * antes de solicitarlo al sistema operativo (Constitución §1.3, RNF-02).
 * (RF-08, RF-09)
 */

import { type IAlarmService } from './alarm';

/** Texto que la UI muestra al usuario para justificar el permiso. */
export const MENSAJE_PERMISO_ALARMA =
  'Para que el temporizador avise al terminar una fase —incluso con el teléfono bloqueado o en silencio— necesitamos activar las notificaciones y la vibración.';

/**
 * Solicita el permiso de alarma al SO a través del servicio de alarma.
 * Devuelve true si se concedió.
 */
export async function solicitarPermisoAlarma(
  alarmService: IAlarmService,
): Promise<boolean> {
  return alarmService.requestPermission();
}
