# Plan — Spec 002: Tiempos de estudio y descanso (HU-002)

**Carpeta de trabajo:** `specs/002-tiempos-estudio-descanso/`

**Estado de la spec:** `aprobado`, sin dudas abiertas. ✅ Se procede al plan.

**Origen:** `docs/Historias/HU_002.md`; decisiones en `specs/002-tiempos-estudio-descanso/decisiones.md` (1-7); restricciones en `docs/constitution.md`. La infraestructura de la Spec 001 (`src/domain/timer.ts`, `src/hooks/useTimer.ts`, `src/services/storage.ts`, `src/services/alarm.ts`, `src/services/permissions.ts`, `src/components/timer/*`, `src/app/(tabs)/index.tsx`) ya existe y se reutiliza; esta spec la modifica para cumplir los RF de HU-002.

---

## 1. Archivos que se crean o modifican

| Archivo | Crear / Modificar | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `src/domain/timer.ts` | Modificar | Lógica pura del dominio. `start()` ahora aplica RF-04 (incrementar pomodoros al iniciar un descanso) y RF-05 (reiniciar a 0 al iniciar estudio tras descanso largo). `completePhase()` ya NO incrementa pomodoros al terminar estudio (Decisión 5); solo determina la siguiente fase (descanso corto/largo/estudio) y la deja detenida. Nuevo campo `faseAnterior` en `TimerState` para saber qué fase se completó antes. | RF-01, RF-02, RF-03, RF-04, RF-05, RF-07 |
| `src/hooks/useTimer.ts` | Modificar | Orquestador. Integra la nueva `start()`/`completePhase()` con el contador de pomodoros. Mantiene persistencia en cada cambio, alarma garantizada, recálculo por timestamp al reabrir (RF-08, RF-09). | RF-01, RF-02, RF-03, RF-04, RF-05, RF-08, RF-09 |
| `src/components/timer/TimerDisplay.tsx` | Modificar | Muestra fase actual, tiempo restante MM:SS y número de pomodoros del ciclo actual (incluido 4/4 durante Descanso Largo). | RF-06 |
| `src/__tests__/timerLogic.test.ts` | Modificar | Pruebas unitarias de las funciones puras actualizadas (incremento al iniciar descanso, reset tras descanso largo, `completePhase` sin incremento, siguiente fase detenida). | RF-01, RF-02, RF-03, RF-04, RF-05, RF-07 |
| `src/__tests__/storage.test.ts` | Modificar | Pruebas de persistencia que cubran conservación de `faseAnterior` y contador al cerrar/reabrir, fase pausada sin descontar, fase corriendo expirada. | RF-08, RNF-01 |

No se crea pantalla de Ajustes ni se validan rangos de duración: está fuera de alcance de esta spec (se deja para HU-005). Las funciones del dominio ya reciben `duraciones` como parámetro, por lo que RF-07 (cambios de duración no afectan la fase en curso) se cumple usando `duracionFase` del estado para la fase en curso y `duraciones[fase]` para la siguiente.

---

## 2. Funciones puras de lógica (testeables con Jest, sin efectos)

Ubicación: `src/domain/timer.ts`. Todas son puras: reciben estado + `duraciones` + `now` (inyectado), devuelven nuevo estado o evento; no llaman a `Date.now()` ni a APIs de dispositivo.

