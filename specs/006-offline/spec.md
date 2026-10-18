# Spec 006 — Offline

Estado: borrador
HU de origen: HU-006 — docs/constitution.md (sección 1.1)

## Contexto y objetivo

El estudiante quiere usar la aplicación inmediatamente tras instalarla, sin crear cuenta, sin iniciar sesión y sin configurar nada, y quiere que funcione totalmente sin conexión a internet. Esta spec define el comportamiento de acceso sin fricción, el funcionamiento 100% offline y local, y la ausencia de anuncios, así como el comportamiento ante fallos de lectura y escritura del almacenamiento local.

## Usuarios

- Estudiante (usuario final de la app, sin registro ni cuenta).

## Historias de usuario

- HU-006 — Usar la aplicación sin registro, sin internet y sin publicidad (docs/constitution.md sección 1.1; specs/006-offline/decisiones.md).

## Definiciones

- **Valores de fábrica**: tiempo de estudio 25 minutos, descanso corto 5 minutos, descanso largo 15 minutos, 4 pomodoros por ciclo (constitución sección 2.3).
- **Almacenamiento local**: almacenamiento persistente del dispositivo, exclusivo de la aplicación, sin servidor ni red externa (constitución sección 1.1).
- **Sesión en curso**: fase del temporizador activa (corriendo o pausada) con su fase, tiempo restante, estado correr/pausado y contador de pomodoros del ciclo actual.

## Requisitos funcionales

**RF-01:** CUANDO el usuario abre la aplicación por primera vez tras instalarla, EL SISTEMA muestra directamente la pantalla del temporizador sin requerir registro, creación de cuenta, inicio de sesión ni configuración inicial previa. Origen: HU-006 Escenario Cero Fricción Inicial, Constitución 1.1.

**RF-02:** EL SISTEMA funciona sin conexión a internet (Wi-Fi ni datos móviles) y persiste todo el estado y la configuración exclusivamente de forma local en el dispositivo. Origen: HU-006 Escenario Funcionamiento Offline, Constitución 1.1.

**RF-03:** EL SISTEMA no muestra anuncios publicitarios, pop-ups comerciales ni banners en ninguna pantalla de la aplicación. Origen: HU-006 Escenario Sin Interrupciones, Constitución 1.1.

**RF-04:** CUANDO el almacenamiento local no puede leerse al iniciar (datos corruptos, espacio insuficiente o denegado por el sistema), EL SISTEMA muestra un error y la aplicación no puede iniciar. Origen: Decisión 1.

**RF-05:** CUANDO la aplicación falló al abrirse por error de almacenamiento y el usuario la relanza, EL SISTEMA intenta leer el almacenamiento automáticamente sin intervención manual del usuario. Origen: Decisión 3.

**RF-06:** CUANDO el usuario guarda ajustes pero el almacenamiento local no puede escribirse, EL SISTEMA muestra un error y no se cambian los datos ni lo que se ve en pantalla. Origen: Decisión 2.

**RF-07:** CUANDO el usuario desinstala y reinstala la aplicación, EL SISTEMA muestra valores de fábrica porque el almacenamiento local se borró con la desinstalación. Origen: Decisión 4.

**RF-08:** CUANDO el usuario modifica ajustes sin guardar y cierra la aplicación, al reabrir EL SISTEMA muestra lo último que se haya guardado correctamente (o valores de fábrica si no hay nada guardado), sin ningún estado de cambios pendientes. Origen: Decisión 6.

**RF-09:** CUANDO al cerrar o pasar a segundo plano no se puede escribir el estado del temporizador (fase, tiempo restante, correr/pausado, contador de pomodoros), EL SISTEMA muestra un error, se pierde la información de la sesión en curso y al reabrir se muestra lo último que se haya guardado correctamente. Origen: Decisión 7.

**RF-10:** EL SISTEMA no muestra al usuario ningún indicador de modo offline ni de sin conexión. Origen: Decisión 5.

## Requisitos no funcionales

