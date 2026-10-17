# Spec 002 — Tiempos de estudio y descanso

Estado: aprobado
HU de origen: docs/Historias/HU_002.md

## Contexto y objetivo

Permitir que el estudiante siga la técnica Pomodoro sin llevar la cuenta manualmente: la aplicación alterna automáticamente entre fases de estudio y descanso, preparando la siguiente fase detenida al terminar cada una, para que el usuario decida cuándo iniciar. Se garantiza la alarma de fin de fase aunque la app esté cerrada o el dispositivo bloqueado, y se conserva el estado al reabrir la app.

## Usuarios

- Estudiante que desea alternar tiempos de estudio y descanso siguiendo la técnica Pomodoro.

## Historias de usuario

Como estudiante, quiero que la aplicación pase sola del tiempo de estudio al de descanso, para seguir la técnica Pomodoro sin tener que llevar la cuenta yo mismo.

## Definiciones

- **Fase:** Estudio, Descanso Corto o Descanso Largo.
- **Detenido / lista:** el temporizador no descuenta tiempo; incluye una fase preparada tras completar la anterior. El usuario debe tocar iniciar para que comience la cuenta regresiva.
- **Límite de pomodoros:** cantidad de pomodoros configurada (por defecto 4) que activa el Descanso Largo al completarse.

## Requisitos funcionales

- **RF-01:** CUANDO termina una fase de Estudio y el contador de pomodoros del ciclo actual no ha alcanzado el límite configurado, EL SISTEMA emite la alarma de fin de fase (sonido y vibración, incluso con el dispositivo silenciado, en No molestar o bloqueado, y con la app en segundo plano o cerrada), prepara la fase Descanso Corto detenida con su duración configurada completa y la deja lista para que el usuario la inicie manualmente, sin incrementar el contador de pomodoros hasta que el usuario inicie el descanso. Origen: Escenario 1; Decisión 1; Decisión 4; Decisión 5.

- **RF-02:** CUANDO termina la última fase de Estudio que completa la cantidad de pomodoros configurada (por defecto cuatro), EL SISTEMA emite la alarma de fin de fase (sonido y vibración, incluso con el dispositivo silenciado, en No molestar o bloqueado, y con la app en segundo plano o cerrada), prepara la fase Descanso Largo detenida con su duración configurada completa y la deja lista para que el usuario la inicie manualmente, manteniendo el contador de pomodoros en el valor del ciclo cerrado (4/4) hasta que se acabe el descanso largo. Origen: Escenario 2; Decisión 1; Decisión 4; Decisión 6.

- **RF-03:** CUANDO termina una fase de Descanso (corto o largo), EL SISTEMA emite la alarma de fin de fase, prepara la fase Estudio detenida con su duración configurada completa y la deja lista para que el usuario la inicie manualmente. Origen: Escenario 3; Decisión 1; Constitución, sección 1.3.

- **RF-04:** CUANDO el usuario inicia realmente una fase de Descanso, EL SISTEMA incrementa el contador de pomodoros del ciclo actual en uno. Origen: Decisión 5.

- **RF-05:** CUANDO el usuario inicia realmente la primera fase de Estudio tras un Descanso Largo, EL SISTEMA reinicia el contador de pomodoros del ciclo actual a cero. Origen: Decisión 6.

- **RF-06:** MIENTRAS la pantalla principal presenta el temporizador, EL SISTEMA muestra claramente la fase actual (Estudio, Descanso Corto o Descanso Largo), el tiempo restante en formato MM:SS y el número de pomodoros completados en el ciclo actual. Origen: Escenario 4; Constitución, sección 2.2.

- **RF-07:** CUANDO el usuario cambia la duración de estudio, descanso corto o descanso largo desde Ajustes mientras una fase está en curso (corriendo o pausada), EL SISTEMA conserva el valor de tiempo con el que empezó esa fase y aplica el nuevo valor únicamente a partir de la siguiente fase de ese tipo. Origen: Decisión 3; Constitución, sección 2.3.

