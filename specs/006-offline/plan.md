# Plan — Spec 006 — Offline

Estado: plan
HU de origen: docs/constitution.md (sección 1.1)
Spec: specs/006-offline/spec.md (aprobado)

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `src/services/storage.ts` | Modificar | `cargarEstado()` envuelve `JSON.parse` en try/catch: si los datos están corruptos o no son un TimerState válido, lanza `Error` con el motivo (RF-04). Devuelve `null` solo cuando no hay previo (instalación nueva → valores de fábrica, RF-07). `guardarEstado`/`guardarConfiguracion` mantienen su try/catch que rechaza con motivo (RF-06, RF-09). Todo 100% local vía AsyncStorage, sin red (RNF-01, RNF-03). | RF-04, RF-06, RF-07, RF-09 |
| `src/hooks/useTimer.ts` | Modificar | Añadir estado `errorCarga` (string \| null) y función `reintentarCarga`. Al montar, captura errores de `cargarEstado()`/`cargarConfiguracion()`: si falla la lectura, guarda `errorCarga`, no inicia el temporizador y no llama a `start`/`persist` con sesión parcial. Cada nuevo montaje (relanzar la app) reintenta la lectura automáticamente (RF-05). `persist` sigue capturando fallos de `guardarEstado` y expone `errorPersistencia` (RF-06, RF-09). `guardarAjustes` captura fallos de `guardarConfiguracion` sin cambiar `configuracion` ni pantalla (RF-06). | RF-04, RF-05, RF-06, RF-09 |
| `src/components/timer/ErrorCargaBanner.tsx` | Crear | Banner de error de sistema (no comercial) que muestra el motivo de la falla de lectura al iniciar, con botón "Reintentar" (vuelve a intentar `cargarEstado`/`cargarConfiguracion`) y botón "Cerrar". No es un indicador de modo offline. | RF-04, RF-05, RF-10 |
| `src/app/(tabs)/index.tsx` | Modificar | Cablear `errorCarga` y `reintentarCarga` del hook. Cuando `errorCarga` no es null, renderizar `ErrorCargaBanner` en lugar del temporizador (app no inicia el temporizador, RF-04). Cuando no hay error, renderizar el temporizador normalmente (RF-01, RF-02, RF-03, RF-07, RF-08, RF-10). | RF-01, RF-02, RF-03, RF-04, RF-05, RF-07, RF-08, RF-10 |
| `src/__tests__/storage.test.ts` | Modificar | Añadir pruebas de `cargarEstado` con JSON corrupto (rechaza con motivo, RF-04), `cargarEstado` devuelve `null` cuando no hay previo (instalación nueva → fábrica, RF-07), `guardarConfiguracion` rechaza si `setItem` falla (RF-06). | RF-04, RF-06, RF-07 |
| `src/__tests__/useTimer.test.ts` | Modificar | Añadir pruebas de carga fallida al montar (`errorCarga` se setea, temporizador no inicia, RF-04), reintento automático al nuevo montaje (RF-05), escritura fallida de estado al suspender (`errorPersistencia` y recuperación del último válido, RF-09), `guardarAjustes` falla sin cambiar configuración ni pantalla (RF-06). | RF-04, RF-05, RF-06, RF-09 |
| `src/__tests__/timerLogic.test.ts` | Sin cambios | Ya cubre recálculo por timestamps y persistencia de sesión (RF-02). | RF-02 |

## 2. Funciones puras de lógica

No se añaden funciones puras nuevas en el dominio; se reutilizan las existentes:
- `initialState(duraciones)` en `src/domain/timer.ts`: valores de fábrica (fase Estudio, detenido, 0 pomodoros) usados cuando no hay estado previo (RF-07).
- `recalculateOnResume(state, now)` en `src/domain/timer.ts`: recálculo por timestamp al reabrir (RF-02, ya probado en specs 001/002).
- `validarCampo` / `validarConfiguracion` en `src/domain/config.ts`: validación pura de ajustes (RF-01, RF-05, RF-06, RF-07, RF-11, ya probado en spec 005).

El ajuste de lógica de esta spec vive en el servicio de persistencia (`storage.ts`, `cargarEstado`) y en el hook (`useTimer`, manejo de `errorCarga`), no en funciones puras del dominio.

## 3. Persistencia

- Clave `@pomodoro/state` (estado del temporizador) y clave `@pomodoro/config` (configuración de ajustes). Ambas 100% locales vía `@react-native-async-storage/async-storage`, sin llamadas de red (RNF-01, RNF-03).
- `cargarEstado()`: `AsyncStorage.getItem('@pomodoro/state')`; si `null` → instalación nueva, devolver `null` (el hook usa `CONFIG_FABRICA`/`initialState`, RF-07); si `raw` no null → `JSON.parse(raw)` dentro de try/catch; si falla → lanzar `Error('Error al leer el estado guardado: <motivo>')` (RF-04).
- `guardarEstado(state)`: `AsyncStorage.setItem('@pomodoro/state', JSON.stringify(state))` con try/catch que rechaza con el motivo (ya existente).
- `guardarConfiguracion(config)` / `cargarConfiguracion()`: misma clave `@pomodoro/config`, mismo patrón try/catch que rechaza con motivo (RF-06 para escritura fallida de ajustes).
- El hook guarda de forma atómica antes de suspender (Constitución §4) mediante `persist` en cada cambio de estado.

