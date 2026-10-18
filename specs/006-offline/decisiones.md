# Decisiones de producto — HU-006 Usar la aplicación sin registro, sin internet y sin publicidad

Estas decisiones complementan la historia de usuario HU-006 y la `docs/constitution.md`. Cada una responde a una pregunta formulada durante la entrevista de descubrimiento. No se incluye código ni la spec de implementación.

---

## 1. Almacenamiento local no legible al iniciar

**Pregunta:** Cuando el almacenamiento local no puede leerse (datos corruptos, espacio insuficiente o denegado por el sistema), ¿qué ve el usuario y con qué valores arranca la app?

**Respuesta:** Muestra un error, no puede iniciar.

**Motivo:** El usuario definió que la app no arranca si no puede leer el almacenamiento local.

---

## 2. Escritura de ajustes fallida

**Pregunta:** Cuando el usuario guarda ajustes pero el almacenamiento local no puede escribirse, ¿qué ve el usuario y qué pasa con los cambios?

**Respuesta:** Se muestra un error y no se cambia nada.

**Motivo:** El usuario definió que falla la escritura: error visible y sin modificaciones en pantalla ni en datos.

---

## 3. Reintento tras error de inicio

**Pregunta:** Cuando la app falla al abrirse por error de almacenamiento y el usuario la relanza, ¿se reintenta leer el almacenamiento automáticamente o debe hacer algo concreto?

**Respuesta:** Se debe intentar automáticamente.

**Motivo:** El usuario definió que al relanzar la app se reintenta la lectura del almacenamiento sin intervención manual.

---

## 4. Desinstalación y reinstalación

**Pregunta:** Al desinstalar y reinstalar la app, ¿qué ve el usuario: valores de fábrica o los ajustes y estado previos recuperados?

**Respuesta:** Se ve todo de fábrica, porque se borró lo que había local.

**Motivo:** El usuario definió que el almacenamiento local se borra con la desinstalación, por tanto se arranca de fábrica.

---

## 5. Indicador de estado offline

**Pregunta:** ¿Se le muestra al usuario algún indicador de modo offline/sin conexión?

**Respuesta:** No, no es necesario porque todo es offline.

**Motivo:** La app está diseñada 100% offline por constitución e HU-006, por lo que no necesita indicarle al usuario que no hay conexión.

---

## 6. Ajustes modificados sin guardar al cerrar

**Pregunta:** El usuario modifica ajustes sin guardar y cierra la app. ¿Qué ve al reabrir?

**Respuesta:** Simplemente continúa el flujo normal; verá la pantalla que le salga al abrirla.

**Motivo:** No hay estado de "cambios pendientes"; al reabrir se muestra lo último guardado (o fábrica si no hay nada).

---

## 7. Estado del temporizador al suspender/cerrar y fallo de escritura

**Pregunta:** Si al cerrar o pasar a segundo plano no se puede escribir el estado del temporizador (fase, tiempo restante, correr/pausado, contador de pomodoros), ¿qué ve el usuario al reabrir?

**Respuesta:** Sale un error, se pierde la información de la sesión en curso y al abrirla se ve lo último que se haya guardado correctamente.

**Motivo:** El usuario definió que hay error visible, pérdida del estado activo y recuperación del último estado persistido válido.

---

## 8. Datos guardados en el almacenamiento local

**Pregunta:** ¿Qué datos se guardan exactamente en el almacenamiento local (solo tiempos y contador, o también timestamps para recalcular el tiempo real al reabrir)?

**Respuesta:** Se puede guardar, pero actualmente ya está implementado y no necesita correcciones.

**Motivo:** La implementación existente ya cumple con lo requerido (persistencia local y lógica de timestamps según la constitución), por lo que no se requiere una nueva decisión de producto.
