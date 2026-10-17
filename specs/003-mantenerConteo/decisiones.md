# Decisiones de HU-003

## Decisión 1

**Pregunta:** Al reabrir la app después de que una fase se completó mientras estaba cerrada (Escenario 3 de HU-003), ¿la aplicación avanza sola a la siguiente fase o se queda mostrando "fase terminada" esperando a que el usuario inicie manualmente?

**Respuesta:** La aplicación se queda con la notificación de fase terminada, esperando a que el usuario dé en aceptar y luego inicie.

**Motivo:** El usuario debe conservar el control sobre cuándo comienza cada fase, incluso tras una interrupción del dispositivo; nada avanza automáticamente sin su acción explícita.

---

## Decisión 2

**Pregunta:** Si se deniega el permiso de notificaciones, ¿qué se ve y qué se puede hacer? ¿Se bloquea el inicio del temporizador hasta conceder el permiso?

**Respuesta:** Se bloquea el inicio del temporizador hasta que el usuario conceda todos los permisos, manteniendo abiertas las alertas; además, se debe explicar explícitamente por qué se solicitan esos permisos antes de invocar la solicitud nativa del sistema operativo.

**Motivo:** Iniciar sin la alarma requerida produciría una experiencia engañosa, porque el usuario podría no enterarse del fin de la fase. La transparencia en permisos es un innegociable (constitution 1.3).

---

## Decisión 3

**Pregunta:** Si pasan días sin abrir la app y el temporizador seguía corriendo (o ya terminó) mientras estaba cerrada, ¿qué se muestra al reabrir?

**Respuesta:** No se reinicia automáticamente la sesión. Se añade un botón en la parte inferior de la aplicación que diga "Reinicio Completo de Pomodoro", que se muestra siempre, y al ser presionado vuelve todo al estado inicial del pomodoro. El usuario decide cuándo reiniciar.

**Motivo:** Evita que la app asuma estados desactualizados o expire por sí sola; el usuario tiene el control explícito de reiniciar todo cuando lo necesite, sin que la app tome decisiones autónomas sobre el tiempo transcurrido.

---

## Decisión 4

**Pregunta:** ¿Qué datos exactos se persisten al cerrar o bloquear la app para recuperar la sesión al reabrir?

**Respuesta:** Se debe guardar todo el estado actual: el tiempo restante, si está corriendo o en pausa, la configuración personalizada de tiempos, el ciclo actual de pomodoros, etc.

**Motivo:** La recuperación debe ser completa y fiel al estado previo, sin pérdida de tiempo ni configuración, garantizando la resiliencia en segundo plano (HU-003, constitution 1.2).

---

## Decisión 5

**Pregunta:** Si el almacenamiento local falla al intentar guardar el estado al cerrar o bloquear la app (por ejemplo, falta de espacio), ¿qué se muestra?

**Respuesta:** Se debe mostrar una notificación de error al guardar los datos con la información del motivo (posiblemente falta de espacio), nada más.

**Motivo:** El usuario debe ser informado del fallo sin interrupciones adicionales ni bloqueos de la app.

---

## Decisión 6

**Pregunta:** Si el dispositivo se reinicia o se apaga por completo mientras el temporizador estaba corriendo, ¿qué se recupera al volver a encender y abrir la app?

**Respuesta:** Empieza de cero, porque se da por entendido que algo ajeno sucedió y no se puede dejar el tiempo corriendo.

**Motivo:** Un reinicio del dispositivo interrumpe por completo la ejecución; no es seguro asumir que el temporizador sigue válido tras un apagón.

---

## Decisión 7

**Pregunta:** Cuando una fase termina mientras la app está abierta y en primer plano, ¿avanza automáticamente a la siguiente fase o se queda mostrando "fase terminada"?

**Respuesta:** Se queda mostrando el aviso, no inicia la siguiente hasta que el usuario cierre la notificación y dé en iniciar.

**Motivo:** El usuario debe conservar el control sobre el comienzo de cada fase, incluso en primer plano; nada avanza sin su acción explícita.
