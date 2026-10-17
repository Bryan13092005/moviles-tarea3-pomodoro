# Tareas — Spec 002: Tiempos de estudio y descanso (HU-002)

**Formato:** tareas de 20-30 minutos como máximo, en orden de dependencia. Cada una declara sus RF y una línea `Hecho cuando:` verificable.
- Lógica: se verifica con `npx jest` (y `npx tsc --noEmit`, `npx expo lint`).
- Interfaz: se verifica con la lista manual de puntos de `rn-conventions` (Expo Router, SafeAreaView, tema claro/oscuro, accessibilityLabel, sin anuncios, sin registro, offline).
- Total: **6 tareas** (no se supera el umbral de 10; no es necesario dividir la spec).

---

## ✅ T-1 — Lógica pura del dominio actualizada (contador al iniciar descanso, no al terminar estudio) — RF-01, RF-02, RF-03, RF-04, RF-05, RF-07

**RF:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-07

Modificar `src/domain/timer.ts`:
- Añadir campo `faseAnterior` a `TimerState`.
- `start(state, now, duraciones)`: al iniciar un descanso (descansoCorto/descansoLargo) incrementa pomodoros en 1 (RF-04); al iniciar estudio con `faseAnterior === 'descansoLargo'` resetea pomodoros a 0 (RF-05).
- `completePhase(state, duraciones)`: NO incrementa pomodoros al terminar estudio (Decisión 5 / RF-04); solo determina siguiente fase (descanso corto si `pomodoros + 1 < cicloPomodoros`, descanso largo si `>= cicloPomodoros`; estudio tras cualquier descanso) y la deja detenida con duración completa; guarda `faseAnterior`.
- `recalculateOnResume`: pausado conserva sin descontar (RF-08); corriendo expirado → `FASE_COMPLETADA` (RF-09).
- `tick` y `start`: si `tiempoRestante === 0`, restaura `duracionFase` (caso límite 00:00).

Hecho cuando:
- `src/domain/timer.ts` compila con TypeScript (`npx tsc --noEmit`).
- `npx expo lint` pasa sobre el archivo.
- Las funciones puras implementan el pseudocódigo del plan (sección 4) y respetan Decisión 5 (incremento al iniciar descanso) y Decisión 6 (reset al iniciar estudio tras descanso largo).

---

## ✅ T-2 — Pruebas unitarias de la lógica pura actualizada — RF-01, RF-02, RF-03, RF-04, RF-05, RF-07

**RF:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-07

Modificar `src/__tests__/timerLogic.test.ts` con Jest:
- `start` con RF-04: iniciar descanso corto incrementa pomodoros en 1; iniciar descanso largo también.
- `start` con RF-05: iniciar estudio con `faseAnterior === 'descansoLargo'` resetea pomodoros a 0; iniciar estudio tras descanso corto no resetea.
- `completePhase`: al terminar estudio NO incrementa pomodoros; decide Descanso Corto vs Descanso Largo por `pomodoros + 1 >= 4`; siguiente fase queda detenida (no iniciada automáticamente).
- `formatMMSS`: 0 → "00:00", 1 → "00:01", 3599 → "59:59", 1500 → "25:00".
- `pause` / `resume`: snapshot y continuación del restante.
- `tick`: descuenta transcurrido; si llega a 0 → evento fase completada.
- `recalculateOnResume`: corriendo + transcurrido → restante reducido; si ≤ 0 → completa fase; pausado → conserva sin descontar.

Hecho cuando:
- `npx jest src/__tests__/timerLogic.test.ts` pasa (verde).
- Cobertura de los casos límite: 00:00, 00:01, 59:59; incremento solo al iniciar descanso; reset solo al iniciar estudio tras descanso largo; siguiente fase detenida.

---

## ✅ T-3 — Hook orquestador useTimer actualizado — RF-01, RF-02, RF-03, RF-04, RF-05, RF-08, RF-09

**RF:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-08, RF-09

Modificar `src/hooks/useTimer.ts`:
- Integrar la nueva firma de `start(state, now, duraciones)` y `completePhase(state, duraciones)`.
- Al montar la app: carga estado (incluye `faseAnterior` y `pomodoros`); si estaba corriendo, aplica `recalculateOnResume`; si resultó fase completada, activa alarma y prepara siguiente detenida (RF-09); si estaba pausado, conserva sin descontar (RF-08).
- Mantener alarma garantizada (sonido+vibración, segundo plano/bloqueado/DND) y `AlarmDialog`.
- Bloquear inicio/reanudación sin permiso de alarma; `PermissionBanner` con explicación contextual (RNF-02).

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan sobre el hook.
- El hook persiste en AsyncStorage tras cada cambio de estado.
- `npx jest` (suite completa) pasa en verde.

---

## ✅ T-4 — Pantalla: mostrar fase, tiempo MM:SS y pomodoros del ciclo — RF-06

**RF:** RF-06

Modificar `src/components/timer/TimerDisplay.tsx`:
- Muestra claramente la fase actual (Estudio / Descanso Corto / Descanso Largo).
- Muestra el tiempo restante en formato MM:SS (cubre 00:00, 00:01, 59:59).
- Muestra el número de pomodoros completados en el ciclo actual, incluyendo 4/4 durante Descanso Largo (RF-06, Decisión 6).
- Usa `SafeAreaView`, `ThemedView`/`ThemedText` y `Colors` del tema claro/oscuro; `accessibilityLabel` en botones y cronómetro.

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan.
- Lista manual de interfaz (`rn-conventions`) verificada por ti en Expo Go: fase, MM:SS y pomodoros visibles correctamente, incluida la pantalla con 4/4 durante Descanso Largo.

---

## ✅ T-5 — Pruebas de persistencia y recuperación al reabrir — RF-08, RF-09, RNF-01

**RF:** RF-08, RF-09, RNF-01

Modificar `src/__tests__/storage.test.ts` con Jest (mocks de `AsyncStorage` y `Date.now`):
- Guarda y carga estado correctamente, incluyendo `faseAnterior` y `pomodoros`.
- Fase pausada al reabrir: conserva el tiempo restante sin descontar (RF-08).
- Fase corriendo expirada al reabrir: devuelve evento `FASE_COMPLETADA` (RF-09).
- Sin estado previo: devuelve `initialState`.
- 100 % local, sin dependencia de red (RNF-01, Constitución 1.1).

Hecho cuando:
- `npx jest src/__tests__/storage.test.ts` pasa (verde).

---

## ✅ T-6 — Verificación final: lint, typecheck y tests completos — todos (RF-01…RF-09, RNF-01, RNF-02)

**RF:** todos (RF-01…RF-09, RNF-01, RNF-02)

Hecho cuando:
- `npx expo lint` pasa sin errores.
- `npx tsc --noEmit` pasa sin errores.
- `npx jest` pasa en su totalidad (suite completa verde).
- Los 4 escenarios de HU-002 quedan cubiertos por pruebas: Escenario 1 (RF-01), Escenario 2 (RF-02), Escenario 3 (RF-03), Escenario 4 (RF-06).
