# Plan — Spec 005 — AjusteTiempo

Estado: plan
HU de origen: docs/historias/HU_005.md
Spec: specs/005-ajusteTiempo/spec.md (aprobado)

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---|---|---|---|
| `src/domain/config.ts` | Crear | Tipos `Configuracion`, `CONFIG_FABRICA` (valores de fábrica), `RANGOS` por campo, y funciones puras `validarCampo`, `validarConfiguracion`, `puedeCambiarCicloPomodoros`. Sin depender de React ni del estado del temporizador. | RF-01, RF-05, RF-06, RF-07, RF-11 |
| `src/domain/timer.ts` | Modificar | Añadir parámetro `cicloPomodoros: number` a `start()` y `completePhase()` (donde se leía `POMODORO_CONFIG.cicloPomodoros` como global), para que las funciones sean deterministas con cualquier valor de ciclo. | RF-02, RF-10, RF-11 |
| `src/services/storage.ts` | Modificar | Añadir `guardarConfiguracion(config)` y `cargarConfiguracion()` con clave separada `@pomodoro/config` (distinta de `@pomodoro/state` del temporizador). | RF-03 |
| `src/hooks/useTimer.ts` | Modificar | Añadir estado de configuración (cargada al montar), acciones `guardarAjustes(campos)` y `restablecerAjustes(confirmar)`. `guardarAjustes` valida, persiste y aplica a la siguiente iteración sin tocar la fase en curso. `restablecerAjustes(true)` devuelve a fábrica, detiene el temporizador y resetea el contador de pomodoros; `false` preserva todo. Rechaza cambio de pomodoros si el contador actual supera el nuevo máximo. | RF-01, RF-02, RF-03, RF-04, RF-08, RF-09, RF-10, RF-11 |
| `src/app/(tabs)/ajuste-tiempo.tsx` | Crear | Pantalla de ajustes con 4 campos de entrada (estudio, descanso corto, descanso largo, pomodoros), validación en tiempo real mientras se escribe, muestra del rango permitido, botón "Guardar" con mensaje de confirmación verde, botón "Restablecer" con diálogo de sí/no. Campos editables mientras el temporizador está activo. | RF-01, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10 |
| `src/__tests__/config.test.ts` | Crear | Pruebas unitarias de validación pura: campo vacío, cero, fuera de rango, dentro de rango; configuración completa válida/inválida; `puedeCambiarCicloPomodoros` con contador actual menor/mayor que el nuevo máximo. | RF-01, RF-05, RF-06, RF-07, RF-11 |
| `src/__tests__/timerLogic.test.ts` | Modificar | Actualizar llamadas a `start()` y `completePhase()` con el nuevo parámetro `cicloPomodoros`. Añadir pruebas de `start` con ciclo personalizado (no excede el límite al iniciar descanso) y `completePhase` con ciclo personalizado (decide descanso largo según el nuevo máximo). | RF-02, RF-10, RF-11 |
| `src/__tests__/storage.test.ts` | Modificar | Añadir pruebas de `guardarConfiguracion`/`cargarConfiguracion`: guarda, carga, sobrescribe, persiste tras cierre simulado. | RF-03 |
| `src/__tests__/useTimer.test.ts` | Modificar | Añadir pruebas de `guardarAjustes` (no altera fase actual, aplica a siguiente iteración), `restablecerAjustes(true)` (detiene timer, resetea pomodoros a 0), `restablecerAjustes(false)` (preserva estado), rechazo de pomodoros cuando contador actual > nuevo máximo. | RF-01, RF-02, RF-08, RF-09, RF-10, RF-11 |

## 2. Funciones puras de lógica

**Nuevo archivo `src/domain/config.ts`:**

```ts
export type CampoAjuste = 'estudio' | 'descansoCorto' | 'descansoLargo' | 'cicloPomodoros'

export interface Configuracion {
  estudio: number           // segundos
  descansoCorto: number     // segundos
  descansoLargo: number     // segundos
  cicloPomodoros: number    // cantidad
}

export const CONFIG_FABRICA: Configuracion = {
  estudio: 25 * 60,
  descansoCorto: 5 * 60,
  descansoLargo: 15 * 60,
  cicloPomodoros: 4,
}

export const RANGOS: Record<CampoAjuste, { min: number; max: number; unidad: 'min' | 'unidades' }> = {
  estudio: { min: 1, max: 60, unidad: 'min' },
  descansoCorto: { min: 1, max: 15, unidad: 'min' },
  descansoLargo: { min: 1, max: 30, unidad: 'min' },
  cicloPomodoros: { min: 3, max: 8, unidad: 'unidades' },
}

export function validarCampo(campo: CampoAjuste, valor: string | number): { valido: boolean; rango?: { min: number; max: number }; mensaje?: string }
export function validarConfiguracion(config: Partial<Configuracion>): { valido: boolean; errores: Record<CampoAjuste, string> }
export function puedeCambiarCicloPomodoros(pomodorosCompletados: number, nuevoMaximo: number): boolean
```

