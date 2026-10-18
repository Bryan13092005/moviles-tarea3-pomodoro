/// <reference types="jest" />

/**
 * Pruebas unitarias de validación pura de configuración (Spec 005).
 * Funciones puras de src/domain/config.ts: sin React, sin estado del temporizador.
 * Cubre RF-01, RF-05, RF-06, RF-07, RF-11.
 */

import {
  validarCampo,
  validarConfiguracion,
  puedeCambiarCicloPomodoros,
  RANGOS,
  CONFIG_FABRICA,
  type CampoAjuste,
  type Configuracion,
} from '../domain/config';

const campos: CampoAjuste[] = [
  'estudio',
  'descansoCorto',
  'descansoLargo',
  'cicloPomodoros',
];

describe('validarCampo', () => {
  it.each(campos)('campo vacío (%s) es inválido', (campo) => {
    const resultado = validarCampo(campo, '');
    expect(resultado.valido).toBe(false);
    expect(resultado.rango).toEqual(RANGOS[campo]);
    expect(resultado.mensaje).toBeDefined();
  });

  it.each(campos)('valor cero (%s) es inválido', (campo) => {
    const resultado = validarCampo(campo, 0);
    expect(resultado.valido).toBe(false);
    expect(resultado.rango).toEqual(RANGOS[campo]);
  });

  it.each(campos)('string "0" (%s) es inválido', (campo) => {
    const resultado = validarCampo(campo, '0');
    expect(resultado.valido).toBe(false);
    expect(resultado.rango).toEqual(RANGOS[campo]);
  });

  it.each(campos)('por debajo del mínimo (%s) es inválido', (campo) => {
    const valor = RANGOS[campo].min - 1;
    const resultado = validarCampo(campo, valor);
    expect(resultado.valido).toBe(false);
    expect(resultado.rango).toEqual(RANGOS[campo]);
    // min = 1 → valor = 0 (cero → 'valor inválido'); min = 3 → valor = 2 ('fuera de rango')
    const esperado = valor <= 0 ? 'valor inválido' : 'fuera de rango';
    expect(resultado.mensaje).toBe(esperado);
  });

  it.each(campos)('por encima del máximo (%s) es inválido', (campo) => {
    const resultado = validarCampo(campo, RANGOS[campo].max + 1);
    expect(resultado.valido).toBe(false);
    expect(resultado.mensaje).toBe('fuera de rango');
  });

  it.each(campos)('dentro del rango (%s) es válido', (campo) => {
    const valorValido = Math.floor(
      (RANGOS[campo].min + RANGOS[campo].max) / 2,
    );
    const resultado = validarCampo(campo, valorValido);
    expect(resultado.valido).toBe(true);
    expect(resultado.rango).toEqual(RANGOS[campo]);
    expect(resultado.mensaje).toBeUndefined();
  });

  it('valores en los límites del rango son válidos', () => {
    expect(validarCampo('estudio', 1).valido).toBe(true);
    expect(validarCampo('estudio', 60).valido).toBe(true);
    expect(validarCampo('descansoCorto', 1).valido).toBe(true);
    expect(validarCampo('descansoCorto', 15).valido).toBe(true);
    expect(validarCampo('descansoLargo', 1).valido).toBe(true);
    expect(validarCampo('descansoLargo', 30).valido).toBe(true);
    expect(validarCampo('cicloPomodoros', 3).valido).toBe(true);
    expect(validarCampo('cicloPomodoros', 8).valido).toBe(true);
  });

  it('devuelve el rango permitido junto al resultado', () => {
    const resultado = validarCampo('estudio', 25);
    expect(resultado.rango).toEqual({ min: 1, max: 60, unidad: 'min' });
  });
});

describe('validarConfiguracion', () => {
  it('configuración completa válida no produce errores', () => {
    // Los campos de tiempo se expresan en minutos (rango RANGOS), ciclo en unidades
    const resultado = validarConfiguracion({
      estudio: 25,
      descansoCorto: 5,
      descansoLargo: 15,
      cicloPomodoros: 4,
    } as Partial<Configuracion>);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });

  it('varios campos inválidos acumulan errores por campo', () => {
    const resultado = validarConfiguracion({
      estudio: 0,
      descansoCorto: 100,
      cicloPomodoros: 2,
    } as Partial<Configuracion>);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.estudio).toBeDefined();
    expect(resultado.errores.descansoCorto).toBeDefined();
    expect(resultado.errores.cicloPomodoros).toBeDefined();
    expect(resultado.errores.descansoLargo).toBeUndefined();
  });

  it('objeto vacío es válido (no hay campos que validar)', () => {
    const resultado = validarConfiguracion({});
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });
});

describe('puedeCambiarCicloPomodoros', () => {
  it('contador actual igual al nuevo máximo permite el cambio', () => {
    expect(puedeCambiarCicloPomodoros(4, 4)).toBe(true);
  });

  it('contador actual menor al nuevo máximo permite el cambio', () => {
    expect(puedeCambiarCicloPomodoros(2, 4)).toBe(true);
    expect(puedeCambiarCicloPomodoros(3, 8)).toBe(true);
  });

  it('contador actual mayor al nuevo máximo rechaza el cambio', () => {
    expect(puedeCambiarCicloPomodoros(5, 4)).toBe(false);
    expect(puedeCambiarCicloPomodoros(6, 5)).toBe(false);
    expect(puedeCambiarCicloPomodoros(8, 3)).toBe(false);
  });

  it('contador actual 0 con cualquier nuevo máximo permite el cambio', () => {
    expect(puedeCambiarCicloPomodoros(0, 3)).toBe(true);
  });
});
