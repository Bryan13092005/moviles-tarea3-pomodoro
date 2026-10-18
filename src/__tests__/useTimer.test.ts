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
  guardarConfiguracion: jest.fn(),
  cargarConfiguracion: jest.fn(),
}));
jest.mock('@/services/alarm', () => ({
  alarmService: {
    play: jest.fn(),
    stop: jest.fn(),
    scheduleEnd: jest.fn(async () => undefined),
    cancelScheduledEnd: jest.fn(async () => undefined),
    requestPermission: jest.fn(),
    hasPermission: jest.fn(),
  },
}));

import { alarmService } from '@/services/alarm';
jest.mock('@/services/permissions', () => ({
  solicitarPermisoAlarma: jest.fn(),
  MENSAJE_PERMISO_ALARMA: 'mensaje de permiso de prueba',
}));

import { guardarEstado, cargarEstado, guardarConfiguracion, cargarConfiguracion } from '@/services/storage';
import { solicitarPermisoAlarma } from '@/services/permissions';
import { initialState } from '@/domain/timer';
import { CONFIG_FABRICA } from '@/domain/config';

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
  jest.setSystemTime(1_000_000_000); // reloj falso determinista para cada prueba
  (cargarEstado as jest.Mock).mockResolvedValue(null);
  (cargarConfiguracion as jest.Mock).mockResolvedValue(null);
  (solicitarPermisoAlarma as jest.Mock).mockResolvedValue(true);
  (guardarEstado as jest.Mock).mockResolvedValue(undefined);
  (guardarConfiguracion as jest.Mock).mockResolvedValue(undefined);
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

  it('RF-06: guardarConfiguracion rechaza -> guardarAjustes lanza y no cambia configuracion', async () => {
    const motivo = 'No hay espacio en el dispositivo';
    (guardarConfiguracion as jest.Mock).mockRejectedValueOnce(new Error(motivo));

    renderHook();
    await act(async () => {});

    const configAntes = hookResult.configuracion;
    await expect(hookResult.guardarAjustes({ estudio: 30 })).rejects.toThrow(motivo);
    expect(hookResult.configuracion).toEqual(configAntes);
    expect(guardarConfiguracion).toHaveBeenCalled();
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

describe('useTimer – silencio automático del aviso (RF-05)', () => {
  it('RF-05: al completar una fase y transcurrir 30 s sin interacción, alarmaActiva pasa a false y se llama a alarmService.stop', async () => {
    // Una fase completada al montar dispara manejarFaseCompletada directamente
    (cargarEstado as jest.Mock).mockResolvedValue({
      tipo: 'FASE_COMPLETADA',
      faseAnterior: 'estudio',
    });

    renderHook();
    await act(async () => {});

    expect(hookResult.alarmaActiva).toBe(true);
    expect(alarmService.play).toHaveBeenCalledWith('estudio');

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(hookResult.alarmaActiva).toBe(false);
    expect(alarmService.stop).toHaveBeenCalled();
  });

  it('RF-05: detener la alarma antes de 30 s cancela el silencio automático', async () => {
    (cargarEstado as jest.Mock).mockResolvedValue({
      tipo: 'FASE_COMPLETADA',
      faseAnterior: 'estudio',
    });

    renderHook();
    await act(async () => {});

    expect(hookResult.alarmaActiva).toBe(true);

    act(() => {
      hookResult.detenerAlarma();
    });

    expect(hookResult.alarmaActiva).toBe(false);
    expect(alarmService.stop).toHaveBeenCalledTimes(1);

    // Avanzar 30 s: el temporizador ya se limpió, no debe llamar stop de nuevo
    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(alarmService.stop).toHaveBeenCalledTimes(1);
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

describe('useTimer – carga de almacenamiento y error (Spec 006)', () => {
  it('RF-04: al montar con cargarEstado rechazando, errorCarga se setea y no se inicia el temporizador', async () => {
    const motivo = 'Error al leer el estado guardado: JSON corrupto';
    (cargarEstado as jest.Mock).mockRejectedValueOnce(new Error(motivo));
    (cargarConfiguracion as jest.Mock).mockResolvedValue(null);

    renderHook();
    await act(async () => {});

    expect(hookResult.errorCarga).toContain(motivo);
    expect(hookResult.state.status).toBe('detenido');
    expect(hookResult.state.fase).toBe('estudio');
    expect(guardarEstado).not.toHaveBeenCalled();
  });

  it('RF-04: al montar con cargarConfiguracion rechazando, errorCarga se setea', async () => {
    const motivo = 'Error al leer la configuración';
    (cargarConfiguracion as jest.Mock).mockRejectedValueOnce(new Error(motivo));
    (cargarEstado as jest.Mock).mockResolvedValue(null);

    renderHook();
    await act(async () => {});

    expect(hookResult.errorCarga).toContain(motivo);
    expect(hookResult.state.status).toBe('detenido');
  });

  it('RF-05: reintentarCarga limpia el error y vuelve a leer el almacenamiento', async () => {
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
    (cargarEstado as jest.Mock).mockRejectedValueOnce(new Error('fallo de lectura'));
    (cargarEstado as jest.Mock).mockResolvedValueOnce(guardado);

    renderHook();
    await act(async () => {});

    expect(hookResult.errorCarga).not.toBeNull();
    expect(hookResult.state.status).toBe('detenido');

    await act(async () => {
      await hookResult.reintentarCarga();
    });

    expect(hookResult.errorCarga).toBeNull();
    expect(hookResult.state).toEqual(guardado);
    expect(cargarEstado).toHaveBeenCalledTimes(2);
  });
});

describe('useTimer – ajustes de configuración (Spec 005)', () => {
  it('RF-01/RF-02: guardarAjustes valida, persiste y aplica a siguiente iteración sin alterar la fase actual', async () => {
    renderHook();
    await act(async () => {});

    await act(async () => {
      await hookResult.iniciar();
    });
    const faseActual = hookResult.state.fase;
    const tiempoRestanteAntes = hookResult.state.tiempoRestante;
    const duracionFaseAntes = hookResult.state.duracionFase;

    await act(async () => {
      await hookResult.guardarAjustes({ estudio: 30 });
    });

    // La fase actual no se altera (RF-02, RF-10)
    expect(hookResult.state.fase).toBe(faseActual);
    expect(hookResult.state.tiempoRestante).toBe(tiempoRestanteAntes);
    expect(hookResult.state.duracionFase).toBe(duracionFaseAntes);

    // La configuración se actualiza y se persiste (aplica a siguiente iteración)
    expect(hookResult.configuracion.estudio).toBe(30 * 60);
    expect(guardarConfiguracion).toHaveBeenCalled();
  });

  it('RF-01: guardarAjustes no guarda si hay errores de validación', async () => {
    renderHook();
    await act(async () => {});

    await expect(hookResult.guardarAjustes({ estudio: 0 })).rejects.toThrow();
    expect(guardarConfiguracion).not.toHaveBeenCalled();
  });

  it('RF-11: guardarAjustes rechaza reducir cicloPomodoros por debajo del contador actual', async () => {
    renderHook();
    await act(async () => {});

    await act(async () => {
      await hookResult.iniciar();
    });

    // Forzar pomodoros en 5 (simulando ciclo avanzado)
    (cargarEstado as jest.Mock).mockResolvedValue({
      ...initialState(),
      pomodoros: 5,
      fase: 'estudio',
      status: 'detenido',
      tiempoRestante: 1500,
      duracionFase: 1500,
      startedAt: null,
      faseAnterior: null,
    });

    renderHook();
    await act(async () => {});

    expect(hookResult.state.pomodoros).toBe(5);

    await expect(
      hookResult.guardarAjustes({ cicloPomodoros: 4 })
    ).rejects.toThrow();
    expect(guardarConfiguracion).not.toHaveBeenCalled();
  });

  it('RF-08: restablecerAjustes(true) devuelve a fábrica, detiene el temporizador y resetea pomodoros', async () => {
    renderHook();
    await act(async () => {});

    await act(async () => {
      await hookResult.iniciar();
    });
    expect(hookResult.state.status).toBe('corriendo');

    await act(async () => {
      await hookResult.restablecerAjustes(true);
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
    expect(hookResult.configuracion).toEqual(CONFIG_FABRICA);
    expect(guardarConfiguracion).toHaveBeenCalledWith(CONFIG_FABRICA);
  });

  it('RF-09: restablecerAjustes(false) preserva valores y estado exactamente', async () => {
    renderHook();
    await act(async () => {});

    // Primero cambiar la configuración para que sea distinta de fábrica
    await act(async () => {
      await hookResult.guardarAjustes({ estudio: 30 });
    });
    const configuracionAntes = hookResult.configuracion;
    expect(configuracionAntes.estudio).toBe(30 * 60);

    await act(async () => {
      await hookResult.iniciar();
    });
    const estadoAntes = hookResult.state;

    // Limpiar mocks para verificar que restablecerAjustes(false) no persiste
    (guardarConfiguracion as jest.Mock).mockClear();

    await act(async () => {
      await hookResult.restablecerAjustes(false);
    });

    expect(hookResult.state).toEqual(estadoAntes);
    expect(hookResult.configuracion).toEqual(configuracionAntes);
    // restablecerAjustes(false) no debe persistir nada (RF-09)
    expect(guardarConfiguracion).not.toHaveBeenCalled();
  });
});