## 4. Algoritmo (pseudocódigo)

// --- cargarEstado (RF-04, RF-07) ---
cargarEstado():
  raw = AsyncStorage.getItem('@pomodoro/state')
  si raw === null:
    retornar null          // instalación nueva → valores de fábrica (RF-07)
  intentar:
    retornar JSON.parse(raw) as TimerState
  capturar error:
    lanzar Error("Error al leer el estado guardado: " + error.mensaje)   // RF-04

// --- carga al montar del hook (RF-04, RF-05) ---
useEffect al montar:
  errorCarga = null
  intentar:
    configGuardado = cargarConfiguracion()
    configuracion = configGuardado ?? CONFIG_FABRICA
    estadoGuardado = cargarEstado()
    si estadoGuardado === null:
      estado = initialState(duraciones(configuracion))
    si no:
      estado = estadoGuardado
      si estado.status === 'corriendo':
        estado = recalculateOnResume(estado, ahoraEnSegundos())
    setConfiguracion(configuracion)
    setState(estado)
    setTiempoMostrar(estado.tiempoRestante)
  capturar error:
    errorCarga = error.mensaje    // RF-04: error visible, la app no inicia el temporizador
    // RF-05: al relanzar (nuevo montaje) este useEffect vuelve a ejecutarse y reintenta

// --- reintentarCarga (RF-05) ---
reintentarCarga():
  errorCarga = null
  repetir la lógica de carga al montar (ver arriba)

// --- persist / guardar (RF-06, RF-09) ---
persist(siguiente):
  setState(siguiente)
  intentar:
    await guardarEstado(siguiente)
    errorPersistencia = null
  capturar error:
    errorPersistencia = error.mensaje   // error visible (RF-06, RF-09)
    // al reabrir se carga el último estado válido guardado previamente

// --- guardarAjustes (RF-06) ---
guardarAjustes(campos):
  resultado = validarConfiguracion(campos)
  si !resultado.valido: lanzar error con errores por campo (no guarda)
  configuracionNueva = { ...configuracionActual, ...campos }
  intentar:
    await guardarConfiguracion(configuracionNueva)
    setConfiguracion(configuracionNueva)
  capturar error:
    lanzar error   // error visible, sin cambios en configuracion ni pantalla (RF-06)

## 5. Interfaz (cómo se pinta)

- Pantalla principal `src/app/(tabs)/index.tsx`:
  - Si `errorCarga` no es null: renderizar `ErrorCargaBanner` con el motivo y botón "Reintentar"; NO renderizar el temporizador ni los controles mientras haya error de carga (la app no inicia, RF-04).
  - Al tocar "Reintentar": llamar a `reintentarCarga()` para volver a leer el almacenamiento (RF-05).
  - Si no hay error de carga: renderizar el temporizador normalmente (RF-01, RF-02, RF-03, RF-07, RF-08, RF-10).
- `ErrorCargaBanner` (`src/components/timer/ErrorCargaBanner.tsx`): mensaje "Error al leer el almacenamiento: <motivo>", botón "Reintentar", botón "Cerrar" (oculta el banner; al relanzar la app se reintenta la lectura sola por RF-05). Es un banner de error de sistema, no comercial (no infringe RF-03 ni RNF-02).
- No hay indicador de modo offline ni de sin conexión en ninguna pantalla (RF-10, RNF-01).
- No hay anuncios, pop-ups comerciales ni banners en ninguna pantalla (RF-03, RNF-02).
- Pantalla 100% offline, sin depender de conexión a internet para ninguna función (RNF-01).

## 6. Decisiones técnicas (con alternativa descartada)

1. **Lanzar error desde `cargarEstado` cuando los datos están corruptos, en lugar de devolver `null`.**
   - Justificación: hay que distinguir "instalación nueva, no hay datos" (`null` → valores de fábrica, RF-07) de "datos corruptos, no se puede leer" (error → RF-04). Si devolvemos `null` en ambos casos, no podríamos mostrar el error de RF-04 ni bloquear el inicio.
   - Alternativa descartada: devolver `null` y usar valores de fábrica silenciosamente. Descartada porque ocultaría el fallo de lectura y violaría RF-04 (error visible, app no inicia).

