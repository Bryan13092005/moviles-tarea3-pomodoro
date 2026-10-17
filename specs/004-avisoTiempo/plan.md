# Plan — Spec 004 — Aviso de Fin de Fase (AvisoTiempo)

Estado: plan
HU de origen: docs/historias/HU_004.md
Spec: specs/004-avisoTiempo/spec.md (aprobado)

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| src/hooks/useTimer.ts | Modificar | Añadir temporizador de silencio automático de 30 s al aviso de fin de fase (`alarmaActiva`), limpiado al detener manualmente y al desmontar; pasar la fase finalizada a `alarmService.play()`. | RF-01, RF-03, RF-04, RF-05, RF-06, RF-10 |
| src/services/alarm.ts | Modificar | `IAlarmService.play(fase)` recibe la fase finalizada y la incluye en el `body` de la notificación; mantener prioridad HIGH, sonido y vibración. | RF-01, RF-02, RF-03 |
| src/services/permissions.ts | Sin cambios | Flujo de permiso con explicación contextual antes de solicitar al SO (ya implementado). | RF-07, RF-08 |
| src/components/timer/AlarmDialog.tsx | Sin cambios | Aviso de "fase finalizada" con botón Aceptar que llama a `detenerAlarma()`. | RF-04, RF-06 |
| src/app/(tabs)/index.tsx | Sin cambios | Cableado del diálogo de alarma, controles y banners (ya implementado). | RF-04, RF-06, RF-07, RF-08 |
| src/__tests__/useTimer.test.ts | Crear pruebas | Pruebas de RF-05 con fake timers (silencio a los 30 s; detención temprana cancela el temporizador). | RF-05, RF-10 |
| src/__tests__/alarm.test.ts | Crear pruebas | Prueba de que `scheduleNotificationAsync` recibe un `body` con el nombre de la fase. | RF-01 |
| src/__tests__/timerLogic.test.ts | Sin cambios | `completePhase` ya probado: deja la siguiente fase `detenida`, sin auto-inicio. | RF-01, RF-02, RF-03, RF-10 |

## 2. Funciones puras de lógica

No se añaden funciones puras al dominio (`src/domain/timer.ts`). El silencio a los 30 s es un efecto temporal del hook (depende de `setTimeout` y del ciclo de vida del componente), no pertenece al dominio basado en marcas de tiempo, que es determinista y sin efectos temporales. `completePhase` ya existe y devuelve la siguiente fase en estado `detenido` sin iniciarla automáticamente (RF-10, Decisión 6).

## 3. Persistencia

No hay cambios en `src/services/storage.ts`. `manejarFaseCompletada` ya persiste el estado de transición (siguiente fase detenida, `faseAnterior` actualizado) antes de activar el aviso (Constitución §4: guardar antes de suspender).

## 4. Algoritmo (pseudocódigo)

```
alarmTimeoutRef: Ref<number | null> = null   // ID del setTimeout de 30 s

manejarFaseCompletada(faseAnterior, state, persist, setTiempoMostrar, setAlarmaActiva):
  estadoTransicion = completePhase({ ...state, fase: faseAnterior }, DURACION_POR_FASE)
  persist(estadoTransicion)
  setTiempoMostrar(estadoTransicion.tiempoRestante)
  setAlarmaActiva(true)
  void alarmService.play(faseAnterior)           // RF-01: body indica la fase
  // RF-05: silencio automático a los 30 s sin interacción del usuario
  alarmTimeoutRef.current = setTimeout(() => {
    setAlarmaActiva(false)
    alarmTimeoutRef.current = null
    void alarmService.stop()
  }, 30_000)

detenerAlarma():
  setAlarmaActiva(false)
  if (alarmTimeoutRef.current !== null):
    clearTimeout(alarmTimeoutRef.current)
    alarmTimeoutRef.current = null
  void alarmService.stop()                       // RF-04 / RF-11

useEffect (limpieza al desmontar):
  if (alarmTimeoutRef.current !== null): clearTimeout(alarmTimeoutRef.current)
```

`completePhase` (dominio, ya existente) no inicia la siguiente fase: la deja `detenido` a la espera de que el usuario pulse iniciar (RF-10, Decisión 6).

## 5. Interfaz (cómo se pinta)

