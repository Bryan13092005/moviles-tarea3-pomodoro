# MEMORY.md

## Estado actual

Todas las specs hasta 005 cerradas/implementadas (ver historial previo): 100 pruebas verdes, `npx tsc --noEmit` sin errores, `npx expo lint` solo con 2 errores preexistentes (use-color-scheme.web.ts y useTimer.test.ts, no tocados).

Tarea de estilos (sin cambios de lógica): COMPLETADA — interfaz reestructurada con la paleta institucional de la skill estilos-colores:
- src/constants/theme.ts: paleta #0E1326 (navy profundo), #161D3A (navy institucional), #D4A017 (dorado académico), #E5B83B (dorado brillante), #FFFFFF, #5a6e82, #b5bbc8 con roles semánticos (background, surface, header, primary, active, border, text, textSecondary).
- Pantalla principal: barra superior #0E1326, tarjeta blanca #FFFFFF, tiempo con acento dorado, indicador de fase (punto de color + texto), botones primarios #D4A017 y secundarios blanco con borde #b5bbc8, FABs, modal y diálogos reestructurados.
- Componentes actualizados: TimerDisplay, TimerControls, ReinicioCompletoPomodoro, AlarmDialog, ConfirmResetDialog, ErrorPersistenciaBanner, PermissionBanner, app-tabs (native/web), collapsible, explore, animated-icon (splash), app.json splash #0E1326.
- Dominio, hooks, servicios, pruebas y configuración de tiempos sin modificaciones.

## Próximos pasos

Implementar Spec 006 (Offline), empezando por T1 de specs/006-offline/tasks.md.
