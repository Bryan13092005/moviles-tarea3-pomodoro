/// <reference types="jest" />

/**
 * Pruebas de persistencia del temporizador con AsyncStorage (mockeado).
 * RF-08, RF-09, RNF-01, Constitución 1.1/1.2/4.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { guardarEstado, cargarEstado } from '../services/storage';
import {
  initialState,
  recalculateOnResume,
  type FaseCompletadaEvent,
  type TimerState,
  type TickResult,
} from '../domain/timer';

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

const MOCK_STATE: TimerState = {
  ...initialState(),
  fase: 'descansoLargo',
  status: 'pausado',
  tiempoRestante: 600,
  duracionFase: 900,
  pomodoros: 4,
  startedAt: null,
  faseAnterior: 'estudio',
};

describe('storage', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage as any).__store = {};
  });

  it('guarda y carga el estado correctamente, incluyendo faseAnterior y pomodoros (RF-08, RNF-01)', async () => {
    await guardarEstado(MOCK_STATE);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@pomodoro/state',
      JSON.stringify(MOCK_STATE),
    );

    const cargado = await cargarEstado();
    expect(cargado).toEqual(MOCK_STATE);
    expect(cargado?.faseAnterior).toBe('estudio');
    expect(cargado?.pomodoros).toBe(4);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@pomodoro/state');
  });

  it('devuelve null cuando no hay estado previo (instalación nueva)', async () => {
    const cargado = await cargarEstado();
    expect(cargado).toBeNull();
  });

  it('sobrescribe el estado previo al guardar de nuevo', async () => {
    await guardarEstado(MOCK_STATE);
    const modificado = { ...MOCK_STATE, tiempoRestante: 300 };
    await guardarEstado(modificado);
    const cargado = await cargarEstado();
    expect(cargado?.tiempoRestante).toBe(300);
  });

  it('RF-08: fase pausada al reabrir conserva el tiempo restante sin descontar', async () => {
    await guardarEstado(MOCK_STATE);
    const cargado = await cargarEstado();
    expect(cargado?.status).toBe('pausado');
    expect(cargado?.tiempoRestante).toBe(600); // sin descontar
    expect(cargado?.startedAt).toBeNull();
  });

  it('RF-09: fase corriendo expirada al reabrir devuelve evento FASE_COMPLETADA', async () => {
    const expirado: TimerState = {
      ...initialState(),
      fase: 'estudio',
      status: 'corriendo',
      tiempoRestante: 5,
      duracionFase: 1500,
      pomodoros: 0,
      startedAt: 100,
      faseAnterior: null,
    };
    await guardarEstado(expirado);
    const cargado = await cargarEstado();
    expect(cargado).not.toBeNull();

    // Al recalcular con un now mucho mayor, la fase expiró (RF-09)
    const resultado = recalculateOnResume(
      cargado as TimerState,
      200,
    ) as TickResult | TimerState;
    const ev = resultado as FaseCompletadaEvent;
    expect(ev.tipo).toBe('FASE_COMPLETADA');
    expect(ev.faseAnterior).toBe('estudio');
  });
});
