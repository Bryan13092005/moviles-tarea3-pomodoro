---
name: rn-conventions
description: Úsala siempre que crees o modifiques pantallas, formularios o componentes de interfaz del Temporizador Pomodoro.
---

# Convenciones de interfaz en React Native

- Estilos con `StyleSheet`. Sin librerías de interfaz adicionales.
- Evitar diseños genéricos.
- Campos numéricos o de configuración (ej. duraciones de minutos): teclado numérico (`keyboardType="number-pad"` o `keyboardType="numeric"`). Según el idioma del teléfono, ese teclado puede escribir coma o punto como separador decimal.
- Los formularios y pantallas de ajustes no deben quedar tapados por el teclado. Usa un contenedor que se desplace o ajuste (`KeyboardAvoidingView` / `ScrollView`), y permite tocar botones con el teclado abierto (`keyboardShouldPersistTaps="handled"`).
- Respeta las áreas seguras del dispositivo (muesca y barras del sistema) usando `SafeAreaView` o componentes equivalentes de Expo.
- Listas con `FlatList` y una clave estable por elemento (`keyExtractor` usando `id` único, nunca el índice).
- Objetivos táctiles de al menos 44x44 puntos. Etiquetas de accesibilidad (`accessibilityLabel`, `accessibilityRole`) en botones e iconos.
- Acciones destructivas o de reinicio (ej. reiniciar la sesión de estudio o restablecer ajustes) siempre piden confirmación con un diálogo del sistema (`Alert.alert`).
- Todos los textos visibles en español.

## Lista manual de verificación en Expo Go
- [ ] Se ve bien en vertical y al girar el teléfono.
- [ ] El teclado no tapa el campo ni el botón que se está usando en la pantalla de ajustes.
- [ ] Las duraciones numéricas se ingresan correctamente según el separador/formato que ofrece el teléfono y se comportan como dice la spec.
- [ ] Cerrar la app por completo (o bloquear la pantalla) y volver a abrirla conserva el tiempo restante y los datos de la sesión.
- [ ] La fase actual (Estudio, Descanso Corto, Descanso Largo) y el estado del temporizador se leen claramente sin depender únicamente del color.