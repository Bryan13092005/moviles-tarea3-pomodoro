# Plan — Spec 001: Iniciar y controlar una sesión (HU-001)

**Carpeta de trabajo:** `specs/001-iniciar-controlar-sesion/` (la petición nombró `001-iniciar-contador-sesion`; el directorio existente con `spec.md` aprobada y `decisiones.md` es `001-iniciar-controlar-sesion`).

**Estado de la spec:** `aprobada`, sin dudas abiertas. ✅ Se procede al plan.

**Origen:** `docs/Historias/HU_001.md`; decisiones en `specs/001-iniciar-controlar-sesion/decisiones.md` (1-9); restricciones en `docs/constitution.md`.

---

## 1. Archivos que se crean o modifican

| Archivo | Crear / Modificar | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `src/constants/pomodoro.ts` | Crear | Constantes de dominio: duraciones por defecto (Estudio 25:00, Descanso Corto 5:00, Descanso Largo 15:00), ciclo de 4 pomodoros, claves de fase. | RF-01, RF-06, RF-07, RF-10, RF-12, RF-14, Constitución 2.2/2.3 |
| `src/domain/timer.ts` | Crear | Modelo de dominio (fases, estado del temporizador) y **funciones puras de lógica** (duración de fase, formato MM:SS, transición de ciclo, siguiente estado). Sin importar React ni AsyncStorage. | RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-10, RF-12, RF-14 |
| `src/services/storage.ts` | Crear | Persistencia atómica en AsyncStorage (clave `@pomodoro/state`). Guarda en cada cambio de estado; carga al iniciar la app. | RF-13, RNF-01, Constitución 1.1, 1.2, 4, Decisión 3 |
| `src/services/alarm.ts` | Crear | Puerto `IAlarmService` (requestPermission, hasPermission, play, stop) + implementación con expo-notifications. | RF-08, RF-09, RF-10, RF-11, Constitución 1.3, Decisión 1/8/9 |
| `src/services/permissions.ts` | Crear | Flujo de permiso con **explicación contextual** antes de solicitar al SO. | RF-08, RF-09, RNF-02, Constitución 1.3 |
| `src/hooks/useTimer.ts` | Crear | Hook orquestador: une lógica pura, persistencia y alarma; expone estado y acciones (iniciar/pausar/reanudar/reiniciar/confirmarReinicio). Maneja recálculo por timestamp al reenfocar app. | RF-02…RF-14 |
| `src/app/index.tsx` | Modificar | Sustituye la pantalla de bienvenida de Expo por la pantalla principal del temporizador (fase, MM:SS, pomodoros, botones). Ruta de la pestaña "Home" de los NativeTabs existentes. | RF-01, RF-02, RF-03, RF-14 |
| `src/components/timer/TimerDisplay.tsx` | Crear | Muestra fase actual, tiempo restante MM:SS y pomodoros del ciclo actual. | RF-03, RF-14 |
| `src/components/timer/TimerControls.tsx` | Crear | Botones de acción directa un toque: Iniciar / Pausar-Reanudar / Reiniciar. | RF-02, RF-04 |
| `src/components/timer/ConfirmResetDialog.tsx` | Crear | Diálogo de confirmación de reinicio (Aceptar / Cancelar). | RF-05, RF-06, RF-07 |
| `src/components/timer/AlarmDialog.tsx` | Crear | Diálogo de alarma al finalizar fase (botón Aceptar detiene alarma). | RF-10, RF-11 |
| `src/components/timer/PermissionBanner.tsx` | Crear | Banner contextual que explica utilidad del permiso y pide habilitarlo. | RF-08, RF-09, RNF-02 |
| `src/__tests__/timerLogic.test.ts` | Crear | Pruebas unitarias de funciones puras del dominio con Jest. | RF-02…RF-07, RF-10, RF-12, RF-14 |
| `src/__tests__/storage.test.ts` | Crear | Pruebas de persistencia y recálculo por timestamp (mocks de AsyncStorage y Date). | RF-13, RNF-01, Decisión 3 |

---

## 2. Funciones puras de lógica (testeables con Jest, sin efectos)

Ubicación: `src/domain/timer.ts`. Todas son puras: reciben estado + config + `now` (inyectado), devuelven nuevo estado o valor; no llaman a `Date.now()` directamente ni a APIs de dispositivo.