- `validarCampo`: devuelve `{ valido: false, mensaje }` si el valor está vacío, es cero o está fuera de `RANGOS[campo]`. Devuelve `{ valido: true, rango }` si es válido (RF-05, RF-06, RF-07).
- `validarConfiguracion`: valida todos los campos presentes; acumula errores por campo (RF-01, RF-06).
- `puedeCambiarCicloPomodoros`: devuelve `false` si `pomodorosCompletados > nuevoMaximo` (RF-11).

**Modificaciones en `src/domain/timer.ts`:**
- `start(state, now, duraciones, cicloPomodoros)`: usar el parámetro `cicloPomodoros` en lugar de `POMODORO_CONFIG.cicloPomodoros` (línea 95).
- `completePhase(state, duraciones, cicloPomodoros)`: usar el parámetro `cicloPomodoros` en lugar de `POMODORO_CONFIG.cicloPomodoros` (línea 201).
- Exportar/re-exportar `Configuracion` desde `config.ts` si se necesita en el dominio.

## 3. Persistencia

- Clave `@pomodoro/config` separada de `@pomodoro/state` (el estado del temporizador). Razón: la configuración es ajuste del usuario, independiente del ciclo de vida del temporizador (Constitución §4: guardar antes de suspender, pero acoplando responsabilidades distintas).
- `guardarConfiguracion(config): Promise<void>` — `AsyncStorage.setItem('@pomodoro/config', JSON.stringify(config))` con try/catch que rechaza con el motivo (patrón igual que `guardarEstado`).
- `cargarConfiguracion(): Promise<Configuracion | null>` — `AsyncStorage.getItem('@pomodoro/config')`, devuelve `null` si no hay previo (instalación nueva → usar `CONFIG_FABRICA`).
- El hook carga la configuración al montar y la fusiona con `CONFIG_FABRICA` si falta algún campo.

## 4. Algoritmo (pseudocódigo)

```
CONFIG_FABRICA = { estudio: 1500, descansoCorto: 300, descansoLargo: 900, cicloPomodoros: 4 }
RANGOS = {
  estudio: { min: 1, max: 60 },
  descansoCorto: { min: 1, max: 15 },
  descansoLargo: { min: 1, max: 30 },
  cicloPomodoros: { min: 3, max: 8 },
}

// --- validarCampo (RF-05, RF-06, RF-07) ---
validarCampo(campo, valor):
  si valor está vacío o es 0: retornar { valido: false, mensaje: "valor inválido", rango: RANGOS[campo] }
  si valor < RANGOS[campo].min o valor > RANGOS[campo].max:
    retornar { valido: false, mensaje: "fuera de rango", rango: RANGOS[campo] }
  retornar { valido: true, rango: RANGOS[campo] }

// --- validarConfiguracion (RF-01, RF-06) ---
validarConfiguracion(config):
  errores = {}
  para cada campo en config:
    resultado = validarCampo(campo, config[campo])
    si !resultado.valido: errores[campo] = resultado.mensaje
  retornar { valido: errores está vacío, errores }

// --- puedeCambiarCicloPomodoros (RF-11) ---
puedeCambiarCicloPomodoros(pomodorosCompletados, nuevoMaximo):
  retornar pomodorosCompletados <= nuevoMaximo

// --- start (RF-02, RF-10) — modificado: recibe cicloPomodoros ---
start(state, now, duraciones, cicloPomodoros):
  si estado === 'corriendo': retornar estado
  tiempoRestante = (tiempoRestante <= 0) ? duracionFase : tiempoRestante
  nuevosPomodoros = pomodoros
  si fase es descansoCorto o descansoLargo:
    nuevosPomodoros = min(pomodoros + 1, cicloPomodoros)   // antes usaba POMODORO_CONFIG.cicloPomodoros
  si fase es estudio y faseAnterior === descansoLargo:
    nuevosPomodoros = 0
  retornar { ...state, status: 'corriendo', startedAt: now, tiempoRestante, pomodoros: nuevosPomodoros }

// --- completePhase (RF-02, RF-10) — modificado: recibe cicloPomodoros ---
completePhase(state, duraciones, cicloPomodoros):
  si fase === estudio:
    si pomodoros + 1 >= cicloPomodoros: siguienteFase = descansoLargo   // antes usaba POMODORO_CONFIG.cicloPomodoros
    sino: siguienteFase = descansoCorto
  sino: siguienteFase = estudio
  retornar { ...state, fase: siguienteFase, faseAnterior: fase, status: 'detenido', startedAt: null,
    tiempoRestante: duraciones[siguienteFase], duracionFase: duraciones[siguienteFase] }

// --- guardarAjustes (hook, RF-01, RF-02, RF-10) ---
guardarAjustes(campos):
  resultado = validarConfiguracion(campos)
  si !resultado.valido: lanzar error con errores por campo (no guarda)
  configuracionNueva = { ...configuracionActual, ...campos }
  guardarConfiguracion(configuracionNueva)   // persiste (RF-03)
  setConfiguracion(configuracionNueva)       // aplica a siguiente iteración; NO toca state.tiempoRestante ni duracionFase de la fase actual (RF-02, RF-10)
  retornar configuracionNueva

// --- restablecerAjustes (hook, RF-08, RF-09) ---
restablecerAjustes(confirmar):
  si !confirmar: retornar  // preserva valores y estado exactamente (RF-09)
  configuracionFabrica = CONFIG_FABRICA
  guardarConfiguracion(configuracionFabrica)
  setConfiguracion(configuracionFabrica)
  siguiente = reinicioCompleto()   // fase estudio, 25:00, detenido, 0 pomodoros (RF-08)
  setState(siguiente)
  persist(siguiente)
```

