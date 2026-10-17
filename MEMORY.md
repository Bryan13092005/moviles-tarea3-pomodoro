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

npx jest: 42 pruebas verdes (3 suites: alarm, timerLogic, storage). npx tsc --noEmit: sin errores.

## Próximos pasos

No hay más tareas pendientes de la Spec 002. Cierre completo de la espec.
