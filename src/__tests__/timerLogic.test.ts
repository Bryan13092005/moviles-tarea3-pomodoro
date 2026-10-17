/// <reference types="jest" />

/**
 * Pruebas unitarias de la lógica pura del dominio del temporizador.
 * Todas las funciones son puras: reciben estado + ahora inyectado, no tocan APIs de dispositivo.
 */

import {
  initialState,
  durationFor,
  formatMMSS,
  start,
  pause,
  resume,
  resetConfirmed,
  resetCancelled,
  tick,
  completePhase,
  recalculateOnResume,
  type FaseCompletadaEvent,
  type TimerState,
  type TickResult,
} from '../domain/timer';

const CONFIG_DURACIONES = {
  estudio: 1500,
  descansoCorto: 300,
  descansoLargo: 900,
} as const;

function estadoBase(overrides: Partial<TimerState> = {}): TimerState {
  return {
    fase: 'estudio',
    status: 'detenido',
    tiempoRestante: 1500,
    duracionFase: 1500,
    pomodoros: 0,
    startedAt: null,
    faseAnterior: null,
    ...overrides,
  };
}

describe('formatMMSS', () => {
  it('00:00 para 0 segundos', () => {
    expect(formatMMSS(0)).toBe('00:00');
  });

  it('00:01 para 1 segundo', () => {
    expect(formatMMSS(1)).toBe('00:01');
  });

  it('25:00 para 1500 segundos', () => {
    expect(formatMMSS(1500)).toBe('25:00');
  });

  it('59:59 para 3599 segundos', () => {
    expect(formatMMSS(3599)).toBe('59:59');
  });

  it('01:00 para 60 segundos', () => {
    expect(formatMMSS(60)).toBe('01:00');
  });
});

describe('initialState', () => {
  it('instalación nueva: fase Estudio, 25:00, detenido, 0 pomodoros', () => {
    const s = initialState();
    expect(s.fase).toBe('estudio');
    expect(s.tiempoRestante).toBe(1500);
    expect(s.status).toBe('detenido');
    expect(s.pomodoros).toBe(0);
    expect(s.startedAt).toBeNull();
  });
});

describe('durationFor', () => {
  it('devuelve la duración configurada de cada fase', () => {
    expect(durationFor('estudio', CONFIG_DURACIONES)).toBe(1500);
    expect(durationFor('descansoCorto', CONFIG_DURACIONES)).toBe(300);
    expect(durationFor('descansoLargo', CONFIG_DURACIONES)).toBe(900);
  });
});

