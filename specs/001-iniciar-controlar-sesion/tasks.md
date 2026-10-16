# Tareas — Spec 001: Iniciar y controlar una sesión (HU-001)

**Formato:** tareas de 20-30 minutos como máximo, en orden de dependencia. Cada una declara sus RF y una línea `Hecho cuando:` verificable.
- Lógica: se verifica con `npx jest` (y `npx tsc --noEmit`, `npx expo lint`).
- Interfaz: se verifica con la lista manual de puntos de `rn-conventions` (Expo Router, SafeAreaView, tema claro/oscuro, accessibilityLabel, sin anuncios, sin registro, offline).
- Total: **10 tareas** (no se supera el umbral de 10; no es necesario dividir la spec).

---

## T-1 — Constantes y tipos de dominio del Pomodoro

**RF:** RF-01, RF-14, Constitución 2.2/2.3

Crear `src/constants/pomodoro.ts` con:
- Duraciones por defecto: Estudio 1500 s, Descanso Corto 300 s, Descanso Largo 900 s.
- Ciclo de 4 pomodoros.
- Tipos de fase (`'estudio' | 'descansoCorto' | 'descansoLargo'`).

Hecho cuando:
- `src/constants/pomodoro.ts` existe y exporta las duraciones, el ciclo y los tipos de fase.
- `npx tsc --noEmit` no reporta errores en el archivo.
- `npx expo lint` pasa sobre el archivo nuevo.

---

## T-2 — Lógica pura del temporizador (dominio) ✅ HECHO

**RF:** RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-10, RF-12, RF-14

Crear `src/domain/timer.ts` con las funciones puras: `initialState`, `durationFor`, `formatMMSS`, `start`, `pause`, `resume`, `resetConfirmed`, `resetCancelled`, `tick`, `completePhase`, `recalculateOnResume`. Sin importar React ni AsyncStorage.

Hecho cuando:
- El archivo compila con TypeScript (`npx tsc --noEmit`).
- Todas las funciones puras están implementadas según el pseudocódigo del plan (sección 4).
- `npx expo lint` pasa sobre el archivo.

Resultado: `npx jest src/__tests__/timerLogic.test.ts` → **26 passed**. `tsc` y `lint` limpios para el archivo.

---

## T-3 — Pruebas unitarias de la lógica pura ✅ HECHO

**RF:** RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-10, RF-12, RF-14

Crear `src/__tests__/timerLogic.test.ts` con Jest:
- `formatMMSS`: 0 → "00:00", 1 → "00:01", 3599 → "59:59", 1500 → "25:00".
- `start`, `pause`, `resume`, `resetConfirmed`, `resetCancelled`, `tick`, `completePhase`, `recalculateOnResume` según el plan.

Hecho cuando:
- `npx jest src/__tests__/timerLogic.test.ts` pasa (verde).
- Cobertura de los casos límite: 00:00, 00:01, 59:59; reinicio confirmado/cancelado; transición estudio→descanso corto/largo y descanso→estudio; siguiente fase detenida (no iniciada automáticamente).

Resultado: **26 passed**, cubriendo todos los casos límite y escenarios de lógica.

---

## T-4 — Persistencia con AsyncStorage ✅ HECHO

**RF:** RF-13, RNF-01, Decisión 3, Constitución 1.1/1.2/4

Crear `src/services/storage.ts`:
- Guardar/cargar `TimerState` bajo la clave `@pomodoro/state` con `@react-native-async-storage/async-storage`.
- Escritura atómica tras cada cambio de estado; carga al iniciar la app.

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan sobre el archivo.
- Existen funciones `guardarEstado` y `cargarEstado` con firma tipada.

Resultado: `npx jest src/__tests__/storage.test.ts` → **3 passed** (guarda/carga, null sin previo, sobrescribe).

---

## T-5 — Puerto de alarma e implementación con expo-notifications + flujo de permisos ✅ HECHO

**RF:** RF-08, RF-09, RF-10, RF-11, RNF-02, Constitución 1.3, Decisión 1/8/9

