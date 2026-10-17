# Tareas — Spec 004 — Aviso de Fin de Fase (AvisoTiempo)

Máximo 20-30 min por tarea, ordenadas por dependencia. Las de lógica se verifican con `npx jest`.

- [x] **T1. Hook: silencio automático del aviso a los 30 s (RF-05, RF-10).** Añadir `useRef` para el ID del temporizador y un `setTimeout` de 30 s en `manejarFaseCompletada`/`detenerAlarma` de `src/hooks/useTimer.ts` que ponga `alarmaActiva = false` y llame a `alarmService.stop()` si el usuario no interactúa; limpiarse si el usuario detiene antes y al desmontar. La siguiente fase permanece detenida (no auto-inicio, Decisión 6).
  - Hecho cuando: `npx jest` pasa y el hook incluye un temporizador de 30 s que se limpia al detener la alarma manualmente.

- [x] **T2. Servicio: la notificación indica la fase que terminó (RF-01).** Modificar `IAlarmService.play(fase)` e `ExpoAlarmService.play(fase)` en `src/services/alarm.ts` para que el `body` de la notificación incluya el nombre de la fase finalizada, manteniendo sonido, vibración y prioridad HIGH.
  - Hecho cuando: `alarmService.play` acepta un parámetro de fase y el `body` de la notificación lo incluye.

- [x] **T3. Pruebas: RF-05 silencio a los 30 s (RF-05, RF-10).** Añadir pruebas en `src/__tests__/useTimer.test.ts` con fake timers: (a) completar fase y avanzar 30 s → `alarmaActiva === false` y `alarmService.stop` llamado; (b) detener alarma antes de 30 s → no se silencia sola.
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`.

- [x] **T4. Pruebas: RF-01 la notificación indica la fase (RF-01).** Añadir prueba en `src/__tests__/alarm.test.ts` que verifique que `scheduleNotificationAsync` recibe un `body` con el nombre de la fase finalizada.
  - Hecho cuando: la prueba nueva pasa en `npx jest`.

- [x] **T5. Verificación final: todos los RF, Jest, TypeScript y lint (RF-01…RF-10, RNF-01…RNF-03).** Revisar la matriz de trazabilidad del plan; ejecutar `npx jest`, `npx tsc --noEmit` y `npx expo lint`.
  - Hecho cuando: todas las suites de prueba verdes, `tsc` sin errores, `lint` sin errores nuevos; cada RF tiene al menos una prueba o implementación.

Total: 5 tareas.