- **RF-08:** CUANDO el usuario cierra la aplicación o bloquea el dispositivo con una fase lista pero detenida, o con una fase pausada, EL SISTEMA conserva exactamente la fase, el valor de tiempo y el contador de pomodoros al reabrir la aplicación, sin iniciar ni cambiar nada. Origen: Decisión 2; Constitución, sección 1.2.

- **RF-09:** CUANDO el usuario vuelve a la aplicación después de que una fase corriendo haya expirado mientras estaba cerrada o bloqueada, EL SISTEMA muestra la fase con tiempo en cero, emite la alarma de fin de fase garantizada, y cuando el usuario presiona aceptar, muestra el nombre de la siguiente fase y el contador actualizado. Origen: Decisión 7; Decisión 4.

## Requisitos no funcionales

- **RNF-01:** EL SISTEMA conserva el estado del temporizador localmente y permite utilizarlo sin conexión a internet. Origen: Constitución, sección 1.1; Decisión 2.
- **RNF-02:** EL SISTEMA explica contextualmente la utilidad del permiso de notificaciones antes de solicitarlo al sistema operativo. Origen: Constitución, sección 1.3.

## Casos límite

- Si una fase llega a 00:00, el sistema completa la fase y prepara la siguiente detenida; no comienza su cuenta regresiva automáticamente.
- El formato MM:SS representa correctamente los tiempos 00:00, 00:01 y 59:59.
- El contador de pomodoros no se incrementa al terminar una fase de estudio, sino únicamente cuando el usuario inicia realmente el descanso.
- Durante un Descanso Largo, el contador de pomodoros se mantiene en el valor del ciclo cerrado (4/4) hasta que se inicia el siguiente estudio.
- Un cambio de duración de estudio, descanso corto o descanso largo no altera la fase que está en curso; el nuevo valor aplica a partir de la siguiente fase de ese tipo.
- Si el usuario cierra o bloquea el dispositivo con una fase corriendo y esta expira, al reabrir se muestra el tiempo en cero con la alarma garantizada y, al aceptar, la siguiente fase con el contador actualizado.

## Fuera de alcance

- Cambiar o validar los valores de configuración del temporizador (tiempos y ciclo de pomodoros).
- La definición de los intervalos o rangos permitidos de configuración.
- El inicio automático de cualquier fase: tras terminar una fase, la siguiente queda siempre detenida y lista para iniciar manualmente.
- El registro, inicio de sesión, anuncios publicitarios o cualquier dependencia de red.

## Criterios de finalización

- Los cuatro escenarios de HU-002 están cubiertos por al menos un RF cada uno.
- Al terminar una fase de estudio, se prepara el descanso correspondiente (corto o largo) detenido y listo para iniciar manualmente, con alarma garantizada.
- Al terminar un descanso, se prepara el siguiente estudio detenido y listo para iniciar manualmente.
- El contador de pomodoros se incrementa al iniciar un descanso y se reinicia a cero al iniciar el primer estudio tras un descanso largo.
- Al cerrar o bloquear la app y reabrirla, se conserva exactamente la fase, el tiempo y el contador (pausado conserva el tiempo; corriendo expirado muestra notificación y siguiente fase al aceptar).
- Los cambios de duración no afectan la fase en curso.
- La pantalla principal muestra la fase actual, el tiempo restante en MM:SS y los pomodoros del ciclo actual.

## Dudas abiertas

- No hay dudas abiertas.

## Revisión final de la spec

- **Contradicciones entre RF:** no se identifican. RF-01 y RF-02 distinguen descanso corto de largo por el límite de pomodoros; RF-04 incrementa el contador al iniciar el descanso y RF-05 lo reinicia al iniciar el primer estudio tras descanso largo, sin solaparse.
- **Escenarios de la HU sin RF:** no se identifican. Escenario 1: RF-01; Escenario 2: RF-02; Escenario 3: RF-03; Escenario 4: RF-06.
- **Conflictos con `docs/constitution.md`:** no se identifican; transición de fases, alarma garantizada, persistencia de estado, visualización y cambios de duración sin afectar la fase en curso están reflejados en la spec.
