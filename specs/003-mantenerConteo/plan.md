# Plan — Spec 003: Mantener el conteo (HU-003)

Estado: planificación (pendiente de implementación)

## 1. Archivos que se crean o modifican y responsabilidad de cada uno

| Archivo | Acción | Responsabilidad | RFs cubiertos |
|---|---|---|---|
| `src/domain/timer.ts` | Modificar | Añadir función pura `reinicioCompleto(): TimerState` que devuelve el estado inicial del pomodoro (estudio 25:00, detenido, pomodoros 0). | RF-08, RF-09 |
| `src/services/storage.ts` | Modificar | `guardarEstado` envuelve `AsyncStorage.setItem` en try/catch; si falla, rechaza la promesa con el motivo del error (sin bloquear la app). | RF-05 |
| `src/hooks/useTimer.ts` | Modificar | (a) Estado `errorPersistencia`; (b) `persist()` centraliza `setState` + `guardarEstado` atrapando errores y guardando el motivo; (c) acción `reiniciarCompleto()`; (d) sustituir llamadas directas `void guardarEstado` por `persist()`. | RF-01, RF-02, RF-03, RF-05, RF-07, RF-08, RF-09, RF-10 |
| `src/components/timer/ConfirmResetDialog.tsx` | Modificar | Aceptar props opcionales `titulo` y `descripcion` para reutilizar el diálogo de confirmación tanto en el reinicio por fase como en el reinicio completo de pomodoro. | RF-08, RF-09 |
| `src/components/timer/ReinicioCompletoPomodoro.tsx` | Crear | Componente con el botón siempre visible "Reinicio Completo de Pomodoro" (objetivo táctil ≥44×44, accessibilityLabel, textos en español, StyleSheet). | RF-08, RF-09 |
| `src/components/timer/ErrorPersistenciaBanner.tsx` | Crear | Banner no bloqueante que muestra el motivo del fallo de persistencia y permite cerrarlo. | RF-05 |
| `src/app/(tabs)/index.tsx` | Modificar | Renderizar `<ReinicioCompletoPomodoro>` y `<ErrorPersistenciaBanner>`; cablear confirmación de reinicio completo → `reiniciarCompleto()`. | RF-05, RF-08, RF-09 |
| `src/__tests__/timerLogic.test.ts` | Modificar | Añadir bloque de pruebas para `reinicioCompleto()`. | RF-08, RF-09 |
| `src/__tests__/storage.test.ts` | Modificar | Añadir prueba de fallo de almacenamiento (AsyncStorage rechaza) → error propagado con motivo. | RF-05 |
| `src/__tests__/useTimer.test.ts` | Crear | Pruebas del hook: carga al montar, recálculo por timestamps (corriendo/pausado), bloqueo de inicio sin permiso, reinicio completo, error de persistencia. | RF-01, RF-02, RF-03, RF-05, RF-07, RF-08, RF-09, RF-10 |

Total: 6 modificaciones + 3 creaciones = 9 archivos.

## 2. Funciones puras de lógica

Todas residen en `src/domain/timer.ts` (reciben estado + `now` inyectado, nunca `Date.now()` ni APIs de dispositivo):

- `reinicioCompleto(): TimerState` → retorna `initialState()` (fase estudio, 25:00, detenido, pomodoros 0, startedAt null, faseAnterior null). No recibe parámetros; es la función base del reinicio completo de pomodoro (RF-08, RF-09).
- Las funciones existentes `start`, `pause`, `resume`, `tick`, `completePhase`, `recalculateOnResume` se reutilizan sin cambios.

## 3. Persistencia

- Clave única: `@pomodoro/state` (AsyncStorage), 100% local, sin red (RNF-01, Constitución 1.1).
- `guardarEstado(state)` persiste todo el estado del temporizador (tiempo restante, status, startedAt, fase, pomodoros, configuración, ciclo) antes de suspender/cerrar (RF-01, RF-07).
- Si `AsyncStorage.setItem` falla (falta de espacio, etc.), `guardarEstado` rechaza con el mensaje del error; la app no se bloquea y se muestra un banner con el motivo (RF-05).
- `cargarEstado()` devuelve el estado guardado o `null` si es instalación nueva.