- `initialState(): TimerState` — instalación nueva: fase Estudio, 1500 s, `status = detenido`, pomodoros 0, `faseAnterior = null`. (RF-01)
- `durationFor(fase, duraciones): number` — segundos configurados de la fase dada. (RF-07)
- `formatMMSS(segundos): string` — MM:SS con dos dígitos; cubre 00:00, 00:01, 59:59. (RF-06, caso límite)
- `start(state, now, duraciones): TimerState` — si detenido/iniciando, pone `status = corriendo` y `startedAt = now`; si ya corre, no-op. Si `tiempoRestante === 0`, restaura `duracionFase`. **Nuevo:** si `state.fase` es `descansoCorto` o `descansoLargo`, `pomodoros++` (RF-04). Si `state.fase` es `estudio` y `state.faseAnterior === 'descansoLargo'`, `pomodoros = 0` (RF-05). (RF-01, RF-02, RF-04, RF-05, caso límite)
- `pause(state, now): TimerState` — snapshot del restante, `status = pausado`. (RF-03)
- `resume(state, now): TimerState` — si pausado, `status = corriendo`, `startedAt = now`. (RF-03)
- `resetConfirmed(state): TimerState` — `tiempoRestante = duracionFase`, `status = detenido`, misma fase, pomodoros intactos. (RF-07)
- `resetCancelled(state): TimerState` — devuelve el estado sin cambios. (RF-07)
- `tick(state, now): TimerState | PhaseCompleted` — recalcula restante transcurrido; si ≤ 0, devuelve evento `FASE_COMPLETADA` sin iniciar la siguiente. (RF-01, RF-02, RF-03)
- `completePhase(state, duraciones): TimerState` — suena alarma (efecto en el hook); `faseAnterior = state.fase`; si terminó Estudio, siguiente = Descanso Largo si `pomodoros + 1 >= cicloPomodoros`, si no Descanso Corto (pomodoros NO se incrementa aquí — Decisión 5); si terminó un descanso, siguiente = Estudio. `tiempoRestante = duraciones[siguiente]`, `duracionFase = duraciones[siguiente]`, `status = detenido` (no iniciar automáticamente, Decisión 1). (RF-01, RF-02, RF-03, RF-07)
- `recalculateOnResume(state, now): TimerState | PhaseCompleted` — si `pausado`, conserva intacto (RF-08); si `corriendo`, restante -= transcurrido real; si ≤ 0 → `FASE_COMPLETADA` (RF-09). (RF-08, RF-09, Constitución 1.2)

---

## 3. Persistencia

- Librería: `@react-native-async-storage/async-storage` (ya es dependencia).
- Clave única: `@pomodoro/state`; valor: JSON del `TimerState` (incluye `faseAnterior` y `pomodoros`).
- Guarda de forma atómica tras cada cambio de estado (Constitución §4).
- Al montar la app: lee el estado guardado. Si no hay, `initialState()`. Si `status === 'corriendo'`, aplica `recalculateOnResume`; si resultó en fase completada, `completePhase` y se prepara la siguiente detenida (RF-09). Si `pausado`, se conserva sin descontar (RF-08).
- 100 % local, sin red (RNF-01, Constitución 1.1).

---

## 4. Algoritmo en pseudocódigo

```
CONFIG = { estudio: 1500, descansoCorto: 300, descansoLargo: 900, cicloPomodoros: 4 }

estado = {
  fase, status, tiempoRestante, duracionFase,
  pomodoros, startedAt, faseAnterior   // faseAnterior: fase completada previamente
}

iniciar(ahora, duraciones):
  si no hay permiso de alarma: solicitarPermiso(); si denegado → bloquear inicio (RF-08)
  si estado.status == 'corriendo': retornar
  si estado.tiempoRestante == 0: estado.tiempoRestante = estado.duracionFase  // caso límite 00:00
  nuevosPomodoros = estado.pomodoros
  si estado.fase == 'descansoCorto' o estado.fase == 'descansoLargo':
    nuevosPomodoros = estado.pomodoros + 1        // RF-04
  si estado.fase == 'estudio' y estado.faseAnterior == 'descansoLargo':
    nuevosPomodoros = 0                            // RF-05
  estado.status = 'corriendo'
  estado.startedAt = ahora
  estado.pomodoros = nuevosPomodoros
  persistir(estado)                                // RF-01, RF-02

pausar(ahora):
  si estado.status == 'corriendo':
    estado.tiempoRestante = restanteTranscurrido(estado, ahora)
    estado.status = 'pausado'
    estado.startedAt = null
    persistir(estado)                              // RF-03

reanudar(ahora):
  si estado.status == 'pausado':
    estado.status = 'corriendo'
    estado.startedAt = ahora
    persistir(estado)                              // RF-03

tick(ahora):
  si estado.status != 'corriendo': retornar
  transcurrido = ahora - estado.startedAt
  nuevoRestante = estado.tiempoRestante - transcurrido
  si nuevoRestante <= 0:
    completarFase(duraciones)                      // RF-01/RF-02/RF-03: no inicia siguiente
  si no:
    estado.tiempoRestante = nuevoRestante
    persistir(estado)

completarFase(duraciones):
  alarma.play()                                    // sonido+vibración, incluso silenciado/DND/bloqueado (Constitución 1.3)
  estado.faseAnterior = estado.fase                // recordar fase completada
  si estado.fase == 'estudio':
    si estado.pomodoros + 1 >= CONFIG.cicloPomodoros:
      siguienteFase = 'descansoLargo'              // RF-02
    si no:
      siguienteFase = 'descansoCorto'              // RF-01
    // pomodoros NO se incrementa aquí (Decisión 5 / RF-04)
  si no:  // terminó un descanso
    siguienteFase = 'estudio'                      // RF-03
  estado.fase = siguienteFase
  estado.tiempoRestante = duraciones[siguienteFase]   // duración completa
  estado.duracionFase = duraciones[siguienteFase]     // valor con el que empieza (RF-07)
  estado.status = 'detenido'                       // NO iniciar automáticamente (Decisión 1)
  estado.startedAt = null
  persistir(estado)                                // RF-01, RF-02, RF-03

recalculateOnResume(ahora):
  si estado.status == 'pausado': retornar estado sin cambios (RF-08)
  si estado.status == 'corriendo' y startedAt != null:
    transcurrido = ahora - startedAt
    nuevoRestante = tiempoRestante - transcurrido
    si nuevoRestante <= 0:
      return FASE_COMPLETADA                       // RF-09: expiró mientras cerrada
    retornar estado con tiempoRestante = nuevoRestante, startedAt = ahora
```