2. **Estado `errorCarga` separado de `errorPersistencia` en el hook.**
   - Justificación: `errorPersistencia` cubre fallos de escritura (guardar). `errorCarga` cubre fallos de lectura al iniciar. Son momentos y causas distintas; separarlos permite mostrar el mensaje adecuado y bloquear solo el inicio cuando falla la lectura.
   - Alternativa descartada: reusar `errorPersistencia` para ambos. Descartada porque mezclaría errores de lectura y escritura, dificultando que el usuario sepa si puede reintentar la carga o si es un fallo de guardado.

3. **Bloquear el render del temporizador mientras hay `errorCarga`, en lugar de mostrar valores de fábrica con un banner no bloqueante.**
   - Justificación: RF-04 dice "la aplicación no puede iniciar" si no puede leer el almacenamiento. Mostrar valores de fábrica silenciosamente ocultaría el fallo y arriesgaría sobrescribir datos corruptos al persistir.
   - Alternativa descartada: inicializar con fábrica y mostrar un banner no bloqueante. Descartada porque violaría "la aplicación no puede iniciar".

4. **Reintento automático al relanzar (nuevo montaje) sin botón obligatorio; el botón "Reintentar" es comodidad adicional.**
   - Justificación: RF-05 requiere reintento automático al relanzar. El `useEffect` al montar ya lo hace. El botón "Reintentar" permite intentar sin cerrar la app.
   - Alternativa descartada: solo botón de reintentar, sin automático. Descartada porque no cumpliría RF-05 (debe ser automático al relanzar).

## 7. Estrategia de pruebas con Jest

- `src/__tests__/storage.test.ts` (modificar): `cargarEstado` con JSON corrupto rechaza con motivo (RF-04); `cargarEstado` devuelve `null` si no hay previo (instalación nueva → fábrica, RF-07); `guardarConfiguracion` rechaza con motivo si `setItem` falla (RF-06). Reutilizar el mock de AsyncStorage ya existente; añadir `__store` con JSON inválido y `mockRejectedValue`.
- `src/__tests__/useTimer.test.ts` (modificar): al montar con `cargarEstado` rechazando, el hook expone `errorCarga` y no llama a `start`/`persist` (RF-04); al nuevo montaje (simulado) se reintenta la lectura automáticamente (RF-05); `guardarAjustes` falla si `guardarConfiguracion` rechaza y no cambia `configuracion` ni pantalla (RF-06); `persist` falla si `guardarEstado` rechaza, expone `errorPersistencia` y al recargar se usa el último estado válido (RF-09). Usar `jest.mock` de AsyncStorage y spy del módulo `storage`.
- `src/__tests__/timerLogic.test.ts`: sin cambios; ya cubre recálculo y persistencia de sesión (RF-02).
- Ejecutar `npx jest` (todas las suites verdes), `npx tsc --noEmit` (sin errores) y `npx expo lint` (sin errores nuevos).
- Las tareas de interfaz (T7) se verifican manualmente en Expo Go con la lista de verificación de `rn-conventions` (banner se muestra al fallar la carga, reintentar vuelve a intentar, cerrar oculta el banner).

## 8. Trazabilidad RF

| RF | Dónde se implementa/verifica |
|---|---|
| RF-01 | `src/app/(tabs)/index.tsx` abre directo al temporizador, sin login/registro/configuración previa (ya existente; verificado por inspección) |
| RF-02 | AsyncStorage local, sin llamadas de red; `storage.test.ts` persiste tras cierre simulado (ya existente) |
| RF-03 | No hay anuncios/banners comerciales en ninguna pantalla (verificado por inspección; `ErrorCargaBanner` es de error de sistema, no comercial) |
| RF-04 | `storage.ts` `cargarEstado` lanza error con motivo; `useTimer` `errorCarga` bloquea el inicio; `ErrorCargaBanner` muestra el error y no renderiza el temporizador |
| RF-05 | `useTimer` `useEffect` al montar reintenta `cargarEstado`/`cargarConfiguracion` automáticamente; `ErrorCargaBanner` botón "Reintentar" |
| RF-06 | `useTimer` `guardarAjustes` captura rechazo de `guardarConfiguracion`, no cambia `configuracion` ni pantalla (`Alert` en `index.tsx`); `persist` captura fallo de `guardarEstado` |
| RF-07 | `cargarEstado`/`cargarConfiguracion` devuelven `null` si no hay previo → `initialState`/`CONFIG_FABRICA` (ya existente) |
| RF-08 | `guardarAjustes` persiste inmediatamente al tocar Guardar; no hay estado de "cambios pendientes"; al reabrir se ve lo último guardado (ya existente) |
| RF-09 | `useTimer` `persist` captura fallo de `guardarEstado`, expone `errorPersistencia`; al reabrir se carga el último estado válido guardado |
| RF-10 | No hay indicador de modo offline en ninguna pantalla (verificado por inspección) |

RNF-01: AsyncStorage local, sin red. RNF-02: sin anuncios. RNF-03: persistencia local antes de suspender (`guardarEstado`/`persist` en cada cambio de estado, Constitución §4).