- `initialState(): TimerState` — estado de instalación nueva: fase Estudio, 1500 s, `status = detenido`, pomodoros 0. (RF-01, Decisión 6)
- `durationFor(phase, config): number` — segundos configurados de la fase dada. (RF-06, RF-07, RF-10, RF-12)
- `formatMMSS(seconds): string` — MM:SS con dos dígitos; cubre 00:00, 00:01, 59:59. (RF-03, RF-14, caso límite)
- `start(state, now): TimerState` — si detenido/iniciando, pone `status = corriendo` y `startedAt = now`; si ya corre, no-op. Si `tiempoRestante === 0` (fase completa), primero restaura duración completa. (RF-02, caso límite)
- `pause(state, now): TimerState` — snapshot del tiempo restante (descuenta transcurrido desde `startedAt`), `status = pausado`, `startedAt = null`. (RF-04)
- `resume(state, now): TimerState` — si pausado, `status = corriendo`, `startedAt = now` (el `tiempoRestante` ya es el restante al pausar). (RF-04)
- `resetConfirmed(state): TimerState` — `tiempoRestante = duración de la fase mostrada`, `status = detenido`, `startedAt = null`, misma fase, pomodoros intactos. (RF-06, Decisión 5)
- `resetCancelled(state): TimerState` — devuelve el estado sin cambios. (RF-07)
- `tick(state, now): TimerState | PhaseCompleted` — recalcula restante transcurrido desde `startedAt`; si llega a ≤ 0, devuelve evento "fase completada" sin iniciar la siguiente automáticamente. (RF-03, RF-10, RF-12, Decisión 1/2)
- `completePhase(state, config): TimerState` — delega sonar alarma; si fue Estudio, incrementa pomodoros y elige siguiente fase (descanso corto; descanso largo y reinicia contador a cero al llegar al límite); si fue descanso, siguiente = Estudio. `tiempoRestante = duración completa de la siguiente`, `status = detenido`. (RF-10, RF-12, Decisión 1/2/7, Constitución 2.2)
- `recalculateOnResume(state, now): TimerState` — si estaba `corriendo` al cerrar, recalcula restante con tiempo real transcurrido; si ≤ 0 → `completePhase`; si `pausado`, conserva intacto sin descontar. (RF-13, Decisión 3, Constitución 1.2)

---

## 3. Persistencia

- Librería: `@react-native-async-storage/async-storage` (ya es dependencia del proyecto).
- Clave única: `@pomodoro/state`; valor: JSON del `TimerState`.
- Guarda de forma **síncrona/atómica tras cada cambio de estado** (Constitución §4, Decisión 3).
- Al montar la app: lee el estado guardado. Si no hay, `initialState()`. Si `status === 'running'`, aplica `recalculateOnResume` con `Date.now()` (RF-13); si resultó en fase completada, `completePhase` y se prepara la siguiente detenida (caso límite: app reabierta tras fase corriendo que terminó). Si `paused`, se conserva sin descontar.
- 100 % local, sin red (RNF-01, Constitución 1.1).

---

## 4. Algoritmo en pseudocódigo

