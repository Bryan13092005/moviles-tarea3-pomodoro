# Spec 004 — Aviso de Fin de Fase (AvisoTiempo)

Estado: aprobado
HU de origen: docs/historias/HU_004.md

## Contexto y objetivo

El estudiante necesita saber cuándo termina el tiempo de una fase (estudio o descanso) sin tener que mirar la pantalla. La aplicación debe garantizar que el aviso llegue incluso con el celular en silencio, en modo no molestar, pantalla bloqueada o aplicación cerrada, y debe gestionar de forma transparente el permiso de notificaciones.

## Usuarios

- Estudiante: usuario principal que inicia temporizadores y necesita cambiar de actividad al terminar cada fase.

## Historias de usuario

- HU-004 — Recibir aviso al terminar el tiempo (docs/historias/HU_004.md). 4 escenarios de aceptación:
  1. Aviso con el celular en sonido: notificación con sonido y vibración que indica qué fase terminó.
  2. Aviso con el celular en silencio: alarma, vibración y aviso en pantalla de bloqueo.
  3. Detener el aviso: tocar notificación o botón detener, se calla y abre la app mostrando la siguiente fase.
  4. Permiso de notificaciones: al iniciar por primera vez sin permiso, la app explica para qué lo necesita y lo solicita.

## Definiciones

- Fase: bloque de tiempo del ciclo Pomodoro (Estudio, Descanso Corto o Descanso Largo).
- Alarma/aviso: combinación de sonido, vibración y notificación que anuncia el fin de una fase.
- Pantalla de bloqueo: estado del dispositivo con la pantalla apagada o bloqueada.

## Requisitos funcionales

- **RF-01:** CUANDO el temporizador llega a cero y el dispositivo tiene el sonido activado, EL SISTEMA muestra una notificación con sonido y vibración que indica qué fase terminó. Origen: Escenario 1 de HU-004.
- **RF-02:** CUANDO el temporizador llega a cero y el dispositivo está en modo silencio o vibración, EL SISTEMA suena como alarma, vibra y muestra el aviso en la pantalla de bloqueo. Origen: Escenario 2 de HU-004.
- **RF-03:** MIENTRAS el temporizador finaliza una fase, EL SISTEMA reproduce la alarma, la vibración y la notificación sin importar si la aplicación está cerrada, en segundo plano o en primer plano, y sin importar el modo de sonido del dispositivo (silencio, no molestar, vibración o sonido). Origen: Decisión 2 de decisiones.md.
- **RF-04:** CUANDO el usuario toca la notificación o el botón de detener mientras la alarma está sonando, EL SISTEMA detiene la alarma y abre la aplicación mostrando la siguiente fase. Origen: Escenario 3 de HU-004.
- **RF-05:** SI el usuario no interactúa con la alarma durante 30 segundos, EL SISTEMA silencia el aviso. Origen: Decisión 3 de decisiones.md.
- **RF-06:** CUANDO el usuario entra a la aplicación después de detener la alarma, EL SISTEMA muestra el aviso de que la fase finalizó con un botón de aceptar y, tras su aceptación, renderiza el contenido de la siguiente etapa. Origen: Decisión 5 de decisiones.md.
- **RF-07:** CUANDO el usuario inicia un temporizador por primera vez y no ha concedido el permiso de notificaciones, EL SISTEMA explica para qué necesita el permiso y lo solicita. Origen: Escenario 4 de HU-004.
- **RF-08:** MIENTRAS el usuario ya ha concedido el permiso de notificaciones y no lo ha retirado, EL SISTEMA no vuelve a solicitar el permiso. Origen: Decisión 4 de decisiones.md.
- **RF-09:** SI el usuario deniega o retira el permiso de notificaciones, EL SISTEMA no permite el uso de la aplicación y la cierra tras explicar para qué se va a utilizar el permiso. Origen: Escenario 4 de HU-004 y Decisión 1 de decisiones.md.
- **RF-10:** CUANDO la aplicación está cerrada y el aviso de fin de fase ha concluido (tras 30 segundos sin interacción del usuario), EL SISTEMA mantiene únicamente el mensaje de fase terminado a la espera de que el usuario abra la aplicación y presione aceptar, sin iniciar automáticamente ninguna siguiente fase. Origen: Decisión 6 de decisiones.md.

## Requisitos no funcionales

- **RNF-01:** El aviso de fin de fase debe funcionar sin conexión a internet (100% local y offline). Origen: Constitución 1.1.
- **RNF-02:** La solicitud del permiso de notificaciones debe incluir una explicación clara y contextual de su utilidad antes de invocar la solicitud nativa del sistema operativo. Origen: Constitución 1.3.
- **RNF-03:** El aviso de fin de fase no debe incluir anuncios, pop-ups comerciales ni banners de ningún tipo. Origen: Constitución 1.1.

## Casos límite

- El usuario retira el permiso de notificaciones desde los ajustes del sistema mientras la aplicación está en uso → la aplicación se cierra (Decisión 1, RF-09).
- La fase finaliza con la aplicación cerrada o en segundo plano → la alarma sigue sonando (Decisión 2, RF-03).
- El usuario no interviene mientras suena la alarma → el aviso se silencia a los 30 segundos (Decisión 3, RF-05).
- El usuario ya concedió el permiso y abre la aplicación nuevamente → no se le vuelve a pedir el permiso (Decisión 4, RF-08).

## Fuera de alcance

- Personalizar o elegir el sonido de la alarma.
- Programar o posponer avisos para fases futuras.
- Sincronizar avisos o estado entre varios dispositivos.
- Enviar notificaciones de marketing o promocionales.

## Criterios de finalización

- Cada uno de los 4 escenarios de HU-004 está cubierto por al menos un RF.
- Cada una de las 5 decisiones de `specs/004-avisoTiempo/decisiones.md` está reflejada en al menos un RF.
- Todo RF termina con su "Origen:" indicando el escenario o la decisión de la que sale.
- Ningún RF describe cómo se implementa (sin stack, arquitectura, formatos de almacenamiento ni nombres de archivo).

## Dudas abiertas

Ninguna.