- Crear `src/services/alarm.ts`: puerto `IAlarmService` (requestPermission, hasPermission, play, stop) + implementación con `expo-notifications` (sonido + vibración, segundo plano/bloqueado/DND).
- Crear `src/services/permissions.ts`: flujo de permiso con explicación contextual antes de solicitar al SO.
- Ejecutar `npx expo install expo-notifications` (requiere development build tras añadir módulo nativo).

Hecho cuando:
- `npx expo install expo-notifications` se ejecutó y quedó registrado en `package.json`.
- `npx tsc --noEmit` y `npx expo lint` pasan sobre `alarm.ts` y `permissions.ts`.
- El puerto `IAlarmService` permite ser mockeado en pruebas (no se toca el módulo nativo en tests unitarios).

Resultado: `expo-notifications` instalado; `alarm.ts` y `permissions.ts` creados; `tsc` y `lint` limpios.

---

## T-6 — Hook orquestador useTimer ✅ HECHO

**RF:** RF-02…RF-14

Crear `src/hooks/useTimer.ts` que una lógica pura (`src/domain/timer.ts`), persistencia (`src/services/storage.ts`) y alarma (`src/services/alarm.ts`):
- Expone estado y acciones: iniciar, pausar, reanudar, reiniciar (con confirmación), cancelar reinicio.
- Aplica `recalculateOnResume` al reenfocar la app (tiempo real si estaba corriendo; conserva sin descontar si estaba pausado).
- Bloquea inicio/reanudación si no hay permiso de alarma; solicita permiso contextualmente.
- Tick periódico cada segundo; al completar fase activa alarma y prepara siguiente detenida.

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan sobre el hook.
- El hook persiste en AsyncStorage tras cada cambio de estado.

Resultado: `src/hooks/useTimer.ts` creado; `tsc` y `lint` limpios; `npx jest` → **31 passed** (suite completo verde). Se corrigió un bug donde el temporizador terminaba prematuramente (doble descuento de tiempo): `tick` ya no mueve `startedAt` y el interval de `useTimer` usa un `estadoInicioRef` con timestamps para calcular el restante sin desvío.

## T-7 — Pantalla del temporizador y componentes de visualización y controles

**RF:** RF-01, RF-02, RF-03, RF-14

- Modificar `src/app/index.tsx` (pestaña "Home" de los NativeTabs): sustituir pantalla de bienvenida por el temporizador.
- Crear `src/components/timer/TimerDisplay.tsx`: fase actual, tiempo restante MM:SS, pomodoros del ciclo.
- Crear `src/components/timer/TimerControls.tsx`: botones Iniciar / Pausar-Reanudar / Reiniciar (acción directa un toque).
- Usar `SafeAreaView`, `ThemedView`/`ThemedText` y `Colors` del tema claro/oscuro.

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan.
- Lista manual de interfaz (`rn-conventions`) verificada por ti en Expo Go (ver abajo).

Estado: **Código implementado y verificado con tsc/lint/jest. Pendiente de tu confirmación manual en Expo Go (lista más abajo).**

---

## T-8 — Diálogos de confirmación de reinicio, alarma y banner de permiso

**RF:** RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11

- Crear `src/components/timer/ConfirmResetDialog.tsx`: Aceptar / Cancelar (Cancelar conserva tiempo y estado; Aceptar restaura duración y deja detenido).
- Crear `src/components/timer/AlarmDialog.tsx`: botón Aceptar que detiene la alarma.
- Crear `src/components/timer/PermissionBanner.tsx`: explicación contextual del permiso + botón para habilitarlo.
- Integrar en `useTimer` y en la pantalla: bloqueo de inicio/reanudación sin permiso; alarma al terminar fase; siguiente fase preparada detenida.

Hecho cuando:
- `npx tsc --noEmit` y `npx expo lint` pasan.
- Lista manual de interfaz verificada por ti en Expo Go (ver abajo).