## 5. Interfaz (cómo se pinta)

- Pantalla `src/app/(tabs)/ajuste-tiempo.tsx` con 4 campos de entrada numérica, cada uno con su etiqueta y el rango permitido mostrado (p. ej. "Estudio (1–60 min)").
- Validación en tiempo real al escribir en cada campo: si el valor es inválido, se muestra el mensaje de rango permitido junto al campo y el botón "Guardar" queda deshabilitado (RF-05, RF-06, RNF-03).
- Botón "Guardar": al tocar, si todos los campos son válidos, guarda y muestra un mensaje de confirmación verde con los tiempos que se usarán (estudio, descanso corto, descanso largo, total de pomodoros) (RF-01, RF-04).
- Botón "Restablecer": al tocar, se abre un diálogo de sí/no. Si se confirma, se vuelven a los valores de fábrica (25/5/15 min, 4 pomodoros), se detiene el temporizador actual y se reinicia el contador de pomodoros. Si se cancela, se preservan exactamente los valores y estado actuales (RF-08, RF-09).
- Los campos permanecen editables mientras el temporizador está corriendo o pausado; los cambios aplican a la siguiente iteración de cada fase, no a la actual (RF-10).
- Pantalla 100% offline, sin anuncios ni banners comerciales (RNF-01, RNF-02).

**Nota de navegación:** esta spec crea la ruta de Expo Router pero no define un botón de acceso desde la pantalla principal. Ese cableado puede hacerse por separado; no es un RF de esta spec.

## 6. Decisiones técnicas (con alternativa descartada)

1. **Clave de almacenamiento separada `@pomodoro/config` en lugar de añadir campos a `TimerState` / `@pomodoro/state`.**
   - Justificación: `TimerState` representa el estado de ejecución del temporizador (fase, tiempo restante, startedAt, pomodoros del ciclo). La configuración del usuario (duraciones preferidas, ciclo de pomodoros) es un ajuste independiente. Separarlas evita mezclar responsabilidades y simplifica la persistencia atómica de cada una.
   - Alternativa descartada: añadir `duraciones` y `cicloPomodoros` a `TimerState` y guardarlos junto en `@pomodoro/state`. Descartada porque acopla la configuración al ciclo de vida del temporizador y obliga a reescribir `recalculateOnResume`, `completePhase` y los efectos de almacenamiento del hook.

2. **Pasar `cicloPomodoros` como parámetro a `start()` y `completePhase()` en lugar de leerlo de `POMODORO_CONFIG` global.**
   - Justificación: hace las funciones puras deterministas y testables con cualquier valor de ciclo, necesario para RF-11 (cambiar pomodoros por ciclo) y para que los ajustes del usuario surtan efecto.
   - Alternativa descartada: mantener `POMODORO_CONFIG.cicloPomodoros` como lectura global dentro del dominio. Descartada porque no permitiría probar con distintos valores de ciclo ni aplicar el cambio configurado por el usuario.

