# Spec 005 — AjusteTiempo

Estado: aprobado
HU de origen: docs/historias/HU_005.md

## Contexto y objetivo

El estudiante quiere adaptar la técnica Pomodoro a su propio ritmo cambiando la duración del estudio, los descansos y la cantidad de pomodoros antes del descanso largo. Esta spec define el comportamiento de la pantalla de ajustes: validación de entradas, persistencia de valores, confirmación de cambios, restablecimiento a valores de fábrica y el efecto de editar mientras el temporizador está activo.

## Usuarios

- Estudiante (rol definido en HU-005): usuario final de la app, sin registro ni cuenta.

## Historias de usuario

- HU-005 — Ajustar los tiempos del pomodoro (docs/historias/HU_005.md).

## Definiciones (solo si hay términos que puedan interpretarse de varias formas)

- **Fase en curso**: la fase del temporizador actualmente activa (Estudio, Descanso Corto o Descanso Largo), ya sea corriendo o pausada.
- **Siguiente iteración de una fase**: la próxima vez que la app inicie esa misma fase después de que la actual termine.
- **Rango permitido**: intervalo de valores válidos para cada campo de ajuste (decisión 1).
- **Valores de fábrica**: estudio 25 min, descanso corto 5 min, descanso largo 15 min, 4 pomodoros por ciclo (constitución sección 2.3).

## Requisitos funcionales

**RF-01:** CUANDO el usuario modifica uno o más campos de ajustes y toca "Guardar", EL SISTEMA valida que cada campo esté dentro de su rango permitido y, si todos son válidos, guarda los nuevos valores. Origen: HU-005 Escenario 1, Decisión 2.

**RF-02:** CUANDO los valores guardados son válidos, EL SISTEMA aplica los nuevos tiempos y la cantidad de pomodoros a partir de la siguiente iteración de cada fase, sin alterar la fase en ejecución actual. Origen: HU-005 Escenario 1, Constitución 2.3, Decisión 8.

**RF-03:** CUANDO se guardan cambios válidos, EL SISTEMA mantiene los valores aunque el usuario cierre la aplicación o el dispositivo se bloquee. Origen: HU-005 Escenario 1, Constitución 1.2.

**RF-04:** CUANDO el usuario guarda cambios válidos, EL SISTEMA muestra un mensaje de confirmación indicando los tiempos que se usarán (tiempo de estudio, tiempo descanso corto, tiempo descanso largo, total de pomodoros). Origen: Decisión 3.

**RF-05:** MIENTRAS el usuario escribe en un campo de ajustes, EL SISTEMA valida en tiempo real que el valor no esté vacío, no sea cero y esté dentro del rango permitido para ese campo. Origen: HU-005 Escenario 2, Decisión 2.

**RF-06:** SI el usuario deja un campo vacío, pone cero o un valor fuera de rango, EL SISTEMA no guarda el cambio y le indica qué valores puede usar (rango permitido) para ese campo. Origen: HU-005 Escenario 2, Decisión 1, Decisión 2.

**RF-07:** EL SISTEMA aplica los siguientes rangos permitidos: tiempo de estudio de 1 a 60 minutos, descanso corto de 1 a 15 minutos, descanso largo de 1 a 30 minutos, y pomodoros por ciclo de 3 a 8. Origen: Decisión 1, HU-005 Escenario 2.

**RF-08:** CUANDO el usuario toca "Restablecer" y confirma el restablecimiento a valores de fábrica, EL SISTEMA devuelve el tiempo de estudio a 25 minutos, el descanso corto a 5 minutos, el descanso largo a 15 minutos, la cantidad de pomodoros por ciclo a 4, detiene la actividad del temporizador actual y reinicia el contador de pomodoros del ciclo actual. Origen: HU-005 Escenario 3, Decisión 4, Decisión 5.

**RF-09:** SI el usuario toca "Restablecer" y cancela la confirmación, EL SISTEMA preserva exactamente los valores y el estado actuales sin alteraciones. Origen: Decisión 4, Constitución 2.1.

**RF-10:** MIENTRAS el temporizador está activo (corriendo o pausado), EL SISTEMA permite editar los campos de ajustes sin bloquearlos, y los cambios aplican únicamente a la siguiente iteración de cada fase. Origen: HU-005 Escenario 4, Decisión 8, Constitución 2.3.

