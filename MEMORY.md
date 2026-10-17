# MEMORY.md

## Estado actual

Spec 002 — Tiempos de estudio y descanso (HU-002): CERRADA / IMPLEMENTADA.
Todas las 6 tareas de specs/002-tiempos-estudio-descanso/tasks.md están marcadas como hechas (✅):
- T1 Lógica pura del dominio (RF-01, RF-02, RF-03, RF-04, RF-05, RF-07) — src/domain/timer.ts
- T2 Pruebas unitarias lógica pura (RF-01…RF-05, RF-07) — src/__tests__/timerLogic.test.ts (36 pruebas)
- T3 Hook orquestador useTimer (RF-01…RF-05, RF-08, RF-09) — src/hooks/useTimer.ts
- T4 Pantalla TimerDisplay (RF-06) — src/components/timer/TimerDisplay.tsx (confirmada en Expo Go por el usuario)
- T5 Pruebas de persistencia (RF-08, RF-09, RNF-01) — src/__tests__/storage.test.ts (5 pruebas)
- T6 Verificación final (todos RF-01…RF-09, RNF-01, RNF-02) — npx jest 42 pruebas verdes; npx tsc --noEmit sin errores; npx expo lint solo error preexistente ajeno en src/hooks/use-color-scheme.web.ts (scaffold/Spec 001, no tocado).

Ajuste reportado durante la implementación: src/constants/pomodoro.ts `estudio: 1 * 60` → `25 * 60` (25 min) para cumplir el plan (sección 4) y pasar initialState.

npx jest: 50 pruebas verdes (4 suites: alarm, timerLogic, storage, useTimer). npx tsc --noEmit: sin errores.

Spec 002 — Tiempos de estudio y descanso (HU-002): CERRADA / IMPLEMENTADA.

Spec 003 — Mantener el conteo (HU-003): CERRADA / IMPLEMENTADA.
spec.md en `specs/003-mantenerConteo/spec.md`. 10 RFs (RF-01 a RF-10) y 3 RNFs (RNF-01 a RNF-03) cubriendo los 4 escenarios de HU-003 y las 7 decisiones de decisiones.md.

Todas las 10 tareas implementadas (✅):
- T1 Dominio: `reinicioCompleto()` en `src/domain/timer.ts` + pruebas en `timerLogic.test.ts` (RF-08, RF-09).
- T2 Persistencia: `guardarEstado` con try/catch en `src/services/storage.ts` + prueba en `storage.test.ts` (RF-05).
- T3 Hook: `errorPersistencia` + `persist()` centralizado en `src/hooks/useTimer.ts`, reemplazo de `void guardarEstado` por `persist` (RF-05).
- T4 Hook: `reiniciarCompleto()` en `src/hooks/useTimer.ts` + pruebas en `useTimer.test.ts` (RF-08, RF-09).
- T5 Hook: pruebas de carga al montar y recálculo por timestamps en `useTimer.test.ts` (RF-01, RF-02, RF-03, RF-07).
- T6 Hook: prueba de bloqueo de inicio sin permiso en `useTimer.test.ts` (RF-10).
- T7 UI: `ReinicioCompletoPomodoro` en `src/components/timer/ReinicioCompletoPomodoro.tsx` (RF-08, RF-09). Verificada en Expo Go por el usuario.
- T8 UI: `ErrorPersistenciaBanner` en `src/components/timer/ErrorPersistenciaBanner.tsx` (RF-05). Verificada en Expo Go por el usuario.
- T9 UI: `ConfirmResetDialog` con `titulo`/`descripcion` opcionales en `src/components/timer/ConfirmResetDialog.tsx` (RF-08, RF-09). Verificada en Expo Go por el usuario.
- T10 UI: cableado en `src/app/(tabs)/index.tsx` — `ReinicioCompletoPomodoro` siempre visible, `ErrorPersistenciaBanner`, diálogo de reinicio completo → `reiniciarCompleto()` (RF-05, RF-08, RF-09). Verificado en Expo Go por el usuario.

Cobertura de escenarios de HU-003 por pruebas:
- Escenario 1 (bloquear celular, corriendo) y Escenario 2 (cerrar app, corriendo): RF-01, RF-02 — lógica de `recalculateOnResume` probada (specs 001/002) + T5 recálculo corriendo.
- Escenario 3 (tiempo termina con app cerrada): RF-04 — cubierto por specs 001/002 (`manejarFaseCompletada` + alarm).
- Escenario 4 (pausar antes de cerrar): RF-03 — cubierto en T5 (pausado conserva tiempo sin descontar).
- RF-05 (fallo persistencia → error con motivo): T2/T3.
- RF-07 (persistir estado al suspender): T5.
- RF-08/RF-09 (no reinicio automático; botón reinicio completo): T1/T4 + UI T7-T10 verificada en Expo Go.
- RF-10 (bloquear inicio sin permiso): T6.

Spec 004 — Aviso de Fin de Fase (HU-004): CERRADA / IMPLEMENTADA. spec.md aprobada; `plan.md` y `tasks.md` completados (5 tareas, specs/004-avisoTiempo/).

Todas las 5 tareas implementadas (✅):
- T1 Hook: `useRef` + `setTimeout` de 30 s en `manejarFaseCompletada`, limpieza en `detenerAlarma` y al desmontar, `alarmService.play(faseAnterior)` (RF-05, RF-10) — `src/hooks/useTimer.ts`
- T2 Servicio: `IAlarmService.play(fase?)` e `ExpoAlarmService.play(fase?)` incluyen nombre de fase en `body` de notificación (RF-01) — `src/services/alarm.ts`
- T3 Pruebas: 2 pruebas en `useTimer.test.ts` con fake timers — silencio a los 30 s y detención temprana cancela silencio (RF-05, RF-10)
- T4 Pruebas: 2 pruebas en `alarm.test.ts` — `body` con nombre de fase + body por defecto sin fase (RF-01)
- T5 Verificación: `npx jest` 54 pruebas verdes (4 suites), `npx tsc --noEmit` sin errores, `npx expo lint` sin errores nuevos (solo preexistentes de scaffold)

npx jest: 54 pruebas verdes (4 suites: alarm, timerLogic, storage, useTimer). npx tsc --noEmit: sin errores.

## Próximos pasos

Spec 004 — Aviso de Fin de Fase (HU-004): CERRADA / IMPLEMENTADA. No hay tareas pendientes de esta spec.
