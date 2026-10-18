# Decisiones de producto — HU-005 Ajustar los tiempos del pomodoro

Estas decisiones complementan la historia de usuario HU-005 y la `docs/constitution.md`. Cada una responde a una pregunta formulada durante la entrevista de descubrimiento. No se incluye código ni la spec de implementación.

---

## 1. Rangos permitidos por campo

**Pregunta:** ¿Cuál es el valor mínimo y máximo que el usuario puede ingresar en cada uno de los cuatro campos (tiempo de estudio, descanso corto, descanso largo, cantidad de pomodoros por ciclo)?

**Respuesta:**
- Tiempo de estudio: 1 a 60 minutos.
- Descanso corto: 1 a 15 minutos.
- Descanso largo: 1 a 30 minutos.
- Pomodoros por ciclo: 3 a 8.

**Motivo:** HU-005 y la constitución prohíben valores vacíos, en 0 o fuera de rango, pero no definen los límites. Estos rangos definen qué cuenta como "fuera de rango" y qué valores válidos se le indican al usuario.

---

## 2. Validación de campos y presentación de errores

**Pregunta:** Cuando el usuario deja un campo vacío, pone cero o un valor fuera de rango, ¿cómo se le notifica el error y cuándo? Si hay varios campos inválidos, ¿se muestran todos a la vez o solo el primero?

**Respuesta:** La validación es en tiempo real mientras el usuario escribe sobre cada campo, validando el formulario. Los campos del formulario arrancan con los valores reales (los actuales del sistema). Puede colocarse un texto menos visible al lado del nombre del campo mostrando el rango de valores permitidos.

**Motivo:** HU-005 solo dice que la app "no guarda el cambio y me indica qué valores puedo usar", sin definir la mecánica ni el momento de la notificación.

---

## 3. Confirmación visual tras guardar cambios válidos

**Pregunta:** Cuando el usuario guarda cambios válidos, ¿aparece algún aviso de confirmación o se aplica silenciosamente?

**Respuesta:** Sí. Una vez que se toca guardar, aparece un mensaje de confirmación tipo alert con color verde (success) indicando los tiempos que se usarán, por ejemplo:

- Tiempo de estudio: NN min.
- Tiempo descanso corto: NN min.
- Tiempo descanso largo: NN min.
- Total de Pomodoros: NUM.

Se muestran los valores ingresados o, en caso de no haber cambiado, los valores originales.

**Motivo:** HU-005 no especifica si el usuario recibe confirmación tras guardar; esta decisión cierra el flujo de éxito.

---

## 4. Confirmación de restablecimiento a valores de fábrica

**Pregunta:** ¿Cómo se solicita al usuario que confirme el restablecimiento de los ajustes?

**Respuesta:** Se muestra un diálogo de sí/no al tocar "Restablecer". Si el usuario responde sí, se resetean a los valores normales el tiempo de estudio, los descansos y los pomodoros.

**Motivo:** La constitución exige confirmación para el restablecimiento, pero no define el mecanismo de interacción.

---

## 5. Efecto del restablecimiento sobre el ciclo en curso y el contador de pomodoros

**Pregunta:** Cuando el usuario restablece a valores de fábrica, ¿qué pasa con el contador de pomodoros completados en el ciclo actual y con la actividad del temporizador?

**Respuesta:** El contador de pomodoros y los tiempos vuelven a sus valores por defecto, y se para la actividad/contador actual.

**Motivo:** HU-005 Escenario 3 menciona que los tiempos vuelven a fábrica, pero no aclara el estado del contador de pomodoros ni la actividad en curso.

---

## 6. Formato de visualización del tiempo restante

**Pregunta:** ¿Cómo se muestra exactamente el cronómetro en pantalla (dígitos, ceros a la izquierda, segundos)?

**Respuesta:** Siempre 2 dígitos en minutos y 2 dígitos en segundos, formato MM:SS. Ejemplos: 25:00, 00:00, 01:01, 02:00.

**Motivo:** La constitución indica formato min:seg pero no define los detalles de presentación que ve el usuario.

---

## 7. Cambiar la cantidad de pomodoros por ciclo con un ciclo en progreso

**Pregunta:** ¿Qué sucede con el contador de pomodoros del ciclo actual si el usuario edita el campo "cantidad de pomodoros por ciclo" mientras hay un ciclo en progreso?

**Respuesta:** Se ajusta verificando si es posible. Si el usuario ya lleva más pomodoros completados de los que coloca como nuevo máximo, sale un error y no se hace la actualización. Si es posible, se aplica el cambio.

**Motivo:** HU-005 no cubre la edición de la cantidad de pomodoros durante un ciclo en progreso, y esto afecta directamente lo que el usuario ve y puede hacer.

---

## 8. Edición de ajustes mientras el temporizador está activo

**Pregunta:** ¿Los campos de ajustes se pueden editar mientras hay una sesión activa (corriendo o pausada), o se bloquean/deshabilitan?

**Respuesta:** Sí, es libre e independiente de si está corriendo o pausado, porque no afectará a esa etapa. Los cambios aplican a la siguiente iteración de dicha fase.

**Motivo:** La constitución permite cambios durante una fase en curso sin afectar el temporizador activo, pero no define si los campos de configuración permanecen editables visualmente durante la sesión.
