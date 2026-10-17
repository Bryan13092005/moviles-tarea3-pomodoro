# Spec 003 — Mantener el conteo

Estado: aprobado
HU de origen: docs/Historias/HU_003.md

## Contexto y objetivo

Garantizar que el estudiante no pierda el tiempo de estudio cuando bloquee el celular o cierre la aplicación. El sistema debe usar marcas de tiempo del sistema para recalcular el tiempo restante al reabrir la app, no depender únicamente de un ciclo activo en memoria. Toda la sesión debe persistirse localmente para poder recuperarse tras cierre, bloqueo o reinicio del dispositivo, sin depender de conexión a internet ni registro.

## Usuarios

- Estudiante que desea que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que lleva estudiando.

## Historias de usuario

Como estudiante, quiero que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que llevo estudiando.

## Definiciones

- **Marca de tiempo (timestamp):** instante del sistema (fecha y hora) capturado al pausar, bloquear o cerrar la app para recalcular el tiempo transcurrido real al reabrir.
- **Sesión activa:** una fase de estudio o descanso que está corriendo (descuenta tiempo) o pausada (no descuenta tiempo), con su duración configurada y el ciclo de pomodoros asociado.
- **Fase terminada:** una fase cuyo tiempo llegó a cero mientras la app estaba cerrada o bloqueada, esperando a que el usuario acepte y luego inicie manualmente.

## Requisitos funcionales

- **RF-01:** CUANDO el temporizador está corriendo y el usuario bloquea el celular o cierra la aplicación, EL SISTEMA guarda la marca de tiempo del sistema y el tiempo restante en ese momento para poder recalcular al reabrir. Origen: Escenario 1 y Escenario 2; Constitución, sección 1.2; Decisión 4.

- **RF-02:** CUANDO el usuario desbloquea el celular o vuelve a abrir la aplicación después de haberla cerrado con el temporizador corriendo, EL SISTEMA recalcula el tiempo restante descontando el tiempo real transcurrido entre el bloqueo/cierre y la reapertura, utilizando las marcas de tiempo del sistema, y muestra el resultado correcto en formato MM:SS. Origen: Escenario 1 y Escenario 2; Constitución, sección 1.2; Decisión 4.

- **RF-03:** CUANDO el usuario cierra la aplicación o bloquea el celular con el temporizador en pausa y luego la vuelve a abrir, EL SISTEMA conserva exactamente el mismo tiempo restante sin descontarlo, mantiene el estado pausado y no emite ningún aviso de fin de fase. Origen: Escenario 4; Constitución, sección 1.2; Decisión 4.

- **RF-04:** CUANDO el tiempo de una fase se cumple mientras la aplicación está cerrada o el dispositivo está bloqueado, EL SISTEMA emite la notificación de fin de fase (sonido y vibración, incluso con el dispositivo silenciado, en No molestar o bloqueado) y, al volver a abrir la aplicación, muestra la fase como terminada con el tiempo en cero, esperando a que el usuario dé en aceptar y luego inicie manualmente. Origen: Escenario 3; Decisión 1; Constitución, sección 1.3.

- **RF-05:** CUANDO el almacenamiento local falla al intentar guardar el estado al cerrar o bloquear la aplicación (por ejemplo, falta de espacio), EL SISTEMA muestra una notificación de error con el motivo del fallo y nada más, sin bloquear la aplicación. Origen: Decisión 5.

- **RF-06:** CUANDO el dispositivo se reinicia o se apaga por completo mientras el temporizador estaba corriendo, EL SISTEMA, al volver a encender y abrir la aplicación, empieza de cero el temporizador. Origen: Decisión 6.

- **RF-07:** EL SISTEMA persiste todo el estado actual del temporizador (tiempo restante, si está corriendo o en pausa, configuración personalizada de tiempos, ciclo actual de pomodoros y demás estado de sesión) de forma local antes de suspender la aplicación o cerrarla. Origen: Decisión 4; Constitución, sección 1.2; Constitución, sección 4 (punto 2).

- **RF-08:** MIENTRAS pasan días sin que el usuario abra la aplicación con una fase en curso o terminada, EL SISTEMA no reinicia automáticamente la sesión ni avanza de fase por sí solo; al reabrir, muestra el estado según el tiempo transcurrido y ofrece el botón de reinicio completo de pomodoro para que el usuario decida cuándo reiniciar todo. Origen: Decisión 3.

- **RF-09:** EL SISTEMA muestra siempre un botón "Reinicio Completo de Pomodoro" que, al ser presionado, devuelve todo el estado al estado inicial del pomodoro. Origen: Decisión 3.