```
CONFIG = { estudio: 1500, descansoCorto: 300, descansoLargo: 900, cicloPomodoros: 4 }

estado = {
  fase: 'estudio' | 'descansoCorto' | 'descansoLargo',
  status: 'detenido' | 'corriendo' | 'pausado',
  tiempoRestante: segundos,
  duracionFase: segundos,        // duración configurada de la fase mostrada
  pomodoros: 0..4,               // completados en ciclo actual
  startedAt: timestamp | null    // momento en que se puso en 'corriendo'
}

iniciar(ahora):
  si no hay permiso de alarma: solicitarPermiso(); si denegado → bloquear inicio (RF-08)
  si estado.status == 'corriendo': retornar
  si estado.tiempoRestante == 0: estado.tiempoRestante = duraciónDeFase()  // caso límite: fase en 00:00
  estado.status = 'corriendo'
  estado.startedAt = ahora
  persistir(estado)                                          (RF-02)

pausar(ahora):
  si estado.status == 'corriendo':
    estado.tiempoRestante = restanteTranscurrido(estado, ahora)  // snapshot
    estado.status = 'pausado'
    estado.startedAt = null
    persistir(estado)                                          (RF-04)

reanudar(ahora):
  si estado.status == 'pausado':
    estado.status = 'corriendo'
    estado.startedAt = ahora
    persistir(estado)                                          (RF-04)

solicitarReinicio(aceptar: booleano):
  si !aceptar: retornar sin cambios                            (RF-07: conserva tiempo y estado)
  estado.tiempoRestante = duraciónDeFaseActual()               (RF-06)
  estado.status = 'detenido'
  estado.startedAt = null
  persistir(estado)                                            (RF-05, RF-06, Decisión 5)

tick(ahora):   // llamado en cada render y al reenfocar la app
  si estado.status != 'corriendo': retornar
  transcurrido = ahora - estado.startedAt
  nuevoRestante = estado.tiempoRestante - transcurrido
  si nuevoRestante <= 0:
    completarFase()                                            (RF-10 / RF-12: no inicia siguiente automáticamente)
  si no:
    estado.tiempoRestante = nuevoRestante
    persistir(estado)                                          (RF-03)

completarFase():
  alarma.play()   // sonido + vibración, incluso silenciado / No molestar / bloqueado (Decisión 1, Constitución 1.3)
  si estado.fase == 'estudio':
    estado.pomodoros++
    si estado.pomodoros >= CONFIG.cicloPomodoros:
      estado.siguienteFase = 'descansoLargo'
      estado.pomodoros = 0
    si no:
      estado.siguienteFase = 'descansoCorto'
  si no:  // terminó un descanso
    estado.siguienteFase = 'estudio'
  estado.fase = estado.siguienteFase
  estado.tiempoRestante = duraciónDe(estado.fase)   // duración completa, detenida (Decisión 7)
  estado.status = 'detenido'                        // NO iniciar automáticamente (Decisión 2)
  persistir(estado)                                 (RF-10, RF-12)

detenerAlarma():
  alarma.stop()                                     (RF-11)

formatoMMSS(segundos):
  m = piso(segundos / 60); s = segundos % 60
  retornar m (2 dígitos) + ":" + s (2 dígitos)      // cubre 00:00, 00:01, 59:59 (RF-03, RF-14)
```

Permiso mientras corre (RF-09): si el permiso se revoca estando `corriendo` → `pausar()` (snapshot), mostrar `PermissionBanner`, bloquear `reanudar` hasta que `hasPermission() === true`.

---

## 5. Cómo se pinta en la interfaz (Expo Router, mobile-first)

- Ruta: `src/app/index.tsx` (pestaña "Home" de los `NativeTabs` existentes). Pantalla única, sin navegador de pilas.
- `SafeAreaView` + `ThemedView`/`ThemedText` con `Colors` de `src/constants/theme.ts` (claro/oscuro).
- Encabezado: fase actual (texto grande), cronómetro MM:SS (grande), pomodoros del ciclo ("Pomodoros: X/4").
- Botones de acción directa un toque (Constitución 2.1): Iniciar / Pausar (cambia a Reanudar cuando está pausado) / Reiniciar.
- Al tocar Reiniciar: abre `ConfirmResetDialog` (Aceptar / Cancelar). Cancelar → nada cambia. Aceptar → `resetConfirmed`.
- Al completar fase: suena/vibra alarma y se muestra `AlarmDialog` con botón "Aceptar" (detiene alarma, RF-11). Debajo, la siguiente fase ya preparada detenida con su duración completa; el botón "Iniciar [fase]" también descarta la alarma y puede iniciar (RF-11, Decisión 2/9).
- Si falta permiso: `PermissionBanner` con explicación contextual (para qué sirve) + botón para habilitar; el temporizador no inicia (RF-08, RNF-02, Constitución 1.3).
- Sin anuncios, sin registro, funciona offline (Constitución 1.1/1.2).
- Accesibilidad: `accessibilityLabel` en botones y cronómetro; anuncio de cambio de fase para lectores de pantalla.

---

