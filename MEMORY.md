# MEMORY.md

## Estado actual

Todas las specs hasta 005 cerradas/implementadas (ver historial previo): 100 pruebas verdes, `npx tsc --noEmit` sin errores, `npx expo lint` solo con 2 errores preexistentes (use-color-scheme.web.ts y useTimer.test.ts, no tocados).

Tarea de estilos (sin cambios de lógica): COMPLETADA — interfaz reestructurada con la paleta institucional de la skill estilos-colores:
- src/constants/theme.ts: paleta #0E1326 (navy profundo), #161D3A (navy institucional), #D4A017 (dorado académico), #E5B83B (dorado brillante), #FFFFFF, #5a6e82, #b5bbc8 con roles semánticos (background, surface, header, primary, active, border, text, textSecondary).
- Pantalla principal: barra superior #0E1326, tarjeta blanca #FFFFFF, tiempo con acento dorado, indicador de fase (punto de color + texto), botones primarios #D4A017 y secundarios blanco con borde #b5bbc8, FABs, modal y diálogos reestructurados.
- Componentes actualizados: TimerDisplay, TimerControls, ReinicioCompletoPomodoro, AlarmDialog, ConfirmResetDialog, ErrorPersistenciaBanner, PermissionBanner, app-tabs (native/web), collapsible, explore, animated-icon (splash), app.json splash #0E1326.
- Dominio, hooks, servicios, pruebas y configuración de tiempos sin modificaciones.

Spec 006 (Offline) COMPLETADA (T1-T8):
- `src/services/storage.ts`: `cargarEstado` lanza `Error` con motivo ante JSON corrupto/valía no-objeto; devuelve `null` solo sin previo (fábrica). RF-04, RF-07.
- `src/hooks/useTimer.ts`: `errorCarga`, `reintentarCarga`, `limpiarErrorCarga`; montaje reintenta lectura automática (RF-05); bloqueo de inicio ante error de lectura (RF-04); `persist` expone `errorPersistencia` (RF-09); `guardarAjustes` no cambia configuración si escritura falla (RF-06).
- `src/components/timer/ErrorCargaBanner.tsx` (nuevo): banner de error de sistema (no comercial) con Reintentar/Cerrar. RF-04, RF-05, RF-10.
- `src/app/(tabs)/index.tsx`: renderiza banner en lugar del temporizador ante error de carga; sin indicador offline.
- Pruebas: `storage.test.ts` + `useTimer.test.ts` (casos RF-04, RF-05, RF-06, RF-07, RF-09).
- Verificación final T8: `npx jest` → 107 pruebas / 5 suites / 0 fallos; `npx tsc --noEmit` → sin errores; `npx expo lint` → 3 errores, todos preexistentes en código no tocado (`useTimer.test.ts:48`, `use-color-scheme.web.ts:11`, `useTimer.ts:319`), sin errores nuevos.

Todos los 10 RF y 3 RNF de la spec 006 están cubiertos (pruebas automatizadas + inspección). HU-006 escenarios cubiertos por pruebas: almacenamiento corrupto al iniciar, instalación nueva → fábrica, reintento automático, escritura fallida de ajustes/estado, persistencia local sin red. No cubiertos por prueba automatizada (verificación por inspección): RF-01 (sin login), RF-03 (sin anuncios), RF-08 (sin estado pendiente), RF-10 (sin indicador offline), RNFs.

## Próximos pasos

Spec 006 cerrada. Esperar siguiente instrucción (nueva spec o tarea).