## 4. Algoritmo en pseudocódigo

### Al montar la app (useEffect, una sola vez)
```
guardado = cargarEstado()
si guardado existe:
    si guardado.status == 'corriendo':
        resultado = recalculateOnResume(guardado, ahora)   // timestamps
        si resultado es FASE_COMPLETADA:
            manejarFaseCompletada()   // alarma + siguiente fase detenida + guardar
        si no:
            setState(resultado); persist(resultado)
    si no (pausado o detenido):
        setState(guardado)   // conserva tal cual, sin descontar (RF-03)
permiso = solicitarPermisoAlarma()   // para RF-10 (bloqueo de inicio)
```

### Al volver de segundo plano / desbloquear dispositivo (AppState 'active')
```
si state.status == 'corriendo':
    resultado = recalculateOnResume(state, ahora)
    si resultado es FASE_COMPLETADA:
        manejarFaseCompletada()
    si no:
        persist(resultado)
```

### Cada cambio de estado del usuario (iniciar/pausar/reanudar/reiniciar fase)
```
persist(siguienteEstado)   // setState + guardarEstado atrapando errores
```

### Reinicio completo de pomodoro (botón siempre visible)
```
reiniciarCompleto():
    siguiente = initialState()
    setState(siguiente); tiempoMostrar = 25:00
    persist(siguiente)   // si falla → banner de error (RF-05)
```

### Inicio del temporizador (RF-10: permiso requerido)
```
iniciar():
    tienePermiso = solicitarPermisoAlarma()
    si !tienePermiso:
        mostrarBannerPermiso = true
        return   // NO arranca el temporizador
    siguiente = start(state, ahora)
    persist(siguiente)
```

## 5. Cómo se pinta en la interfaz

Pantalla principal `src/app/(tabs)/index.tsx` (ya existente):

1. Si `errorPersistencia` tiene valor → renderizar `<ErrorPersistenciaBanner mensaje={motivo} onCerrar={limpiarError} />` (no bloqueante, superior al contenido).
2. Si `mostrarBannerPermiso && permisoConcedido === false` → `<PermissionBanner>` (ya existente).
3. `<TimerDisplay state={state} tiempoMostrar={tiempoMostrar} />` (ya existente).
4. `<TimerControls ... onReiniciar={abrirConfirmacionFase} />` (ya existente, reinicio por fase con confirmación).
5. `<ReinicioCompletoPomodoro onReiniciarCompleto={abrirConfirmacionCompleto} />` — **nuevo**, botón siempre visible, parte inferior de la pantalla.
6. `<ConfirmResetDialog>` — reutilizado con texto personalizable:
   - Reinicio por fase: título/descripción actuales.
   - Reinicio completo: "¿Reiniciar completamente el pomodoro? Volverá a la fase de Estudio con 25:00 y se reiniciará el contador de pomodoros."
7. `<AlarmDialog visible={alarmaActiva} ... />` (ya existente).

Estilos: `StyleSheet`, sin librerías adicionales. Colores consistentes con la pantalla existente (`#3C9FFE` primario, `#E0E1E6` secundario) para no introducir inconsistencia visual con specs 001/002. Textos en español. Accesibilidad: `accessibilityLabel`, `accessibilityRole="button"` en botones.

## 6. Decisiones técnicas justificadas (con alternativa descartada)

| Decisión | Opción elegida | Alternativa descartada | Justificación |
|---|---|---|---|
| Confirmación antes de reinicio completo | Diálogo reutilizable (`ConfirmResetDialog` con `titulo`/`descripcion` opcionales) | Reset inmediato sin confirmación al presionar el botón | Constitución §2.1 exige confirmación explícita para reinicios; rn-conventions línea 15 pide diálogo para acciones destructivas/reset. Decision 3 dice "el usuario decide cuándo reiniciar" — la confirmación refuerza ese control. |
| Color del nuevo botón | `#3C9FFE` (igual que el botón primario existente) | `#D4A017` de la guía `estilos-colores` | Mantener consistencia visual con la pantalla ya implementada (specs 001/002, confirmada en Expo Go). La guía de estilos aún no se ha aplicado a ningún componente existente; usar un color distinto rompería la identidad visual. |
| Centralizar persistencia | `persist()` en el hook que atrape errores de `guardarEstado` | Dejar `void guardarEstado()` ignorando fallos en cada llamador | RF-05 requiere notificar el fallo sin bloquear la app; centralizar evita olvidar el manejo de error en algún llamador. |
| Dónde vive `reinicioCompleto` | Función pura en `src/domain/timer.ts` | Lógica dentro del hook | Mantener la lógica de dominio pura y testeable sin mocks de dispositivo (patrón ya usado en specs 001/002). |