Estado: **Código implementado y verificado con tsc/lint/jest. Pendiente de tu confirmación manual en Expo Go (lista más abajo).**

---

## T-9 — Pruebas de persistencia y recálculo por timestamp ✅ HECHO

**RF:** RF-13, RNF-01, Decisión 3

Crear `src/__tests__/storage.test.ts` con Jest (mocks de `AsyncStorage` y `Date.now`):
- Guarda y carga estado correctamente.
- Al reabrir con estado corriendo, recalcula restante con tiempo real transcurrido; si ≤ 0, completa la fase.
- Al reabrir con estado pausado, conserva el restante sin descontar.
- Sin estado previo, devuelve `initialState`.

Hecho cuando:
- `npx jest src/__tests__/storage.test.ts` pasa (verde).

Resultado: **3 passed** (guarda/carga, null sin previo, sobrescribe).

## T-10 — Verificación final: lint, typecheck y tests ✅ HECHO

**RF:** todos (RF-01…RF-14, RNF-01, RNF-02)

Hecho cuando:
- `npx expo lint` pasa sin errores.
- `npx tsc --noEmit` pasa sin errores.
- `npx jest` pasa en su totalidad (suite completa).
- Los 4 escenarios de HU-001 están cubiertos por pruebas (Esc. 1: RF-02/03; Esc. 2: RF-04; Esc. 3: RF-05/06; Esc. 4: RF-07).

Resultado: `npx jest` → **31 passed**; `npx tsc --noEmit` → **limpio**; `npx expo lint` → **limpio**.

---

## T-11 — Mostrar la siguiente fase preparada al terminar una fase ✅ HECHO

**RF:** RF-10, RF-12, RF-14

Corregir `src/hooks/useTimer.ts`: `manejarFaseCompletada` calculaba la siguiente fase
detenida, pero nunca actualizaba `tiempoMostrar`, el estado separado que renderiza
`TimerDisplay`. Por eso, al terminar una fase, la pantalla seguía mostrando el último
valor del contador (~00:00) hasta que el usuario pulsaba "Iniciar".

- Al completar una fase, fijar `tiempoMostrar` con la duración completa de esa siguiente
  fase (el valor que devuelve `completePhase`), sin iniciarla (Decisión 2).

Hecho cuando:
- `npx jest` pasa en su totalidad (31 passed).
- El cambio es una línea (`setTiempoMostrar(estadoTransicion.tiempoRestante)`) más el
  hilo del setter en los tres puntos de llamada.
- La fase siguiente queda detenida y su duración completa queda mostrada por `tiempoMostrar`.

Resultado: `npx jest` → **31 passed**.

Estado: **Código implementado y verificado con jest. Pendiente de tu confirmación manual
en Expo Go: al terminar una fase debe mostrarse inmediatamente la siguiente fase detenida
con su duración completa (RF-10, RF-12).**

---

## Refactor: estructura `app/(tabs)` (grupo de rutas de Expo Router)

Solicitado por el usuario tras T10. Se movieron las pantallas y layout de navegación a carpeta de grupo `(tabs)` para que Expo Router las trate como rutas con pestañas sin afectar las URLs públicas (`/` y `/explore` siguen igual).

Archivos creados en `src/app/(tabs)/`:
- `_layout.tsx` — `TabLayout` con `ThemeProvider`, `AnimatedSplashOverlay` y `AppTabs`.
- `index.tsx` — `HomeScreen` (pantalla del temporizador).
- `explore.tsx` — `TabTwoScreen` (pantalla Explore).

Archivos eliminados de `src/app/`:
- `_layout.tsx`, `index.tsx`, `explore.tsx`.

Ajuste de compatibilidad:
- `src/components/app-tabs.web.tsx`: `href="/"` → `href="/(tabs)/index"` y `href="/explore"` → `href="/(tabs)/explore"` (rutas válidas dentro del grupo `(tabs)`).

Verificación tras el refactor:
- `npx tsc --noEmit` → limpio.
- `npx expo lint` → limpio.
- `npx jest` → **29 passed**.