- Mientras suena la alarma: `AlarmDialog` visible con "¡Fase finalizada!", texto descriptivo y botón "Aceptar" (RF-06). Tocar Aceptar → `detenerAlarma()` y se renderiza la siguiente fase preparada (detenida) (RF-04, RF-10).
- La siguiente fase NO se inicia automáticamente tras el aviso (Decisión 6). El usuario debe pulsar iniciar para comenzarla.
- Si el permiso está denegado: `PermissionBanner` con explicación contextual y las acciones del temporizador quedan bloqueadas (RF-07, RF-08). RF-09 (cerrar la app sin permiso) queda por verificar a nivel de dispositivo.
- La notificación del SO incluye sonido, vibración, prioridad HIGH y el nombre de la fase finalizada (RF-01, RF-02, RF-03).

## 6. Decisiones técnicas (con alternativa descartada)

1. **Silencio a los 30 s con `setTimeout` en el hook (React)** en lugar de programar una notificación cancelable con `trigger` en expo-notifications.
   - Justificación: el aviso sonoro en primer plano se controla por el estado `alarmaActiva` del hook; expo-notifications no garantiza cancelación fiable de una notificación ya disparada ni expone un temporizador de silencio aplicable a la presentación en app.
   - Alternativa descartada: `Notifications.scheduleNotificationAsync({ trigger: { seconds: 30 }, ... })` para auto-silencio. Descartada por falta de cancelación determinista en pruebas y acoplo innecesario al SO.

2. **`play(fase?: FasePomodoro)` recibe la fase finalizada** para incluirla en el `body` de la notificación, en lugar de leer el phase desde el estado dentro del servicio.
   - Justificación: mantiene la separación de capas; el servicio de alarma no depende del estado de React y sigue siendo mockeable en pruebas unitarias.
   - Alternativa descartada: leer `state.fase` dentro de `alarmService.play()`. Descartada porque el servicio no tiene acceso al estado del temporizador y rompería la prueba unitaria del servicio.

## 7. Estrategia de pruebas con Jest

- `src/__tests__/useTimer.test.ts` (fake timers): completar una fase, avanzar el reloj 30 s y verificar `alarmaActiva === false` + `alarmService.stop` llamado (RF-05); detener la alarma antes de 30 s y verificar que no se silencia sola (RF-05); verificar que tras la fase completa la siguiente fase queda `detenida` y no se inicia sola (RF-10, Decisión 6).
- `src/__tests__/alarm.test.ts`: verificar que `scheduleNotificationAsync` se invoca con un `body` que contiene el nombre de la fase finalizada (RF-01).
- `src/__tests__/timerLogic.test.ts`: no tocar; `completePhase` ya cubre RF-01…RF-03 y RF-10.
- Ejecutar `npx jest` (todas las suites verdes), `npx tsc --noEmit` (sin errores) y `npx expo lint` (sin errores nuevos).

## 8. Trazabilidad RF

| RF | Dónde se implementa/verifica |
|---|---|
| RF-01 | `alarmService.play(fase)` body con nombre de fase + sound/vibrate (alarm.ts, alarm.test.ts) |
| RF-02 | prioridad HIGH + sonido + vibración (alarm.ts, existente) |
| RF-03 | `manejarFaseCompletada` + `recalculateOnResume` disparan el aviso independientemente del estado de la app (useTimer.ts, existente) |
| RF-04 | `detenerAlarma()` + `AlarmDialog` (useTimer.ts, AlarmDialog.tsx, existente) |
| RF-05 | `setTimeout` 30 s en `manejarFaseCompletada` + limpieza en `detenerAlarma` (useTimer.ts, NUEVO, useTimer.test.ts) |
| RF-06 | `AlarmDialog` "¡Fase finalizada!" + Aceptar → siguiente fase (AlarmDialog.tsx, existente) |
| RF-07 | `iniciar` explica y solicita permiso si no concedido (useTimer.ts, existente) |
| RF-08 | permiso ya concedido → no se vuelve a pedir (useTimer.ts, PermissionBanner, existente) |
| RF-09 | sin permiso se bloquea iniciar/reanudar y se muestra banner (useTimer.ts, existente); cierre de app a verificar |
| RF-10 | siguiente fase `detenida`, no auto-inicio tras aviso (completePhase, existente) |

RNF-01 (offline), RNF-02 (explicación contextual del permiso), RNF-03 (sin anuncios): ya cubiertos por la implementación existente y la Constitución.