**RNF-01:** EL SISTEMA funciona 100% offline sin depender de conexión a internet para ninguna función. Origen: Constitución 1.1, Decisión 5.

**RNF-02:** EL SISTEMA no incluye anuncios, pop-ups comerciales ni banners en ninguna pantalla de la aplicación. Origen: Constitución 1.1.

**RNF-03:** Todo el estado y la configuración persisten exclusivamente en el almacenamiento local del dispositivo antes de suspender o cerrar la aplicación. Origen: Constitución 1.1, Decisión 8.

## Casos límite

- Primera apertura tras instalar: va directo a la pantalla del temporizador, sin pantalla de bienvenida, registro ni login (RF-01).
- Almacenamiento corrupto o denegado al iniciar: error visible y app no inicia; al relanzar se reintenta la lectura sola (RF-04, RF-05).
- Fallo al escribir ajustes: error visible y sin cambios en pantalla ni en datos (RF-06).
- Fallo al escribir estado del temporizador al suspender: error visible, se pierde la sesión en curso y se recupera el último estado válido guardado (RF-09).
- Desinstalación y reinstalación: todo de fábrica (RF-07).
- Ajustes editados sin guardar al cerrar: al reabrir se ve lo último guardado o fábrica, sin cambios pendientes (RF-08).
- No hay indicador de offline en pantalla (RF-10).

## Fuera de alcance

- Registro, inicio de sesión o cuentas de usuario (Constitución 1.1).
- Persistencia en servidor o red externa (la app es 100% offline, Constitución 1.1).
- Anuncios, pop-ups comerciales ni banners (Constitución 1.1).
- Indicador de estado offline/sin conexión (Decisión 5).
- Lógica del temporizador, transiciones de fase, notificaciones de alarma y ajuste de tiempos (pertenecen a HU-001, HU-002, HU-004 y HU-005).
- Stack, arquitectura, formatos de almacenamiento ni nombres de archivos.

## Criterios de finalización

- Cada RF es verificable y termina con su "Origen:" (escenario de HU o decisión de decisiones.md).
- Cada uno de los escenarios de HU-006 (Cero Fricción Inicial, Funcionamiento Offline, Sin Interrupciones) está cubierto por al menos un RF, además de las decisiones 1 al 7 de decisiones.md.
- Ningún RF contradice docs/constitution.md.
- No hay decisiones inventadas: todo lo no resuelto en decisiones.md se marca [NECESITA ACLARACIÓN].

## Dudas abiertas

No hay dudas abiertas; las 8 decisiones de specs/006-offline/decisiones.md están resueltas (la decisión 8 indica que la implementación existente ya cumple y no necesita corrección).

---

### Revisión final de la spec

1. **RF-01** cubre Cero Fricción Inicial (abre directo en temporizador, sin registro/login/configuración) de Constitución 1.1.
2. **RF-02** cubre Funcionamiento Offline y persistencia local exclusiva de Constitución 1.1.
3. **RF-03** cubre Sin Interrupciones (sin anuncios, pop-ups ni banners) de Constitución 1.1.
4. **RF-04 y RF-05** cubren Decisión 1 (almacenamiento no legible → error, no inicia) y Decisión 3 (reintento automático al relanzar).
5. **RF-06** cubre Decisión 2 (escritura fallida → error visible, sin cambios).
6. **RF-07** cubre Decisión 4 (desinstalación/reinstalación → valores de fábrica).
7. **RF-08** cubre Decisión 6 (ajustes sin guardar al cerrar → se ve lo último guardado o fábrica).
8. **RF-09** cubre Decisión 7 (fallo de escritura del estado al suspender → error, pérdida de sesión en curso, recuperación del último válido).
9. **RF-10** cubre Decisión 5 (sin indicador de modo offline).
10. No hay conflictos con docs/constitution.md, no hay [NECESITA ACLARACIÓN] pendientes, y no se menciona stack, arquitectura, formatos de almacenamiento ni nombres de archivo. Máximo 10 puntos revisados; sin proponer soluciones.