---

## 5. Cómo se pinta en la interfaz (Expo Router, mobile-first)

- Ruta: `src/app/(tabs)/index.tsx` (pestaña "Home" de los `NativeTabs` existentes). Pantalla única.
- `SafeAreaView` + `ThemedView`/`ThemedText` con `Colors` de `src/constants/theme.ts` (claro/oscuro).
- Encabezado: fase actual (texto grande), cronómetro MM:SS (grande), pomodoros del ciclo ("Pomodoros: X/4").
- Botones de acción directa un toque (Constitución 2.1): Iniciar / Pausar-Reanudar / Reiniciar.
- Al completar fase: suena/vibra alarma y se muestra `AlarmDialog` con botón "Aceptar" (detiene alarma). Debajo, la siguiente fase ya preparada detenida con su duración completa; el botón "Iniciar [fase]" descarta la alarma y puede iniciar (RF-01, RF-02, RF-03, Decisión 1/2).
- Si falta permiso: `PermissionBanner` con explicación contextual + botón para habilitar; el temporizador no inicia (RF-08, RNF-02, Constitución 1.3).
- Sin anuncios, sin registro, funciona offline (Constitución 1.1/1.2).
- Accesibilidad: `accessibilityLabel` en botones y cronómetro; anuncio de cambio de fase para lectores de pantalla.
- La pantalla muestra el contador incluso cuando vale 4/4 durante el Descanso Largo (RF-06, Decisión 6).

---

## 6. Decisiones técnicas (justificadas + alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| T-1 | Lógica de contador en `start()` (RF-04/RF-05), no en `completePhase()`. | Decisión 5 y Decisión 6: el contador se incrementa al iniciar el descanso y se reinicia al iniciar estudio tras descanso largo; durante Descanso Largo se mantiene en 4/4. | Incrementar en `completePhase` (como hacía Spec 001): contradice Decisión 5 y 6, avanzaría el contador antes de que el usuario inicie el descanso. |
| T-2 | Campo `faseAnterior` en `TimerState`. | Necesario para distinguir en `start()` si se inicia un estudio tras Descanso Largo (RF-05) vs. tras Descanso Corto. | Reconstruirlo desde `pomodoros`: frágil, no distingue el origen del ciclo. |
| T-3 | `completePhase` usa `pomodoros + 1 >= cicloPomodoros` para decidir Descanso Largo. | Como el contador solo sube al iniciar descansos, al terminar un estudio `pomodoros` refleja los descansos ya iniciados; el siguiente será el `pomodoros + 1`-ésimo. | Contador interno separado de estudios completados: duplicaría estado y añadiría complejidad sin beneficio visible. |
| T-4 | Persistencia con `AsyncStorage` (ya instalada), clave `@pomodoro/state`. | Estado único pequeño, guarda local/offline/atómica en cada cambio (Constitución §4, RNF-01). | `expo-sqlite`: sobrecarga para un solo objeto. |
| T-5 | Alarma con `expo-notifications` (ya instalada en Spec 001). | Constitución §1.3 exige alarma incluso en silencio / No molestar / bloqueado y vibración. | `expo-av`: solo sonido, no garantiza vibración ni saltar No molestar. |
| T-6 | UI con componentes nativos de RN + tema existente; sin librería de terceros. | Dependencias mínimas y consistencia con `theme.ts`; pantalla única justifica evitar navegador de pilas. | React Native Paper: dependencia extra innecesaria. |