describe('start', () => {
  it('detenido -> corriendo con startedAt = now', () => {
    const s = estadoBase();
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.status).toBe('corriendo');
    expect(r.startedAt).toBe(1000);
    expect(r.tiempoRestante).toBe(1500);
  });

  it('ya corriendo -> no-op (no resetea startedAt)', () => {
    const s = estadoBase({ status: 'corriendo', startedAt: 500 });
    const r = start(s, 9999, CONFIG_DURACIONES);
    expect(r.status).toBe('corriendo');
    expect(r.startedAt).toBe(500);
  });

  it('fase en 00:00 al iniciar -> restaura duración completa', () => {
    const s = estadoBase({ tiempoRestante: 0, duracionFase: 300 });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.tiempoRestante).toBe(300);
    expect(r.status).toBe('corriendo');
    expect(r.startedAt).toBe(1000);
  });

  it('RF-04: iniciar descanso corto incrementa pomodoros en 1', () => {
    const s = estadoBase({
      fase: 'descansoCorto',
      pomodoros: 1,
      faseAnterior: 'estudio',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.status).toBe('corriendo');
    expect(r.pomodoros).toBe(2);
  });

  it('RF-04: iniciar descanso largo incrementa pomodoros en 1', () => {
    const s = estadoBase({
      fase: 'descansoLargo',
      pomodoros: 3,
      faseAnterior: 'estudio',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(4);
  });

  it('RF-04 / Decisión 6: iniciar descanso corto no excede el límite del ciclo', () => {
    const s = estadoBase({
      fase: 'descansoCorto',
      pomodoros: 3,
      faseAnterior: 'estudio',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(4); // tope del ciclo, no 5
  });

  it('Decisión 6: iniciar Descanso Largo con pomodoros en el límite se mantiene en cicloPomodoros', () => {
    const s = estadoBase({
      fase: 'descansoLargo',
      pomodoros: 4,
      faseAnterior: 'estudio',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(4); // no se incrementa más allá de 4 durante el ciclo cerrado
  });

  it('RF-05: iniciar estudio tras descanso largo resetea pomodoros a 0', () => {
    const s = estadoBase({
      fase: 'estudio',
      pomodoros: 4,
      faseAnterior: 'descansoLargo',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(0);
  });

  it('RF-05: iniciar estudio tras descanso corto NO resetea pomodoros', () => {
    const s = estadoBase({
      fase: 'estudio',
      pomodoros: 2,
      faseAnterior: 'descansoCorto',
    });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(2);
  });

  it('iniciar estudio sin faseAnterior previa no resetea pomodoros', () => {
    const s = estadoBase({ fase: 'estudio', pomodoros: 2, faseAnterior: null });
    const r = start(s, 1000, CONFIG_DURACIONES);
    expect(r.pomodoros).toBe(2);
  });
});

describe('pause', () => {
  it('corriendo -> pausado con snapshot del restante transcurrido', () => {
    const s = estadoBase({
      status: 'corriendo',
      tiempoRestante: 1000,
      startedAt: 100,
    });
    const r = pause(s, 200); // transcurrieron 100s
    expect(r.status).toBe('pausado');
    expect(r.startedAt).toBeNull();
    expect(r.tiempoRestante).toBe(900);
  });

  it('pausado -> no-op', () => {
    const s = estadoBase({ status: 'pausado', tiempoRestante: 400 });
    const r = pause(s, 9999);
    expect(r.status).toBe('pausado');
    expect(r.tiempoRestante).toBe(400);
  });
});

describe('resume', () => {
  it('pausado -> corriendo, startedAt = now, conserva restante', () => {
    const s = estadoBase({ status: 'pausado', tiempoRestante: 400 });
    const r = resume(s, 5000);
    expect(r.status).toBe('corriendo');
    expect(r.startedAt).toBe(5000);
    expect(r.tiempoRestante).toBe(400);
  });

  it('detenido -> no-op', () => {
    const s = estadoBase({ status: 'detenido', tiempoRestante: 300 });
    const r = resume(s, 5000);
    expect(r.status).toBe('detenido');
    expect(r.startedAt).toBeNull();
  });
});

describe('resetConfirmed / resetCancelled', () => {
  it('resetConfirmed: restaura duración completa, detenido, misma fase, pomodoros intactos', () => {
    const s = estadoBase({
      fase: 'descansoCorto',
      tiempoRestante: 100,
      status: 'corriendo',
      startedAt: 123,
      pomodoros: 2,
      duracionFase: 300,
    });
    const r = resetConfirmed(s);
    expect(r.status).toBe('detenido');
    expect(r.startedAt).toBeNull();
    expect(r.tiempoRestante).toBe(300);
    expect(r.fase).toBe('descansoCorto');
    expect(r.pomodoros).toBe(2);
  });

  it('resetConfirmed conserva fase y pomodoros sin incrementar (reinicio, no toca contador)', () => {
    const s = estadoBase({
      fase: 'descansoLargo',
      pomodoros: 4,
      faseAnterior: 'estudio',
      status: 'corriendo',
      tiempoRestante: 100,
      startedAt: 123,
      duracionFase: 900,
    });
    const r = resetConfirmed(s);
    expect(r.fase).toBe('descansoLargo'); // misma etapa
    expect(r.pomodoros).toBe(4); // no se incrementa al reiniciar
    expect(r.status).toBe('detenido');
    expect(r.tiempoRestante).toBe(900);
    expect(r.startedAt).toBeNull();
  });

  it('resetCancelled: estado inalterado', () => {
    const s = estadoBase({ tiempoRestante: 500, status: 'corriendo', pomodoros: 1 });
    const r = resetCancelled(s);
    expect(r).toBe(s);
    expect(r.tiempoRestante).toBe(500);
    expect(r.status).toBe('corriendo');
    expect(r.pomodoros).toBe(1);
  });
});

describe('tick', () => {
  it('descuenta el tiempo transcurrido desde startedAt', () => {
    const s = estadoBase({ status: 'corriendo', tiempoRestante: 1000, startedAt: 100 });
    const r = tick(s, 250) as TimerState;
    expect(r.tiempoRestante).toBe(850);
    expect(r.status).toBe('corriendo');
  });

  it('al llegar a <= 0 devuelve evento FASE_COMPLETADA sin iniciar siguiente', () => {
    const s = estadoBase({ status: 'corriendo', tiempoRestante: 10, startedAt: 100 });
    const r = tick(s, 200) as TickResult;
    expect((r as FaseCompletadaEvent).tipo).toBe('FASE_COMPLETADA');
    expect((r as FaseCompletadaEvent).faseAnterior).toBe('estudio');
  });

  it('tick actualiza startedAt al now pasado (uso repetido en setInterval)', () => {
    const s = estadoBase({
      status: 'corriendo',
      tiempoRestante: 1500,
      startedAt: 1000,
    });
    const r = tick(s, 2000) as TimerState;
    expect(r.tiempoRestante).toBe(500);
    expect(r.startedAt).toBe(2000); // startedAt se mueve al now del tick
  });

  it('tick llamado dos veces con estado intermedio no desdobla el descuento', () => {
    const s = estadoBase({
      status: 'corriendo',
      tiempoRestante: 1500,
      startedAt: 1000,
    });
    const r1 = tick(s, 2000) as TimerState; // transcurrido 1000, restante 500, startedAt=2000
    const r2 = tick(r1, 2200) as TimerState; // transcurrido 200 desde startedAt=2000, restante 300
    expect(r2.tiempoRestante).toBe(300); // no 1500-1200=300 (doble descuento)
    expect(r2.startedAt).toBe(2200);
  });

  it('detenido/pausado -> no-op', () => {
    const sd = estadoBase({ status: 'detenido', tiempoRestante: 500 });
    expect((tick(sd, 9999) as TimerState).tiempoRestante).toBe(500);
    const sp = estadoBase({ status: 'pausado', tiempoRestante: 500 });
    expect((tick(sp, 9999) as TimerState).tiempoRestante).toBe(500);
  });
});

describe('completePhase', () => {
  it('estudio -> descanso corto, pomodoros NO se incrementan al terminar (RF-04)', () => {
    const s = estadoBase({ fase: 'estudio', pomodoros: 0 });
    const r = completePhase(s, CONFIG_DURACIONES);
    expect(r.fase).toBe('descansoCorto');
    expect(r.pomodoros).toBe(0); // se incrementa solo al iniciar el descanso (Decisión 5)
    expect(r.status).toBe('detenido');
    expect(r.tiempoRestante).toBe(300);
    expect(r.startedAt).toBeNull();
    expect(r.faseAnterior).toBe('estudio');
  });

  it('al llegar a 4 -> descanso largo, pomodoros se mantienen hasta iniciar (RF-02)', () => {
    const s = estadoBase({ fase: 'estudio', pomodoros: 3 });
    const r = completePhase(s, CONFIG_DURACIONES);
    expect(r.fase).toBe('descansoLargo');
    expect(r.pomodoros).toBe(3); // no se toca al terminar estudio (Decisión 5/6)
    expect(r.tiempoRestante).toBe(900);
    expect(r.status).toBe('detenido');
    expect(r.startedAt).toBeNull();
    expect(r.faseAnterior).toBe('estudio');
  });

  it('descanso corto -> estudio, detenido, duración completa (RF-03)', () => {
    const s = estadoBase({ fase: 'descansoCorto', pomodoros: 2 });
    const r = completePhase(s, CONFIG_DURACIONES);
    expect(r.fase).toBe('estudio');
    expect(r.pomodoros).toBe(2);
    expect(r.status).toBe('detenido');
    expect(r.tiempoRestante).toBe(1500);
    expect(r.faseAnterior).toBe('descansoCorto');
  });

  it('descanso largo -> estudio, detenido, duración completa (RF-03)', () => {
    const s = estadoBase({ fase: 'descansoLargo', pomodoros: 0 });
    const r = completePhase(s, CONFIG_DURACIONES);
    expect(r.fase).toBe('estudio');
    expect(r.tiempoRestante).toBe(1500);
    expect(r.faseAnterior).toBe('descansoLargo');
  });
});

describe('recalculateOnResume', () => {
  it('pausado: conserva el restante sin descontar', () => {
    const s = estadoBase({ status: 'pausado', tiempoRestante: 400 });
    const r = recalculateOnResume(s, 999999) as TimerState;
    expect(r.status).toBe('pausado');
    expect(r.tiempoRestante).toBe(400);
  });

  it('corriendo: recalcula restante con tiempo real transcurrido', () => {
    const s = estadoBase({ status: 'corriendo', tiempoRestante: 1000, startedAt: 100 });
    const r = recalculateOnResume(s, 200) as TimerState;
    expect(r.tiempoRestante).toBe(900);
    expect(r.status).toBe('corriendo');
  });

  it('corriendo y fase terminó al reabrir -> completa la fase', () => {
    const s = estadoBase({ status: 'corriendo', tiempoRestante: 5, startedAt: 100 });
    const r = recalculateOnResume(s, 200) as TickResult;
    expect((r as FaseCompletadaEvent).tipo).toBe('FASE_COMPLETADA');
  });
});