**RF-11:** CUANDO el usuario cambia la cantidad de pomodoros por ciclo mientras hay un ciclo en progreso, EL SISTEMA verifica si el cambio es posible; si el usuario ya lleva más pomodoros completados que el nuevo máximo, no aplica el cambio y muestra un error; si es posible, aplica el cambio. Origen: Decisión 7.

## Requisitos no funcionales

**RNF-01:** La pantalla de ajustes y todas sus interacciones deben funcionar sin conexión a internet (100% offline). Origen: Constitución 1.1, HU-006.

**RNF-02:** No se muestran anuncios, pop-ups comerciales ni banners en la pantalla de ajustes ni en ninguna pantalla de la aplicación. Origen: Constitución 1.1.

**RNF-03:** La validación de los campos de ajustes y la respuesta al usuario debe ser inmediata (tiempo real mientras el usuario escribe). Origen: Decisión 2.

## Casos límite

- Campo vacío: se trata como valor inválido (RF-06).
- Valor cero: se trata como valor inválido (RF-06).
- Valor por debajo del mínimo del rango (p. ej. estudio = 0 min): se trata como fuera de rango (RF-06, RF-07).
- Valor por encima del máximo del rango (p. ej. descanso corto = 20 min): se trata como fuera de rango (RF-06, RF-07).
- Nuevo máximo de pomodoros inferior al contador actual del ciclo: se rechaza con error (RF-11).
- Restablecimiento cancelado: se preservan valores y estado (RF-09).
- Edición durante fase en curso: no afecta la fase actual (RF-02, RF-10).
- Cierre de la aplicación con cambios guardados sin aplicar: los valores persisten y se aplican en la siguiente iteración (RF-03).

## Fuera de alcance

- Diseño visual, colores y estilos de pantalla (skill estilos-colores/rn-conventions).
- Persistencia en servidor o red externa (la app es 100% offline, Constitución 1.1).
- Registro, inicio de sesión o cuentas de usuario (Constitución 1.1).
- Sonidos, vibración y notificaciones de alarma (HU-004).
- Formato MM:SS del cronómetro en la pantalla principal del temporizador (pertenece a HU-001/HU-002, decisión 6 es de presentación del timer, no del ajuste de valores).

## Criterios de finalización

- Cada RF es verificable y termina con su "Origen:" (escenario de HU o decisión de decisiones.md).
- Cada uno de los 4 escenarios de HU-005 está cubierto por al menos un RF.
- Ningún RF contradice docs/constitution.md.
- No hay decisiones inventadas: todo lo no resuelto en decisiones.md se marca [NECESITA ACLARACIÓN].

## Dudas abiertas

No hay dudas abiertas; las 8 decisiones de specs/005-ajusteTiempo/decisiones.md están resueltas.

---

### Revisión final de la spec

1. **RF-02 y RF-10** ambos dicen que los cambios no alteran la fase actual y aplican a la siguiente iteración: posible redundancia, pero RF-02 se enfoca en el efecto tras guardar y RF-10 en que los campos sigan editables durante la sesión. No es contradicción.
2. **RF-08** dice que el restablecimiento detiene la actividad del temporizador y reinicia el contador de pomodoros; no entra en conflicto con la constitución.
3. **RF-11** cubre la edición de pomodoros durante ciclo en progreso; no hay escenario de HU que lo mencione explícitamente, pero sale de Decisión 7, por lo está justificado.
4. Todos los 4 escenarios de HU-005 tienen al menos un RF: Escenario 1 (RF-01, RF-02, RF-03, RF-04), Escenario 2 (RF-05, RF-06, RF-07), Escenario 3 (RF-08, RF-09), Escenario 4 (RF-10, RF-11).
5. No hay conflictos con docs/constitution.md.
6. No hay [NECESITA ACLARACIÓN] pendientes.
7. RF-04 (mensaje de confirmación verde) no entra en conflicto con Constitución 1.1 (sin anuncios/banners), pues es un mensaje de sistema tras acción del usuario, no publicidad.
8. RF-03 (persistencia tras cierre) cumple Constitución 1.2 (persistencia local).
9. No se menciona stack, arquitectura, formatos de almacenamiento ni nombres de archivo.
10. Máximo 10 puntos revisados; sin proponer soluciones.