---

## 7. Estrategia de pruebas con Jest

- Runner: `jest` con preset `jest-expo` (script `npm test` / `npx jest`). No hay `bun.lock`, por tanto se usa `npx` (no `bunx`).
- `src/__tests__/timerLogic.test.ts` — funciones puras del dominio actualizadas:
  - `start` con RF-04: iniciar descanso corto/largo incrementa pomodoros en 1.
  - `start` con RF-05: iniciar estudio con `faseAnterior === 'descansoLargo'` resetea pomodoros a 0; iniciar estudio tras descanso corto no resetea.
  - `completePhase`: al terminar estudio NO incrementa pomodoros; decide Descanso Corto vs Largo por `pomodoros + 1 >= 4`; siguiente fase queda detenida (no iniciada).
  - `formatMMSS`: 0 → "00:00", 1 → "00:01", 3599 → "59:59", 1500 → "25:00".
  - `pause` / `resume`: snapshot y continuación del restante.
  - `tick`: descuenta transcurrido; si llega a 0 → evento fase completada.
  - `recalculateOnResume`: corriendo + transcurrido → restante reducido; si ≤ 0 → completa fase; pausado → conserva sin descontar.
- `src/__tests__/storage.test.ts` — persistencia (mocks de `AsyncStorage` y `Date.now`):
  - guarda y carga estado incluyendo `faseAnterior` y `pomodoros`.
  - fase pausada al reabrir: conserva el restante sin descontar (RF-08).
  - fase corriendo expirada al reabrir: evento `FASE_COMPLETADA` (RF-09).
- Mocks: `IAlarmService` mockeado (no se toca el módulo nativo en pruebas unitarias); `AsyncStorage` mockeado.
- Criterio de pase: `npx jest` verde, `npx tsc --noEmit` sin errores, `npx expo lint` limpio.

---

## 8. Trazabilidad RF → plan

- RF-01: `domain/timer.completePhase` (estudio → descanso corto detenido) + `useTimer` + `expo-notifications`.
- RF-02: `domain/timer.completePhase` (estudio → descanso largo cuando `pomodoros+1 >= 4`) + `useTimer` + alarma.
- RF-03: `domain/timer.completePhase` (descanso → estudio detenido) + `domain/timer.tick` + `TimerDisplay`.
- RF-04: `domain/timer.start` (incrementa pomodoros al iniciar descanso) + `useTimer.iniciar`.
- RF-05: `domain/timer.start` (resetea pomodoros a 0 al iniciar estudio tras descanso largo) + `useTimer.iniciar`.
- RF-06: `TimerDisplay` (fase, MM:SS, pomodoros del ciclo, incluso 4/4).
- RF-07: `domain/timer.start`/`completePhase` usan `duracionFase` para la fase en curso y `duraciones[fase]` para la siguiente; `TimerState.duracionFase` conserva el valor de inicio.
- RF-08: `domain/timer.recalculateOnResume` (pausado conserva) + `storage.cargaAlIniciar` + `useTimer` (efecto de montaje).
- RF-09: `domain/timer.recalculateOnResume` (corriendo expirado → `FASE_COMPLETADA`) + `useTimer` (alarma + siguiente fase al aceptar) + `AlarmDialog`.
- RNF-01: `storage` (AsyncStorage, 100 % local/offline).
- RNF-02: `services/permissions` + `PermissionBanner` (explicación contextual antes de solicitar).

**Criterios de finalización del plan:** cubren los 4 escenarios de HU-002 (Esc. 1: RF-01; Esc. 2: RF-02; Esc. 3: RF-03; Esc. 4: RF-06) y todos los RF (RF-01…RF-09, RNF-01, RNF-02) listados en la spec.