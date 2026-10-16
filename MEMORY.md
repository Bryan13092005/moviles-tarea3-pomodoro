## Estado actual

- La spec de HU-001 (specs/001-iniciar-controlar-sesion/spec.md) está aprobada, sin dudas abiertas.
- Se implementaron y verificaron **T1–T10** de specs/001-iniciar-controlar-sesion/tasks.md:
  - T1: `src/constants/pomodoro.ts` (constantes/tipos de dominio).
  - T2+T3: `src/domain/timer.ts` (lógica pura) + `src/__tests__/timerLogic.test.ts` (28 pruebas, verde; incluye prueba de que `tick` no mueve `startedAt`).
  - T4+T9: `src/services/storage.ts` (persistencia AsyncStorage) + `src/__tests__/storage.test.ts` (3 pruebas, verde).
  - T5: `src/services/alarm.ts` (puerto IAlarmService + expo-notifications) y `src/services/permissions.ts` (explicación contextual); `expo-notifications` instalado.
  - T6: `src/hooks/useTimer.ts` (hook orquestador: iniciar/pausar/reanudar/reiniciar, recálculo por timestamp al reenfocar, tick periódico sin desvío, alarma al completar fase). **Se corrigió bug de doble descuento de tiempo:** `tick` ya no mueve `startedAt`; el interval usa `estadoInicioRef` con timestamps.
  - T7 (código implementado, verificado estático; pendiente confirmación UI en device): `src/app/(tabs)/index.tsx` (pantalla del temporizador), `src/components/timer/TimerDisplay.tsx`, `src/components/timer/TimerControls.tsx`.
  - T8 (código implementado, verificado estático; pendiente confirmación UI en device): `src/components/timer/ConfirmResetDialog.tsx`, `src/components/timer/AlarmDialog.tsx`, `src/components/timer/PermissionBanner.tsx`, integrados en `src/app/(tabs)/index.tsx`.
  - T10: verificación final (`lint`, `tsc`, `jest` → **31 passed**, todo limpio).
- **Refactor `app/(tabs)` completado:** rutas y layout movidos a `src/app/(tabs)/` (`_layout.tsx`, `index.tsx`, `explore.tsx`); eliminados los archivos sueltos de `src/app/`; `src/components/app-tabs.web.tsx` ajustado a `href="/(tabs)/index"` y `href="/(tabs)/explore"`.
- Verificación tras refactor: `npx tsc --noEmit` → limpio; `npx expo lint` → limpio; `npx jest` → **31 passed**.
- **Nota:** `expo-notifications` no funciona en Expo Go (requiere development build). T7/T8 se pueden revisar parcialmente en Expo Go (pantalla, controles, diálogos, banner), pero la alarma real necesita device con development build.
- **T-11 (corrección de visualización):** en `src/hooks/useTimer.ts`, `manejarFaseCompletada` ahora fija `tiempoMostrar` con la duración completa de la siguiente fase preparada (`setTiempoMostrar(estadoTransicion.tiempoRestante)`), de modo que al terminar una fase la pantalla muestra la siguiente fase detenida en cuanto termina. `npx jest` → **31 passed**. El typecheck/lint de este entorno no se pudo ejecutar (node_modules/.bin ausente y `@types/react` sin resolver); el cambio sigue el mismo patrón tipado ya usado en el propio archivo.

## Próximos pasos

1. Tú pruebas T7 y T8 en Expo Go según las listas manuales de convenciones (pantalla, controles, diálogos, banner) y me confirmas.
2. Para probar la alarma (RF-10, RF-11), se requiere un development build (`npx expo run:android|ios` o `eas build --profile development`).
3. Tú pruebas T-11 en Expo Go: al terminar una fase debe mostrarse inmediatamente la siguiente fase detenida con su duración completa (RF-10, RF-12). Confírmame para cerrar la tarea.