## 6. Decisiones técnicas (justificadas + alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| T-1 | Persistencia con `@react-native-async-storage/async-storage` (ya en dependencias). | Ya instalada; estado único pequeño; guarda local, offline y atómica en cada cambio (Constitución §4, RNF-01, Decisión 3). | `expo-sqlite`: sobrecarga para un solo objeto; migraciones innecesarias en esta HU. |
| T-2 | Lógica basada en timestamps, no solo `setInterval`. | Constitución §1.2 y Decisión 3: precisión al volver de segundo plano / dispositivo bloqueado. | `setInterval` puro: se desincroniza si el SO suspende la app. |
| T-3 | Alarma con `expo-notifications` (sonido + vibración, segundo plano/bloqueado/DND). | Constitución §1.3 exige alarma incluso en silencio / No molestar / bloqueado y vibración (Decisión 1). | `expo-av` (Audio): solo sonido, no garantiza vibración ni saltar el modo No molestar; descartada. |
|   | Nota: `expo-notifications` no está instalada → `npx expo install expo-notifications` y development build. Puerto `IAlarmService` permite mock en pruebas unitarias. | | |
| T-4 | UI con componentes nativos de RN + `StyleSheet` y el tema existente; sin librería de terceros. | Dependencias mínimas y consistencia con `theme.ts`; pantalla única justifica evitar navegador de pilas. | React Native Paper: dependencia extra innecesaria para esta HU. |
| T-5 | Guardar estado en cada cambio (no solo al suspender). | Constitución §4: evitar pérdida de estado si el SO mata la app. | Guardar solo en `AppState.background`: riesgo de perder el último segundo. |
| T-6 | Pantalla única en la pestaña "Home" (`src/app/index.tsx`). | HU-001 es una sola pantalla principal; los `NativeTabs` ya existen. | Stack navigator: navegación innecesaria para esta historia. |

---

## 7. Estrategia de pruebas con Jest

- Runner: `jest` con preset `jest-expo` (script `npm test` / `npx jest`). No hay `bun.lock`, por tanto se usa `npx` (no `bunx`).
- `src/__tests__/timerLogic.test.ts` — funciones puras del dominio:
  - `formatMMSS`: 0 → "00:00", 1 → "00:01", 3599 → "59:59", 1500 → "25:00".
  - `start`: detenido → corriendo con `startedAt`; ya corriendo → no-op.
  - `pause` / `resume`: snapshot y continuación del restante.
  - `resetConfirmed`: restaura duración completa, detenido, misma fase, pomodoros intactos.
  - `resetCancelled`: estado inalterado.
  - `tick`: descuenta transcurrido; si llega a 0 → evento fase completada.
  - `completePhase`: estudio → descanso corto + pomodoro++; al llegar a 4 → descanso largo + pomodoros = 0; descanso → estudio; siguiente detenida (no iniciada).
  - `recalculateOnResume`: corriendo + tiempo transcurrido → restante reducido; si ≤ 0 → completa fase; pausado → conserva sin descontar.
- `src/__tests__/storage.test.ts` — persistencia (mocks de `AsyncStorage` y `Date.now`):
  - guarda y carga estado; recálculo al reabrir con estado corriendo; pausado se conserva sin descontar; ausencia de estado → `initialState`.
- Mocks: `IAlarmService` mockeado (no se toca el módulo nativo en pruebas unitarias); `AsyncStorage` mockeado.
- Criterio de pase: `npx jest` verde, `npx tsc --noEmit` sin errores, `npx expo lint` limpio.

---

## 8. Trazabilidad RF → plan

RF-01: `pomodoro.ts` + `index.tsx` (estado inicial Estudio 25:00 detenido)
RF-02: `domain/timer.start` + `useTimer.iniciar` + `TimerControls`
RF-03: `domain/timer.tick` + `formatMMSS` + `TimerDisplay`
RF-04: `domain/timer.pause` / `resume`
RF-05 / RF-06 / RF-07: `ConfirmResetDialog` + `domain/timer.resetConfirmed` / `resetCancelled`
RF-08 / RF-09: `services/alarm` + `services/permissions` + `PermissionBanner` + `useTimer` (bloqueo si no hay permiso)
RF-10: `domain/timer.completePhase` + `AlarmDialog` + `expo-notifications`
RF-11: `AlarmDialog` (Aceptar detiene alarma)
RF-12: `domain/timer.completePhase` (descanso → Estudio detenida)
RF-13: `domain/timer.recalculateOnResume` + `storage.cargaAlIniciar`
RF-14: `TimerDisplay` (fase, MM:SS, pomodoros del ciclo)
RNF-01: `storage` (AsyncStorage, 100 % local/offline)
RNF-02: `services/permissions` + `PermissionBanner` (explicación contextual antes de solicitar)

**Criterios de finalización del plan:** cubren los 4 escenarios de HU-001 (Esc. 1: RF-02/03; Esc. 2: RF-04; Esc. 3: RF-05/06; Esc. 4: RF-07) y todos los RF listados en la spec.