3. **Validación pura en `src/domain/config.ts` sin depender de React ni del estado del temporizador.**
   - Justificación: la validación es determinista y no necesita renderizar; puede probarse aisladamente con Jest, cumpliendo RNF-03 (respuesta inmediata) y permitiendo pruebas unitarias rápidas.
   - Alternativa descartada: validar dentro del hook con `useState` para errores. Descartada porque mezcla lógica de validación con lógica de presentación y dificulta las pruebas unitarias del dominio.

4. **Pantalla de ajustes como ruta de Expo Router (`src/app/(tabs)/ajuste-tiempo.tsx`) en lugar de modal sobre la pantalla principal.**
   - Justificación: Expo Router maneja la navegación de forma declarativa y la pantalla tiene su propio ciclo de vida; es más sencillo de probar y mantener, y no interfiere con el temporizador en segundo plano.
   - Alternativa descartada: modal en `src/app/(tabs)/index.tsx`. Descartada porque complica el estado compartido con el temporizador y la navegación cuando la app pasa a segundo plano.

## 7. Estrategia de pruebas con Jest

- `src/__tests__/config.test.ts` (nuevo): `validarCampo` con vacío, cero, por debajo del mínimo, por encima del máximo y dentro de rango para cada campo; `validarConfiguracion` con todos válidos y con algunos inválidos (errores por campo); `puedeCambiarCicloPomodoros` con contador actual menor o igual al nuevo máximo (aplica) y mayor (rechaza). Cubre RF-01, RF-05, RF-06, RF-07, RF-11.
- `src/__tests__/timerLogic.test.ts` (modificar): actualizar llamadas a `start()` y `completePhase()` pasando `cicloPomodoros`. Añadir pruebas de `start` con ciclo personalizado (iniciar descanso no excede el nuevo límite) y `completePhase` con ciclo personalizado (decide descanso largo según el nuevo máximo de pomodoros). Cubre RF-02, RF-10, RF-11.
- `src/__tests__/storage.test.ts` (modificar): añadir pruebas de `guardarConfiguracion`/`cargarConfiguracion` (guarda, carga, sobrescribe, persiste tras cierre simulado). Cubre RF-03.
- `src/__tests__/useTimer.test.ts` (modificar): añadir pruebas de `guardarAjustes` (no altera la fase actual; los nuevos duraciones aplican a la siguiente iteración), `restablecerAjustes(true)` (detiene el temporizador y resetea pomodoros a 0), `restablecerAjustes(false)` (preserva estado), y rechazo de cambio de pomodoros cuando el contador actual supera el nuevo máximo. Cubre RF-01, RF-02, RF-08, RF-09, RF-10, RF-11.
- Ejecutar `npx jest` (todas las suites verdes), `npx tsc --noEmit` (sin errores) y `npx expo lint` (sin errores nuevos).

## 8. Trazabilidad RF

| RF | Dónde se implementa/verifica |
|---|---|
| RF-01 | `config.ts` `validarConfiguracion` + `useTimer` `guardarAjustes` (no guarda si hay errores) |
| RF-02 | `useTimer` `guardarAjustes` (no modifica `tiempoRestante` ni `duracionFase` de la fase actual); `timer.ts` `start`/`completePhase` reciben `cicloPomodoros` |
| RF-03 | `storage.ts` `guardarConfiguracion`/`cargarConfiguracion`; `useTimer` carga al montar |
| RF-04 | `ajuste-tiempo.tsx` mensaje de confirmación verde tras guardar |
| RF-05 | `config.ts` `validarCampo` en tiempo real mientras el usuario escribe |
| RF-06 | `config.ts` `validarCampo` (vacío/cero/fuera de rango → error con rango) + `ajuste-tiempo.tsx` muestra el rango permitido |
| RF-07 | `config.ts` `RANGOS` (estudio 1–60, descanso corto 1–15, descanso largo 1–30, pomodoros 3–8) |
| RF-08 | `useTimer` `restablecerAjustes(true)` (valores fábrica, detiene timer, resetea pomodoros) |
| RF-09 | `useTimer` `restablecerAjustes(false)` (preserva valores y estado exactamente) |
| RF-10 | `useTimer` (campos editables durante fase activa; cambios aplican a siguiente iteración) |
| RF-11 | `config.ts` `puedeCambiarCicloPomodoros` + `useTimer` `guardarAjustes` (rechaza si contador actual > nuevo máximo) |

RNF-01 (offline): AsyncStorage local, sin red. RNF-02 (sin anuncios): pantalla de ajustes sin banners ni pop-ups. RNF-03 (validación inmediata): `validarCampo` es pura y síncrona, se ejecuta al escribir.