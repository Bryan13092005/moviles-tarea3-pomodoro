/**
 * Configuración pura del ajuste de tiempos del Pomodoro (Spec 005).
 * Tipos, rangos y funciones de validación sin depender de React ni del
 * estado del temporizador. Origen: HU-005, decisiones 1, 2, 7.
 */

export type CampoAjuste = 'estudio' | 'descansoCorto' | 'descansoLargo' | 'cicloPomodoros';

export interface Configuracion {
  estudio: number;           // segundos
  descansoCorto: number;     // segundos
  descansoLargo: number;     // segundos
  cicloPomodoros: number;    // cantidad
}

export const CONFIG_FABRICA: Configuracion = {
  estudio: 25 * 60,
  descansoCorto: 5 * 60,
  descansoLargo: 15 * 60,
  cicloPomodoros: 4,
};

export const RANGOS: Record<CampoAjuste, { min: number; max: number; unidad: 'min' | 'unidades' }> = {
  estudio: { min: 1, max: 60, unidad: 'min' },
  descansoCorto: { min: 1, max: 15, unidad: 'min' },
  descansoLargo: { min: 1, max: 30, unidad: 'min' },
  cicloPomodoros: { min: 3, max: 8, unidad: 'unidades' },
};

export function validarCampo(
  campo: CampoAjuste,
  valor: string | number,
): { valido: boolean; rango?: { min: number; max: number }; mensaje?: string } {
  const rango = RANGOS[campo];
  const numero = typeof valor === 'string' ? Number(valor) : valor;

  if (valor === '' || Number.isNaN(numero) || numero <= 0) {
    return { valido: false, mensaje: 'valor inválido', rango };
  }

  if (numero < rango.min || numero > rango.max) {
    return { valido: false, mensaje: 'fuera de rango', rango };
  }

  return { valido: true, rango };
}

export function validarConfiguracion(
  config: Partial<Configuracion>,
): { valido: boolean; errores: Record<CampoAjuste, string> } {
  const errores: Record<string, string> = {};

  for (const campo of Object.keys(config) as CampoAjuste[]) {
    const valor = config[campo];
    if (valor === undefined) {
      continue;
    }
    const resultado = validarCampo(campo, valor);
    if (!resultado.valido) {
      errores[campo] = resultado.mensaje ?? 'valor inválido';
    }
  }

  return { valido: Object.keys(errores).length === 0, errores: errores as Record<CampoAjuste, string> };
}

export function puedeCambiarCicloPomodoros(
  pomodorosCompletados: number,
  nuevoMaximo: number,
): boolean {
  return pomodorosCompletados <= nuevoMaximo;
}