- **RF-10:** SI el permiso de notificaciones está denegado, ENTONCES EL SISTEMA bloquea el inicio del temporizador hasta que el usuario conceda el permiso y explica explícitamente por qué se solicitan los permisos antes de invocar la solicitud nativa del sistema operativo. Origen: Decisión 2; Constitución, sección 1.3.

## Requisitos no funcionales

- **RNF-01:** EL SISTEMA funciona sin conexión a internet y guarda todo el estado del temporizador de forma local y persistente. Origen: Constitución, sección 1.1; Decisión 4.
- **RNF-02:** EL SISTEMA recalcula el tiempo restante basado en marcas de tiempo del sistema, no exclusivamente en un ciclo activo en memoria (setInterval). Origen: Constitución, sección 1.2; Escenario 1 y Escenario 2.
- **RNF-03:** EL SISTEMA explica contextualmente la utilidad del permiso de notificaciones antes de solicitarlo al sistema operativo. Origen: Constitución, sección 1.3; Decisión 2.

## Casos límite

- El tiempo transcurrido mientras el dispositivo está bloqueado o la app cerrada se desuenta exactamente en segundos al reabrir.
- Si el temporizador está en pausa al cerrar o bloquear, al reabrir se conserva el mismo tiempo restante y el estado pausado, sin aviso.
- Si una fase expira mientras la app está cerrada, al reabrir se muestra la fase terminada con 00:00 y se emite la notificación de fin de fase.
- Si el dispositivo se reinicia con el temporizador corriendo, al volver a abrir el temporizador empieza de cero.
- Si falla el almacenamiento al guardar el estado, se muestra notificación de error con el motivo y la app no se bloquea.
- El botón de reinicio completo de pomodoro está siempre disponible y devuelve el estado inicial al presionarlo.
- Si pasan días sin abrir la app, la sesión no se reinicia sola; el usuario decide cuándo reiniciar.

## Fuera de alcance

- Registro, inicio de sesión, anuncios publicitarios o cualquier dependencia de red (Constitución, sección 1.1).
- Cambiar o validar los valores de configuración del temporizador (corresponde a HU-005).
- El inicio automático de cualquier fase: tras terminar una fase, la siguiente queda siempre detenida y lista para iniciar manualmente (Constitución, sección 2.2; Decisión 1 y Decisión 7).

## Criterios de finalización

- Los cuatro escenarios de HU-003 están cubiertos por al menos un RF cada uno.
- Al bloquear o cerrar con el temporizador corriendo y reabrir, se muestra el tiempo restante correcto descontando el tiempo real transcurrido.
- Al cerrar o bloquear con el temporizador pausado y reabrir, se conserva el mismo tiempo restante y estado pausado sin aviso.
- Si una fase expira mientras la app está cerrada, se emite la notificación de fin de fase y al reabrir se muestra la fase terminada esperando acción del usuario.
- El botón de reinicio completo de pomodoro está siempre disponible y devuelve el estado inicial al presionarlo.
- Si el dispositivo se reinicia con el temporizador corriendo, al volver a abrir empieza de cero.
- Si falla el almacenamiento al guardar el estado, se muestra notificación de error con el motivo.
- El recálculo del tiempo se basa en marcas de tiempo del sistema, no en un ciclo activo en memoria.

## Dudas abiertas

- No hay dudas abiertas.

## Revisión final de la spec

- **Contradicciones entre RF:** no se identifican. RF-02 recalcula tiempo cuando el temporizador estaba corriendo; RF-03 conserva el tiempo sin descontar cuando estaba en pausa; ambas condiciones son mutuamente excluyentes. RF-04 maneja la expiración con app cerrada y se coordina con Decisión 1 (esperar acción del usuario). RF-06 (reinicio de cero tras apagado) no contradice RF-02/RF-03 porque aplica solo a reinicio total del dispositivo.
- **Escenarios de la HU sin RF:** no se identifican. Escenario 1 (bloquear celular): RF-01, RF-02. Escenario 2 (cerrar aplicación): RF-01, RF-02. Escenario 3 (tiempo termina con app cerrada): RF-04. Escenario 4 (pausar antes de cerrar): RF-03.
- **Conflictos con `docs/constitution.md`:** no se identifican. La persistencia local, el funcionamiento offline, el uso de timestamps (sección 1.2), la alarma garantizada incluso en silencio/No molestar/bloqueado (sección 1.3), la explicación contextual de permisos (sección 1.3), y la no interrupción automática de fases están reflejados en la spec.
