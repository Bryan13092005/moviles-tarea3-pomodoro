# Decisiones de diseño — HU-002 (Alternar entre estudio y descanso)

Este documento recoge las decisiones tomadas durante la entrevista sobre lo que HU-002 no define, pero que cambia lo que el usuario ve o hace. Se numeran en el orden en que se preguntaron. Cada una incluye la pregunta, la respuesta del usuario y el motivo de la decisión.

---

## Decisión 1 — Inicio manual de cada fase

**Pregunta:** Cuando termina un bloque de estudio, ¿el descanso (corto o largo) comienza solo con la cuenta regresiva, o queda "listo" para que el usuario toque un botón para iniciarlo? Y cuando termina un descanso y el usuario vuelve a la app, ¿el siguiente bloque de estudio empieza solo o espera a que el usuario lo inicie?

**Respuesta del usuario:** En cualquier fase o bloque siempre debe tocar el botón de iniciar. El reloj debe quedarse detenido con el nuevo valor y etapa para que el usuario apriete iniciar.

**Motivo:** HU-002 dice que la app "deja listo" la siguiente fase, no que la inicie sola. La constitución habla de acciones directas de un solo toque para iniciar/pausar, pero nunca impone un inicio automático. Mantener el reloj detenido da al usuario control explícito sobre cuándo comienza cada fase, evitando que el descanso o el estudio empiecen sin que él esté listo.

---

## Decisión 2 — Conservación del estado al cerrar o bloquear el dispositivo

**Pregunta:** Si se cierra la app o se bloquea el dispositivo cuando una fase está "lista pero detenida" (terminó el bloque anterior, mostró el nuevo valor y etapa, pero el usuario aún no tocó iniciar), al volver ¿se conserva exactamente esa fase, valor de tiempo y contador de pomodoros, o se reinicia algo?

**Respuesta del usuario:** Se conserva tal cual, no se debe iniciar ni cambiar nada.

**Motivo:** La constitución (1.2 y 2.2) exige persistencia del estado y alternancia automática de fases sin pérdida de datos. Al no haber iniciado nada, no hay razón para alterar fase, tiempo ni contador; el usuario reanuda exactamente donde lo dejó.

---

## Decisión 3 — Cambios de duración no afectan la fase en curso

**Pregunta:** Si el usuario está en medio de un bloque de estudio (corriendo o pausado) y cambia la duración de estudio desde Ajustes (por ejemplo, de 25 a 30 minutos), ¿qué valor de tiempo ve en pantalla mientras ese bloque sigue en curso: el valor original con el que empezó o el nuevo valor?

**Respuesta del usuario:** Se muestra el valor actual con el que empezó; únicamente se modifica desde la siguiente o siguientes etapas, tanto para el tiempo de estudio como para el descanso corto o largo.

**Motivo:** La constitución (2.3) establece explícitamente que los cambios de duración aplicados durante una fase en curso no deben alterar el temporizador activo actual, sino aplicarse a partir de la siguiente iteración. Esto evita sorpresas en el bloque que el usuario ya empezó.

---

## Decisión 4 — Alarma de fin de fase garantizada en segundo plano

**Pregunta:** Si termina un bloque y la app está en segundo plano o cerrada (dispositivo bloqueado), ¿suena/vibra la alarma de fin de fase aunque la app no esté abierta, o solo se "deja lista" la siguiente fase y no pasa nada hasta que se abra la app?

**Respuesta del usuario:** Debe sonar, vibrar, aparecer la notificación a pesar de estar cerrada o bloqueado el dispositivo, y si se deja lista la siguiente etapa.

**Motivo:** La constitución (1.3) garantiza la notificación de fin de fase sin importar el estado del dispositivo (modo silencio, no molestar o pantalla bloqueada). El usuario confirma que la alarma es obligatoria incluso con la app cerrada, y que además la siguiente fase queda lista para iniciar manualmente (Decisión 1).

---

## Decisión 5 — El contador de pomodoros solo se incrementa al iniciar la fase

**Pregunta:** Cuando termina un bloque de estudio, suena/vibra la alarma y quedó "listo" el descanso, pero el usuario no abre la app ni toca iniciar. ¿El contador de pomodoros se incrementa ya en ese momento, o solo cuando inicia realmente el descanso o el estudio?

**Respuesta del usuario:** Únicamente cuando se inicia realmente el descanso; mientras tanto se mantiene "lista" la fase.

**Motivo:** HU-002 (escenario 1) dice que al terminar un estudio se prepara el descanso corto incrementando el contador, pero el usuario aclara que el incremento debe materializarse al iniciar la fase, no al terminarla. Esto evita que el contador avance si el usuario nunca inicia el descanso, manteniendo la coherencia visual entre lo que se muestra y lo que realmente se ha completado.

---

## Decisión 6 — Reinicio del contador tras el descanso largo

**Pregunta:** Al terminar el último bloque de estudio, la app deja listo el Descanso Largo y debe reiniciar el contador a cero. ¿El contador se reinicia a cero en el momento en que termina el estudio (aunque el descanso largo quede "listo" y no iniciado), o solo cuando el usuario toca iniciar para empezar el descanso largo (o el estudio siguiente)?

**Respuesta del usuario:** El contador de pomodoros se mantiene en 4/4 (o 4 de 4) hasta que se acaba el descanso largo; para luego, en la nueva primera fase de estudio, volver al estado inicial.

**Motivo:** HU-002 (escenario 2) indica que al completar los pomodoros configurados se activa el Descanso Largo y se reinicia el contador del ciclo actual a cero. El usuario precisa que ese reinicio se refleja al iniciar el siguiente bloque de estudio tras el descanso largo, no antes. Durante el descanso largo el contador permanece en 4/4 como registro del ciclo que acaba de cerrarse.

---

## Decisión 7 — Recuperación al reabrir la app después de que expiró una fase

**Pregunta:** Si el usuario cierra la app o bloquea el dispositivo en medio de un bloque de estudio (corriendo o pausado) y vuelve después de que el tiempo ya debería haber terminado, ¿qué ve: el tiempo restante en cero con la siguiente fase "lista", o el tiempo restante del bloque como si nada hubiera pasado?

**Respuesta del usuario:** Si el tiempo está pausado, se mantiene pausado y al volver debe visualizar el tiempo en que quedó detenido. Si sigue corriendo, es normal: se acaba la fase, se envía la notificación, sonido y vibración, y cuando el usuario presione aceptar la nueva fase, se muestra el nombre de la fase siguiente y el contador nuevo.

**Motivo:** La constitución (1.2) obliga a usar marcas de tiempo del sistema para recalcular el tiempo restante real al reabrir. Si la fase estaba pausada, no ha transcurrido tiempo real del temporizador, por lo que se conserva el tiempo detenido. Si estaba corriendo y ya expiró, la lógica de timestamps determina que la fase terminó; se aplica la alarma garantizada (Decisión 4) y, al aceptar el usuario, se muestra la siguiente fase con su valor y el contador actualizado (Decisiones 1, 4, 5 y 6).
