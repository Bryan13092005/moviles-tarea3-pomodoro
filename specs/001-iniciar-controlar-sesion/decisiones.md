# Decisiones de HU-001

## Decisión 1

**Pregunta:** ¿Qué debe ocurrir cuando termina la cuenta regresiva de estudio?

**Respuesta:** Debe sonar una alarma con vibración aunque el teléfono esté en modo No molestar, silenciado o bloqueado, y debe continuar cargando la siguiente fase, para que el usuario pueda presionar el botón de iniciarla.

**Motivo:** El usuario necesita una señal inequívoca de que terminó la fase y que el flujo Pomodoro avance sin perder la transición.

## Decisión 2

**Pregunta:** Si se cierra la aplicación o se bloquea el teléfono mientras el temporizador está corriendo y se vuelve después de que la fase terminó, ¿la siguiente fase debe quedar ya iniciada?

**Respuesta:** No. La siguiente etapa no debe iniciarse hasta que el usuario pulse el botón de iniciar o continuar.

**Motivo:** El usuario debe conservar el control sobre el comienzo de cada fase, incluso después de una interrupción del dispositivo.

## Decisión 3

**Pregunta:** ¿Qué estado debe conservarse al cerrar y reabrir la aplicación?

**Respuesta:** Se debe conservar localmente la fase actual, si estaba corriendo o pausada, y el tiempo restante exacto. Si estaba corriendo, el tiempo restante debe recalcularse con el tiempo real transcurrido.

**Motivo:** El temporizador debe ser confiable frente al cierre de la aplicación y no debe perder tiempo ni estado.

## Decisión 4

**Pregunta:** ¿Qué debe ocurrir si el sistema deniega o no permite el permiso necesario para la alarma o vibración?

**Respuesta:** Se debe impedir iniciar el temporizador hasta que el permiso esté habilitado.

**Motivo:** Iniciar sin la alarma requerida produciría una experiencia engañosa, porque el usuario podría no enterarse del fin de la fase.

## Decisión 5

**Pregunta:** Cuando la fase actual está en cero o ya se preparó la siguiente fase detenida, ¿qué debe hacer un reinicio confirmado?

**Respuesta:** Debe reiniciar la fase que se está mostrando, devolverla a su duración inicial y dejarla pausada, sin cambiar de fase.

**Motivo:** El reinicio debe ser predecible y actuar sobre el estado visible, sin iniciar acciones adicionales ni alterar la fase seleccionada.

## Decisión 6

**Pregunta:** ¿Cuál debe ser el estado de la pantalla en una instalación nueva?

**Respuesta:** Debe mostrar la fase Estudio en 25:00, con el temporizador detenido y listo para que el usuario pulse iniciar.

**Motivo:** Permite comenzar sin configuración previa y evita que el temporizador se active sin una acción explícita.

## Decisión 7

**Pregunta:** Cuando termina una fase y la siguiente queda esperando a que el usuario pulse iniciar, ¿qué tiempo debe mostrarse?

**Respuesta:** Debe mostrar inmediatamente la duración completa configurada de la nueva fase, por ejemplo 5:00, con el temporizador detenido y el botón de inicio disponible.

**Motivo:** El usuario debe identificar claramente la fase preparada y saber cuánto durará antes de iniciarla.

## Decisión 8

**Pregunta:** ¿Qué debe ocurrir si el permiso de alarma o vibración deja de estar habilitado mientras el temporizador está corriendo?

**Respuesta:** El temporizador debe pausarse en cualquier fase en la que se encuentre y el sistema debe volver a solicitar el permiso. El usuario no puede continuar utilizando el temporizador hasta aceptar el permiso.

**Motivo:** El temporizador no debe continuar si ya no puede garantizar la alarma y vibración requeridas.

## Decisión 9

**Pregunta:** ¿Cómo puede el estudiante detener o descartar la alarma cuando termina una fase?

**Respuesta:** El estudiante puede detener o descartar la alarma tocando el botón de aceptar de la alarma o el botón de iniciar de la siguiente fase.

**Motivo:** La alarma debe permanecer activa hasta que el estudiante confirme que ha recibido el aviso o comience la fase siguiente.
