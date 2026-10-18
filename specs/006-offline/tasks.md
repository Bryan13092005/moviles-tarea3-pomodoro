# Tareas — Spec 006 — Offline

Máximo 20-30 min por tarea, ordenadas por dependencia. Las de lógica se verifican con `npx jest`. La de interfaz se verifica manualmente en Expo Go (lista de verificación rn-conventions).

- [x] **T1. Almacenamiento: `cargarEstado` maneja datos corruptos y lanza error con motivo (RF-04, RF-07).** Modificar `src/services/storage.ts`: envolver `JSON.parse` en try/catch; si los datos están corruptos o no son un TimerState válido, lanzar `Error` con el motivo; devolver `null` solo cuando no hay previo (instalación nueva → valores de fábrica).
  - Hecho cuando: `cargarEstado` rechaza con mensaje de motivo al leer JSON corrupto; devuelve `null` cuando no hay dato; `npx jest` y `npx tsc --noEmit` pasan.

- [x] **T2. Pruebas: carga fallida al iniciar y fábrica al instalar (RF-04, RF-07).** Añadir pruebas en `src/__tests__/storage.test.ts`: `cargarEstado` con JSON corrupto rechaza con motivo; `cargarEstado` devuelve `null` cuando no hay previo (instalación nueva).
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`.

- [x] **T3. Hook: estado `errorCarga`, bloqueo de inicio y reintento automático al montar (RF-04, RF-05).** Modificar `src/hooks/useTimer.ts`: añadir `errorCarga` y `reintentarCarga`; capturar errores de `cargarEstado`/`cargarConfiguracion` al montar; si hay error de lectura, mostrar `errorCarga` y no iniciar el temporizador; cada montaje reintenta la lectura automáticamente.
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan; el hook expone `errorCarga` y `reintentarCarga`.

- [x] **T4. Pruebas: carga fallida y reintento en el hook (RF-04, RF-05).** Añadir pruebas en `src/__tests__/useTimer.test.ts`: al montar con `cargarEstado` rechazando, `errorCarga` se setea y no se inicia el temporizador; al simular nuevo montaje se reintenta la lectura.
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`.

- [x] **T5. Hook: escritura fallida de estado y ajustes — error visible y recuperación del último válido (RF-06, RF-09).** Verificar/ajustar `src/hooks/useTimer.ts`: `persist` captura fallo de `guardarEstado` y expone `errorPersistencia`; `guardarAjustes` captura fallo de `guardarConfiguracion` sin cambiar `configuracion` ni pantalla.
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan; `errorPersistencia` se setea al fallar escritura y no se pierden datos válidos previos.

- [x] **T6. Pruebas: escritura fallida de estado y ajustes (RF-06, RF-09).** Añadir pruebas en `src/__tests__/useTimer.test.ts` y `storage.test.ts`: `guardarEstado` rechaza → `errorPersistencia` se setea y al recargar se usa último estado válido; `guardarConfiguracion` rechaza → `guardarAjustes` lanza y no cambia `configuracion`.
  - Hecho cuando: las pruebas nuevas pasan en `npx jest`.

- [x] **T7. Verificación de RF ya implementados: inspección y pruebas de RF-01, RF-02, RF-03, RF-08, RF-10 y RNF.** Revisar que no hay pantalla de login, no hay llamadas de red, no hay anuncios, no hay indicador offline; asegurar prueba de instalación nueva → fábrica en `storage.test.ts`; actualizar matriz de trazabilidad del plan.
  - Hecho cuando: `npx jest` pasa; matriz de trazabilidad del plan cubre los 10 RF y 3 RNF; `npx tsc --noEmit` y `npx expo lint` sin errores nuevos.

- [x] **T8. Verificación final: todos los RF, Jest, TypeScript y lint (RF-01…RF-10, RNF-01…RNF-03).** Ejecutar `npx jest`, `npx tsc --noEmit`, `npx expo lint`; revisar que cada RF tiene al menos una prueba o implementación.
  - Hecho cuando: todas las suites de prueba verdes, `tsc` sin errores, `lint` sin errores nuevos.

Total: 8 tareas.
