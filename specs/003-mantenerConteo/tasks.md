# Tareas — Spec 003: Mantener el conteo (HU-003)

Formato SDD: cada tarea dura máximo 20-30 min, en orden de dependencia, con RFs y "Hecho cuando:" verificable. Lógica se verifica con `npx jest`; interfaz con la lista manual de `rn-conventions` (Expo Go).

Total: 10 tareas (límite del SDD; si surge una 11ª, dividir la spec).

- [x] **T1. Dominio: función pura `reinicioCompleto()` y sus pruebas.** RF-08, RF-09
  - Añadir `reinicioCompleto(): TimerState` en `src/domain/timer.ts` que devuelva `initialState()` (fase estudio, 25:00, detenido, pomodoros 0, startedAt null, faseAnterior null).
  - Añadir bloque de pruebas en `src/__tests__/timerLogic.test.ts`.
  - Hecho cuando: `npx jest` verde; `reinicioCompleto()` devuelve exactamente el estado inicial del pomodoro.

- [x] **T2. Persistencia: `guardarEstado` atrapa fallos y propaga el motivo.** RF-05
  - Envolver `AsyncStorage.setItem` en try/catch en `src/services/storage.ts`; si falla, rechazar con el mensaje del error.
  - Añadir prueba en `src/__tests__/storage.test.ts` donde AsyncStorage rechaza `setItem`.
  - Hecho cuando: `npx jest` verde; fallo de almacenamiento propaga el motivo y no bloquea la app.

- [x] **T3. Hook: estado `errorPersistencia` y `persist()` centralizado.** RF-05
  - Añadir estado `errorPersistencia` en `src/hooks/useTimer.ts`.
  - Crear `persist(next)` que haga `setState` + `guardarEstado` atrapando errores y guardando el motivo en `errorPersistencia`.
  - Sustituir llamadas directas `void guardarEstado(...)` por `persist(...)` en todas las acciones del hook.
  - Hecho cuando: `npx jest` verde; al fallar la persistencia se expone `errorPersistencia` sin tirar la aplicación.

- [x] **T4. Hook: acción `reiniciarCompleto()` y sus pruebas.** RF-08, RF-09
  - Añadir `reiniciarCompleto()` en el hook: state = `initialState()`, `tiempoMostrar = 25:00`, `persist(initialState())`.
  - Añadir pruebas en `src/__tests__/useTimer.test.ts` (archivo nuevo).
  - Hecho cuando: `npx jest` verde; tras `reiniciarCompleto()` el estado es `initialState()` y se persistió.

- [x] **T5. Hook: carga al montar y recálculo por timestamps al reabrir.** RF-01, RF-02, RF-03, RF-07
  - Añadir pruebas en `src/__tests__/useTimer.test.ts` (mock de `cargarEstado`, `guardarEstado`, `solicitarPermisoAlarma`, `alarmService`):
    - carga estado guardado al montar (RF-07);
    - si estaba corriendo, recalcula con timestamps al reabrir (RF-01, RF-02, RNF-02);
    - si estaba pausado, conserva el restante sin descontar (RF-03).
  - Hecho cuando: `npx jest` verde; recarga respeta pausado sin descontar y recalcula corriendo.

- [x] **T6. Hook: bloquear inicio sin permiso de notificaciones.** RF-10
  - Añadir pruebas en `src/__tests__/useTimer.test.ts`: sin permiso, `iniciar` no cambia status a 'corriendo' y muestra banner.
  - Hecho cuando: `npx jest` verde; sin permiso, `iniciar` no arranca el temporizador.

- [x] **T7. UI: componente `ReinicioCompletoPomodoro` (botón siempre visible).** RF-08, RF-09
  - Crear `src/components/timer/ReinicioCompletoPomodoro.tsx` con botón "Reinicio Completo de Pomodoro", objetivo táctil ≥44×44, `accessibilityLabel`, `accessibilityRole="button"`, textos en español, `StyleSheet`, color `#3C9FFE`.
  - Hecho cuando: componente creado y lista manual de `rn-conventions` entregada (objetivo táctil, accesibilidad, textos en español).

- [x] **T8. UI: componente `ErrorPersistenciaBanner` (no bloqueante).** RF-05
  - Crear `src/components/timer/ErrorPersistenciaBanner.tsx` que muestre el motivo del fallo y permita cerrarlo.
  - Hecho cuando: componente creado y lista manual de `rn-conventions` entregada.

- [x] **T9. UI: `ConfirmResetDialog` con texto personalizable.** RF-08, RF-09
  - Añadir props opcionales `titulo` y `descripcion` a `ConfirmResetDialog` para reutilizarlo en el reinicio completo de pomodoro.
  - Hecho cuando: el diálogo acepta texto personalizado y sigue funcionando para el reinicio por fase.

- [x] **T10. UI: cablear botón completo + banner de error en HomeScreen.** RF-05, RF-08, RF-09
  - Renderizar `<ReinicioCompletoPomodoro>` y `<ErrorPersistenciaBanner>` en `src/app/(tabs)/index.tsx`.
  - Confirmación de reinicio completo (reutilizar `ConfirmResetDialog` con texto de reset completo) → `reiniciarCompleto()` al aceptar.
  - Hecho cuando: botón siempre visible; aceptar confirmación reseta a estado inicial; banner de error se muestra al fallar persistencia; lista manual de `rn-conventions` (Expo Go: vertical/giro, teclado, fases legibles, cierre y reapertura conserva sesión) entregada y verificada por el usuario.
