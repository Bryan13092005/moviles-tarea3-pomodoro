/// <reference types="jest" />

/**
 * Pruebas de persistencia del temporizador con AsyncStorage (mockeado).
 * RF-08, RF-09, RNF-01, Constitución 1.1/1.2/4.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { guardarEstado, cargarEstado, guardarConfiguracion, cargarConfiguracion } from '../services/storage';
import {
  initialState,
  recalculateOnResume,
  type FaseCompletadaEvent,
  type TimerState,
  type TickResult,
} from '../domain/timer';
import { type Configuracion, CONFIG_FABRICA } from '../domain/config';

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

  it('RF-05: AsyncStorage rechaza setItem -> guardarEstado rechaza con el motivo y no lanza sincrónicamente', async () => {
    const motivo = 'No hay espacio en el dispositivo';
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error(motivo));
    // Debe rechazar la promesa con el motivo (no lanzar de forma síncrona ni bloquear)
    await expect(guardarEstado(MOCK_STATE)).rejects.toThrow(motivo);
  });
});

describe('configuración (RF-03)', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage as any).__store = {};
  });

  it('guarda y carga la configuración correctamente con clave @pomodoro/config', async () => {
    const config: Configuracion = {
      estudio: 25 * 60,
      descansoCorto: 5 * 60,
      descansoLargo: 15 * 60,
      cicloPomodoros: 4,
    };
    await guardarConfiguracion(config);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@pomodoro/config',
      JSON.stringify(config),
    );

    const cargado = await cargarConfiguracion();
    expect(cargado).toEqual(config);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@pomodoro/config');
  });

  it('devuelve null cuando no hay configuración previa (instalación nueva)', async () => {
    const cargado = await cargarConfiguracion();
    expect(cargado).toBeNull();
  });

  it('sobrescribe la configuración previa al guardar de nuevo', async () => {
    const config1: Configuracion = { ...CONFIG_FABRICA, estudio: 30 * 60 };
    const config2: Configuracion = { ...CONFIG_FABRICA, estudio: 20 * 60 };
    await guardarConfiguracion(config1);
    await guardarConfiguracion(config2);
    const cargado = await cargarConfiguracion();
    expect(cargado?.estudio).toBe(20 * 60);
  });

  it('RF-03: la configuración persiste tras cierre simulado (misma clave AsyncStorage)', async () => {
    const config: Configuracion = { ...CONFIG_FABRICA, cicloPomodoros: 5 };
    await guardarConfiguracion(config);
    // Simular cierre de app: el mock __store persiste entre llamadas
    const cargado = await cargarConfiguracion();
    expect(cargado).toEqual(config);
  });

  it('RF-03: AsyncStorage rechaza setItem -> guardarConfiguracion rechaza con el motivo', async () => {
    const motivo = 'No hay espacio en el dispositivo';
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error(motivo));
    await expect(guardarConfiguracion(CONFIG_FABRICA)).rejects.toThrow(motivo);
  });
});
