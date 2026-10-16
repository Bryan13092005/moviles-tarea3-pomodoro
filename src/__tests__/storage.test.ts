/// <reference types="jest" />

/**
 * Pruebas de persistencia del temporizador con AsyncStorage (mockeado).
 * RF-13, RNF-01, Decisión 3, Constitución 1.1/1.2/4.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { guardarEstado, cargarEstado } from '../services/storage';
import { initialState } from '../domain/timer';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  const modulo: any = {
    __store: store,
    getItem: jest.fn((key: string) =>
      Promise.resolve(modulo.__store[key] ?? null),
    ),
    setItem: jest.fn((key: string, value: string) => {
      modulo.__store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete modulo.__store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(modulo.__store).forEach((k) => delete modulo.__store[k]);
      return Promise.resolve();
    }),
  };
  return modulo;
});

const MOCK_STATE = {
  ...initialState(),
  tiempoRestante: 1200,
  pomodoros: 1,
  status: 'pausado' as const,
};

describe('storage', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage as any).__store = {};
  });

  it('guarda y carga el estado correctamente', async () => {
    await guardarEstado(MOCK_STATE);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@pomodoro/state',
      JSON.stringify(MOCK_STATE),
    );

    const cargado = await cargarEstado();
    expect(cargado).toEqual(MOCK_STATE);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@pomodoro/state');
  });

  it('devuelve null cuando no hay estado previo (instalación nueva)', async () => {
    const cargado = await cargarEstado();
    expect(cargado).toBeNull();
  });

  it('sobrescribe el estado previo al guardar de nuevo', async () => {
    await guardarEstado(MOCK_STATE);
    const modificado = { ...MOCK_STATE, tiempoRestante: 600 };
    await guardarEstado(modificado);
    const cargado = await cargarEstado();
    expect(cargado?.tiempoRestante).toBe(600);
  });
});
