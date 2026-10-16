# Spec 001 — Iniciar y controlar una sesión

Estado: aprobado
HU de origen: docs/Historias/HU_001.md

## Contexto y objetivo

Permitir que el estudiante inicie, pause, reanude y reinicie una sesión de estudio, conservando el control sobre el temporizador y evitando reinicios accidentales. Al terminar una fase, el sistema debe avisar y dejar preparada la siguiente sin iniciarla por cuenta propia.

## Usuarios

- Estudiante que desea concentrarse durante una sesión de estudio.

## Historias de usuario

Como estudiante, quiero iniciar, pausar y reiniciar un temporizador de estudio para concentrarme durante un tiempo definido.

## Definiciones

- **Detenido:** el temporizador no descuenta tiempo. Incluye la fase inicial y una fase preparada tras completar la anterior.
- **Reiniciar:** devolver la fase que se muestra a su duración configurada; la acción requiere confirmación y deja el temporizador detenido.

## Requisitos funcionales

- **RF-01:** EL SISTEMA muestra, en una instalación nueva, la fase Estudio con 25:00, detenida y lista para iniciar. Origen: Decisión 6.
- **RF-02:** CUANDO el estudiante inicia el temporizador con el permiso requerido habilitado, EL SISTEMA comienza la cuenta regresiva con la duración de estudio configurada y muestra el tiempo restante en formato MM:SS. Origen: Escenario 1; Decisión 6.
- **RF-03:** MIENTRAS el temporizador está corriendo, EL SISTEMA presenta el tiempo restante en formato MM:SS y lo actualiza según el tiempo real transcurrido. Origen: Escenario 1; reglas de precisión del temporizador.
- **RF-04:** CUANDO el estudiante pausa un temporizador en curso y luego lo reanuda, EL SISTEMA continúa la cuenta desde el tiempo restante al momento de la pausa. Origen: Escenario 2.
- **RF-05:** CUANDO el estudiante solicita reiniciar un temporizador corriendo o pausado, EL SISTEMA solicita confirmación antes de cambiar su estado. Origen: Escenario 3; Constitución, sección 2.1.
- **RF-06:** CUANDO el estudiante confirma el reinicio, EL SISTEMA devuelve la fase mostrada a su duración configurada, mantiene esa fase y deja el temporizador detenido. Origen: Escenario 3; Decisión 5.
- **RF-07:** CUANDO el estudiante cancela la confirmación de reinicio, EL SISTEMA conserva exactamente el tiempo restante y el estado previo del temporizador. Origen: Escenario 4; Constitución, sección 2.1.
- **RF-08:** SI el permiso requerido para la alarma y la vibración no está habilitado, ENTONCES EL SISTEMA impide iniciar o continuar el temporizador y solicita que el permiso sea habilitado. Origen: Decisiones 4 y 8.
- **RF-09:** MIENTRAS el temporizador está corriendo y el permiso requerido deja de estar habilitado, EL SISTEMA pausa el temporizador en la fase actual, solicita nuevamente el permiso y no permite continuar hasta que sea aceptado. Origen: Decisión 8.
- **RF-10:** CUANDO termina una fase de Estudio, EL SISTEMA emite la alarma con vibración, incluso si el teléfono está silenciado, en No molestar o bloqueado, y prepara la fase de descanso correspondiente detenida, mostrando su duración configurada completa. EL SISTEMA incrementa el contador de pomodoros y, al alcanzar el límite configurado, prepara el descanso largo y reinicia el contador del ciclo a cero; en caso contrario, prepara el descanso corto. Origen: Decisiones 1, 2 y 7; Constitución, secciones 1.3 y 2.2.
- **RF-11:** CUANDO el estudiante toca el botón de aceptar de la alarma o el botón de iniciar de la siguiente fase, EL SISTEMA detiene o descarta la alarma. Origen: Decisión 9.
- **RF-12:** CUANDO termina una fase de descanso, EL SISTEMA prepara la fase de Estudio detenida y muestra su duración configurada completa. Origen: Constitución, sección 2.2; Decisión 2.
- **RF-13:** CUANDO el estudiante vuelve a la aplicación después de cerrarla o de que el dispositivo haya estado bloqueado, EL SISTEMA conserva la fase y el estado del temporizador; si estaba corriendo, calcula el tiempo restante considerando el tiempo real transcurrido, y si estaba pausado, conserva el tiempo restante sin descontarlo. Origen: Decisión 3; Constitución, sección 1.2.
- **RF-14:** MIENTRAS la pantalla principal presenta el temporizador, EL SISTEMA muestra claramente la fase actual, el tiempo restante en formato MM:SS y el número de pomodoros completados en el ciclo actual. Origen: Constitución, sección 2.2.

## Requisitos no funcionales

- **RNF-01:** EL SISTEMA conserva el estado del temporizador localmente y permite utilizar esta función sin conexión a internet. Origen: Decisión 3; Constitución, sección 1.1.
- **RNF-02:** EL SISTEMA explica contextualmente la utilidad del permiso de notificaciones antes de solicitarlo al sistema operativo. Origen: Constitución, sección 1.3.

## Casos límite

- Si la fase llega a 00:00, el sistema completa la fase y prepara la siguiente detenida; no comienza su cuenta regresiva automáticamente.
- El formato MM:SS representa correctamente los tiempos 00:00, 00:01 y 59:59.
- Si una fase ya está en 00:00 o la siguiente fase ya está preparada, un reinicio confirmado restablece la duración completa de la fase que se muestra y la deja detenida.
- Si falta el permiso necesario para la alarma o vibración, el temporizador no comienza.
- Si la aplicación se vuelve a abrir después de que una fase corriendo haya terminado, el sistema prepara la siguiente fase detenida.

## Fuera de alcance

- Cambiar o validar los valores de configuración del temporizador.
- La definición de intervalos de configuración permitidos.
- Otras funciones de la aplicación que no correspondan al control del temporizador y a preparar la siguiente fase.

## Criterios de finalización

- Los cuatro escenarios de HU-001 están cubiertos por los RF correspondientes.
- Iniciar, pausar, reanudar, confirmar un reinicio y cancelarlo producen los estados y tiempos especificados.
- La fase inicial y las fases preparadas se muestran detenidas con su duración completa.
- La fase de Estudio finalizada produce la alarma y la transición de ciclo especificadas, sin iniciar el descanso automáticamente.
- Al regresar a la aplicación se conserva el estado pausado o se considera el tiempo real transcurrido si el temporizador estaba corriendo.
- El tiempo restante y la fase actual se muestran en el formato y con la información requeridos.

## Dudas abiertas

- No hay dudas abiertas.

## Revisión final de la spec

- **Contradicciones entre RF:** no se identifican. La siguiente fase se prepara detenida, lo cual distingue la transición de fase del inicio de su cuenta regresiva. La alarma se detiene únicamente mediante las acciones explícitamente definidas en RF-11.
- **Escenarios de la HU sin RF:** no se identifican. Escenario 1: RF-02 y RF-03; Escenario 2: RF-04; Escenario 3: RF-05 y RF-06; Escenario 4: RF-07.
- **Conflictos con `docs/constitution.md`:** no se identifican; las reglas de confirmación, transición de fases, visualización y preservación temporal están reflejadas en la spec.
