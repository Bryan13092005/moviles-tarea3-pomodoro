# Decisiones de HU-004

## Decisión 1

**Pregunta:** ¿Qué ve y qué hace el usuario si deniega o retira el permiso de notificaciones? ¿Puede seguir usando la aplicación?

**Respuesta:** Si el usuario deniega o quita cualquier permiso no puede usar la aplicación. Se pide explícitamente el permiso explicando para qué se va a utilizar, y si es denegado la aplicación se cierra.

**Motivo:** Sin el permiso de notificaciones no se puede garantizar el aviso al terminar el tiempo, que es el núcleo de HU-004. Permitir usar la app sin el permiso produciría una experiencia engañosa, porque el usuario podría no enterarse del fin de la fase. La transparencia y la garantía de notificación son innegociables (constitution 1.3).

---

## Decisión 2

**Pregunta:** ¿La alarma suena aunque la aplicación esté cerrada, en segundo plano o en primer plano, y sin importar si el celular está en silencio, no molestar, vibración o con sonido?

**Respuesta:** La alarma, vibración y notificación es obligatoria siempre, así la app esté cerrada, en segundo plano o en primer plano, siempre debe sonar, independientemente de cómo esté usando el dispositivo (en silencio, modo no molestar, modo vibración o con sonido). Siempre suena.

**Motivo:** HU-004 exige que el aviso llegue incluso con el celular en silencio y pantalla bloqueada. Para cumplirlo, la alarma no puede depender de que la app esté abierta ni del modo de sonido del dispositivo; debe dispararse por el sistema sin importar el estado de la app.

---

## Decisión 3

**Pregunta:** ¿Qué pasa si el usuario no hace nada cuando suena la alarma? ¿Se apaga sola, se repite en bucle o queda sonando indefinidamente?

**Respuesta:** Si el usuario no hace nada durante 30 segundos se silencia.

**Motivo:** Evita que el aviso suene/vibre indefinidamente si el usuario no está cerca del celular, limitando la molestia y el consumo de batería, mientras da tiempo suficiente para que el usuario lo escuche y lo detenga.

---

## Decisión 4

**Pregunta:** ¿Cada vez que se inicia la app o un temporizador se vuelve a explicar y pedir el permiso, o solo la primera vez?

**Respuesta:** Únicamente la primera vez o si el usuario retira el permiso de la aplicación. Caso contrario, como ya tiene el permiso, no hay problema y fluye normalmente.

**Motivo:** Evita molestar al usuario con peticiones repetidas de permiso que ya concedió. Solo se vuelve a pedir si el permiso fue retirado explícitamente, respetando la elección del usuario sin interrupciones innecesarias.

---

## Decisión 5

**Pregunta:** Cuando el usuario detiene el aviso y entra a la app, ¿qué ve? ¿Va directo a la siguiente fase o hay una pantalla intermedia?

**Respuesta:** Cuando el usuario entra a la app después de detener la alarma, se muestra el alert de que la fase finalizó con el botón de aceptar y luego se renderiza el contenido de la siguiente etapa.

**Motivo:** Da al usuario una confirmación clara de que la fase terminó antes de avanzar, y tras su aceptación explícita renderiza la siguiente etapa, manteniendo el control del usuario sobre el flujo (coherente con HU-001: acciones directas y control explícito del usuario).

---

## Decisión 6

**Pregunta:** ¿Qué ocurre si la aplicación está cerrada cuando finaliza una fase: pueden acumularse varias alarmas pendientes de diferentes fases y suenan todas?

**Respuesta:** No. Una fase solo puede finalizar si el usuario la inició presionando iniciar, y al terminar el aviso se queda esperando a que el usuario abra la aplicación y presione aceptar. Si la app está cerrada, pasaron los 30 segundos de alarma y el usuario no la abrió, únicamente se queda para mostrar el mensaje de fase terminado y que el usuario presione aceptar, sin iniciar automáticamente ninguna siguiente fase.

**Motivo:** Cada fase requiere la aprobación explícita del usuario para empezar, por lo que no puede haber varias fases finales pendientes acumuladas; el control del flujo permanece en el usuario tras la aceptación explícita del fin de fase.
