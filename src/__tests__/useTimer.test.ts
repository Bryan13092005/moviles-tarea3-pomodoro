/// <reference types="jest" />

/**
 * Pruebas del hook orquestador useTimer.
 * Mockea AsyncStorage, el servicio de alarma y el flujo de permisos para
 * probar el hook sin tocar APIs de dispositivo ni efectos temporales reales.
 * Cubre RF-01, RF-02, RF-03, RF-05, RF-07, RF-08, RF-09, RF-10, RNF-02.
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import { useTimer } from '../hooks/useTimer';

jest.useFakeTimers();
jest.setSystemTime(1_000_000_000); // ahoraEnSegundos() determinista en pruebas

jest.mock('@/services/storage', () => ({
  guardarEstado: jest.fn(),
  cargarEstado: jest.fn(),
}));
jest.mock('@/services/alarm', () => ({
  alarmService: {
    play: jest.fn(),
    stop: jest.fn(),
    requestPermission: jest.fn(),
    hasPermission: jest.fn(),
  },
}));
jest.mock('@/services/permissions', () => ({
  solicitarPermisoAlarma: jest.fn(),
  MENSAJE_PERMISO_ALARMA: 'mensaje de permiso de prueba',
}));

import { guardarEstado, cargarEstado } from '@/services/storage';
import { solicitarPermisoAlarma } from '@/services/permissions';
import { initialState } from '@/domain/timer';

let hookResult: any;
let instance: any;
function Probe() {
  hookResult = useTimer();
  return null;
}

function renderHook() {
  instance = create(React.createElement(Probe));
  return instance;
}

beforeEach(() => {
  jest.clearAllMocks();
  (cargarEstado as jest.Mock).mockResolvedValue(null);
  (solicitarPermisoAlarma as jest.Mock).mockResolvedValue(true);
  (guardarEstado as jest.Mock).mockResolvedValue(undefined);
  hookResult = null;
  instance = null;
});

afterEach(() => {
  instance?.unmount();
  instance = null;
});

describe('useTimer – persistencia', () => {
  it('RF-05: al fallar guardarEstado expone errorPersistencia y no tira la app', async () => {
    const motivo = 'Fallo de almacenamiento';
    (guardarEstado as jest.Mock).mockRejectedValueOnce(new Error(motivo));

    renderHook();
    // Flush efectos de montaje (cargarEstado + permiso)
    await act(async () => {});

    await act(async () => {
      await hookResult.iniciar();
    });

    expect(hookResult.errorPersistencia).toContain(motivo);
    expect(guardarEstado).toHaveBeenCalled();
  });
});

describe('useTimer – reinicio completo de pomodoro', () => {
  it('RF-08/RF-09: reiniciarCompleto() restaura initialState y persiste', async () => {
    renderHook();
    await act(async () => {});

    // Primero dejar el estado modificado (iniciar)
    await act(async () => {
      await hookResult.iniciar();
    });
    expect(hookResult.state.status).toBe('corriendo');
    expect(hookResult.state.pomodoros).toBeGreaterThanOrEqual(0);

    await act(async () => {
      await hookResult.reiniciarCompleto();
    });

    expect(hookResult.state).toEqual({
      fase: 'estudio',
      status: 'detenido',
      tiempoRestante: 1500,
      duracionFase: 1500,
      pomodoros: 0,
      startedAt: null,
      faseAnterior: null,
    });
    expect(hookResult.tiempoMostrar).toBe(1500);
    expect(guardarEstado).toHaveBeenCalledWith(hookResult.state);
  });
});

describe('useTimer – permiso de notificaciones', () => {
  it('RF-10: sin permiso, iniciar no arranca el temporizador y muestra banner', async () => {
    (solicitarPermisoAlarma as jest.Mock).mockResolvedValue(false);

    renderHook();
    await act(async () => {});

    await act(async () => {
      await hookResult.iniciar();
    });

    expect(hookResult.state.status).toBe('detenido');
    expect(hookResult.mostrarBannerPermiso).toBe(true);
    expect(hookResult.permisoConcedido).toBe(false);
    expect(guardarEstado).not.toHaveBeenCalled();
  });
});

describe('useTimer – carga al montar y recálculo por timestamps', () => {
  it('RF-07: carga el estado guardado al montar', async () => {
    const guardado = {
      ...initialState(),
      fase: 'descansoCorto',
      status: 'pausado',
      tiempoRestante: 200,
      duracionFase: 300,
      pomodoros: 2,
      startedAt: null,
      faseAnterior: 'estudio',
    };
    (cargarEstado as jest.Mock).mockResolvedValue(guardado);

    renderHook();
    await act(async () => {});

    expect(hookResult.state).toEqual(guardado);
    expect(cargarEstado).toHaveBeenCalled();
  });

  it('RF-01/RF-02/RNF-02: si estaba corriendo, recalcula restante con timestamps al reabrir', async () => {
    const ahoraSegundos = 1_000_000; // Date.now()/1000 con setSystemTime(1_000_000_000)
    const startedAt = ahoraSegundos - 100; // empezó hace 100s
    const guardado = {
      ...initialState(),
      fase: 'estudio',
      status: 'corriendo',
      tiempoRestante: 1000,
      duracionFase: 1500,
      pomodoros: 0,
      startedAt,
      faseAnterior: null,
    };
    (cargarEstado as jest.Mock).mockResolvedValue(guardado);

    renderHook();
    await act(async () => {});

    // 1000 - 100 = 900
    expect(hookResult.state.tiempoRestante).toBe(900);
    expect(hookResult.state.status).toBe('corriendo');
    expect(hookResult.state.startedAt).toBe(ahoraSegundos);
  });

  it('RF-03: si estaba pausado, conserva el restante sin descontar', async () => {
    const guardado = {
      ...initialState(),
      fase: 'estudio',
      status: 'pausado',
      tiempoRestante: 700,
      duracionFase: 1500,
      pomodoros: 0,
      startedAt: null,
      faseAnterior: null,
    };
    (cargarEstado as jest.Mock).mockResolvedValue(guardado);

    renderHook();
    await act(async () => {});

    expect(hookResult.state.status).toBe('pausado');
    expect(hookResult.state.tiempoRestante).toBe(700);
    expect(hookResult.state.startedAt).toBeNull();
  });
});
