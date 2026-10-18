# Tareas — Spec 005 — AjusteTiempo

Máximo 20-30 min por tarea, ordenadas por dependencia. Las de lógica se verifican con `npx jest`. La de interfaz se verifica manualmente en Expo Go (lista de verificación rn-conventions).

- [x] **T1. Dominio: crear `src/domain/config.ts` con tipos, rangos y validación pura (RF-01, RF-05, RF-06, RF-07, RF-11).** Crear `Configuracion`, `CONFIG_FABRICA`, `RANGOS` y las funciones puras `validarCampo`, `validarConfiguracion`, `puedeCambiarCicloPomodoros`. Sin depender de React ni del estado del temporizador.
  - Hecho cuando: `npx jest` pasa para las pruebas de `config.test.ts` y `npx tsc --noEmit` no tiene errores. ✅

- [x] **T2. Pruebas: validación pura de configuración (RF-01, RF-05, RF-06, RF-07, RF-11).** Crear `src/__tests__/config.test.ts` con pruebas de `validarCampo` (vacío, cero, por debajo del mínimo, por encima del máximo, dentro de rango) para cada campo, `validarConfiguracion` (todos válidos y algunos inválidos con errores por campo) y `puedeCambiarCicloPomodoros` (contador actual menor/igual al nuevo máximo aplica; mayor rechaza).
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`. ✅ (33 pruebas verdes)

- [x] **T3. Dominio: adaptar `start()` y `completePhase()` para recibir `cicloPomodoros` como parámetro (RF-02, RF-10, RF-11).** Modificar `src/domain/timer.ts` para que `start(state, now, duraciones, cicloPomodoros)` y `completePhase(state, duraciones, cicloPomodoros)` usen el parámetro en lugar de `POMODORO_CONFIG.cicloPomodoros` global. Actualizar llamadas en `src/hooks/useTimer.ts` y pruebas existentes en `timerLogic.test.ts`.
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan (incluidas las pruebas existentes actualizadas). ✅

- [x] **T4. Persistencia: añadir `guardarConfiguracion` / `cargarConfiguracion` en `src/services/storage.ts` (RF-03).** Clave separada `@pomodoro/config` (distinta de `@pomodoro/state`). try/catch que rechaza con el motivo, igual que `guardarEstado`.
  - Hecho cuando: `npx jest` pasa para las pruebas de almacenamiento (existentes + nuevas de config). ✅

- [x] **T5. Pruebas: persistencia de configuración (RF-03).** Añadir pruebas en `src/__tests__/storage.test.ts` de `guardarConfiguracion`/`cargarConfiguracion`: guarda, carga, sobrescribe y persiste tras cierre simulado.
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`. ✅ (5 pruebas nuevas verdes)

- [x] **T6. Hook: añadir estado de configuración y acciones `guardarAjustes` / `restablecerAjustes` en `src/hooks/useTimer.ts` (RF-01, RF-02, RF-03, RF-04, RF-08, RF-09, RF-10, RF-11).** Cargar configuración al montar. `guardarAjustes(campos)` valida, persiste y aplica a la siguiente iteración sin tocar la fase en curso. `restablecerAjustes(true)` devuelve a fábrica, detiene el temporizador y resetea pomodoros a 0; `false` preserva todo. Rechaza cambio de pomodoros si el contador actual supera el nuevo máximo.
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan. ✅ (100 pruebas verdes en useTimer.test.ts)

- [x] **T7. Pruebas: acciones de ajustes del hook (RF-01, RF-02, RF-08, RF-09, RF-10, RF-11).** Añadir pruebas en `src/__tests__/useTimer.test.ts`: `guardarAjustes` no altera la fase actual (aplica a siguiente iteración), `restablecerAjustes(true)` detiene el temporizador y resetea pomodoros a 0, `restablecerAjustes(false)` preserva estado, rechazo de pomodoros cuando contador actual > nuevo máximo.
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`. ✅ (5 pruebas nuevas verdes)

- [x] **T8. UI: crear pantalla de ajustes `src/app/(tabs)/ajuste-tiempo.tsx` (RF-01, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10).** 4 campos de entrada con validación en tiempo real, rango permitido mostrado, botón "Guardar" con mensaje de confirmación verde, botón "Restablecer" con diálogo de sí/no, campos editables mientras el temporizador está activo.
  - Hecho cuando: la pantalla compila (tsc sin errores), renderiza sin errores y se verifica manualmente en Expo Go con la lista de verificación de rn-conventions (campos editables, guardado muestra confirmación, restablecer muestra diálogo, cancelar preserva valores). ✅ (confirmada por el usuario en Expo Go)
  - Implementada con botones flotantes ⚙️ (ajustes) y 🔄 (fábrica) en la esquina inferior derecha de `src/app/(tabs)/index.tsx`, usando un Modal para el formulario de ajustes y un Alert nativo para la confirmación de guardado (RF-04).

- [x] **T9. Verificación final: todos los RF, Jest, TypeScript y lint (RF-01…RF-11, RNF-01…RNF-03).** Revisar la matriz de trazabilidad del plan; ejecutar `npx jest`, `npx tsc --noEmit` y `npx expo lint`.
  - Hecho cuando: todas las suites de prueba verdes, `tsc` sin errores, `lint` sin errores nuevos; cada RF tiene al menos una prueba o implementación. ✅

Total: 9 tareas completadas.