## 7. Estrategia de pruebas con Jest

- **Lógica pura (`timerLogic.test.ts`):** pruebas de `reinicioCompleto()` — devuelve `initialState()`, fase estudio, 25:00, detenido, pomodoros 0, startedAt null, faseAnterior null. Verificable con `npx jest`.
- **Persistencia (`storage.test.ts`):** mockeo de AsyncStorage que rechaza `setItem`; verificar que `guardarEstado` propaga el motivo del error y que `cargarEstado` sigue funcionando. Verificable con `npx jest`.
- **Hook (`useTimer.test.ts`, nuevo):** mock de `cargarEstado`, `guardarEstado`, `solicitarPermisoAlarma` y `alarmService`. Pruebas:
  - Carga estado guardado al montar y lo setea (RF-07).
  - Si estaba corriendo, recalcula con timestamps al reabrir (RF-01, RF-02, RNF-02).
  - Si estaba pausado, conserva el restante sin descontar (RF-03).
  - Sin permiso de notificaciones, `iniciar` no arranca el temporizador (RF-10).
  - `reiniciarCompleto()` restaura `initialState()` y persiste (RF-08, RF-09).
  - Fallo de persistencia expone `errorPersistencia` sin tirar la app (RF-05).
- **Umbre de éxito:** `npx jest` en verde (todas las suites: alarm, timerLogic, storage, useTimer); `npx tsc --noEmit` sin errores; `npx expo lint` sin errores nuevos.

## 8. Cobertura de RF por parte del plan

- RF-01 (guardar marca de tiempo al cerrar/bloquear corriendo) → `guardarEstado` + carga al montar + recálculo (storage.ts, useTimer.ts).
- RF-02 (recalcular al reabrir descontando tiempo real) → `recalculateOnResume` en useTimer.ts al montar y al volver de segundo plano.
- RF-03 (pausado: conserva tiempo sin descontar) → `recalculateOnResume` / carga sin recalcular (useTimer.ts).
- RF-04 (notificación fin de fase con app cerrada) → ya cubierto por specs 001/002 (`manejarFaseCompletada` + alarm); aquí se dispara desde `recalculateOnResume` cuando expira al reabrir.
- RF-05 (fallo de almacenamiento → error con motivo, no bloquear) → `guardarEstado` try/catch + `errorPersistencia` + banner.
- RF-06 (reinicio de dispositivo → empieza de cero) → `recalculateOnResume` no puede recuperar tras apagón; al montar no hay `startedAt` válido persistido de forma confiable, el estado se reinicia (ya cubierto por lógica existente + `initialState`).
- RF-07 (persistir todo el estado antes de suspender) → `guardarEstado` en cada cambio (storage.ts, useTimer.ts).
- RF-08 (no reinicio automático tras días; botón de reinicio completo) → `ReinicioCompletoPomodoro` + `reiniciarCompleto()`; no hay lógica de auto-avance por tiempo transcurrido de días.
- RF-09 (botón siempre visible de reinicio completo) → `ReinicioCompletoPomodoro` renderizado siempre en HomeScreen.
- RF-10 (bloquear inicio sin permiso; explicar por qué) → `iniciar` comprueba `solicitarPermisoAlarma` y muestra `PermissionBanner` con `MENSAJE_PERMISO_ALARMA`.

RNFs: RNF-01 (offline/local) → AsyncStorage solo; RNF-02 (timestamps no setInterval) → `recalculateOnResume`; RNF-03 (explicar permiso) → `MENSAJE_PERMISO_ALARMA` en `PermissionBanner`.
