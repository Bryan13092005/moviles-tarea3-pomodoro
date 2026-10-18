---
name: estilos-colores
description: Úsala siempre que crees o modifiques colores, dimensiones, tamaños, estilos o pantallas de la aplicación.
---
# Paleta de Colores, Estilos y Dimensiones de la Aplicación

Fuente: Guía de Estilo Visual y Marca de la Academia Cotopaxi[cite: 1].

## Roles (fondo, texto y contraste)
- Encabezado y barra superior: fondo `#0E1326` (Azul Marino Profundo), texto `#FFFFFF` (16.8:1).
- Botón primario y acento de tiempo: fondo `#D4A017` (Dorado Académico / Sol), texto `#0E1326` (9.5:1).
- Fondo de pantalla principal: fondo `#161D3A` (Azul Marino Institucional), texto `#FFFFFF` (13.5:1).
- Tarjetas y contenedores claros: fondo `#FFFFFF` (Blanco Puro), texto `#161D3A` (13.5:1).
- Destacados, botones hover y estados activos: fondo `#E5B83B` (Dorado Brillante), texto `#0E1326` (11.2:1).
- Texto secundario sobre blanco: `#5a6e82` (5.27:1).
- Bordes y elementos inactivos: `#b5bbc8`. Nunca como color de texto.

## Dimensiones, Tamaños y Tipografía

### Objetivos Táctiles y Botones
- **Área táctil mínima:** Todos los botones y componentes interactivos deben tener un tamaño objetivo mínimo de `44x44` puntos para garantizar accesibilidad.
- **Botones primarios (Iniciar/Reanudar):** Altura mínima de `52pt` a `56pt`, `borderRadius: 12pt`, padding horizontal de `24pt`.
- **Botones secundarios/icono:** Mínimo `44x44pt`, `borderRadius: 8pt` a `10pt`.
- **Espaciado táctil:** Margen mínimo de `12pt` a `16pt` entre botones principales para evitar toques accidentales.

### Tipografía y Tamaños de Texto
- **Reloj / Contador del Temporizador:** Tamaño prominente de `64pt` a `80pt` con `fontWeight: 'bold'` o `'700'`, utilizando fuentes monoespaciadas o numéricas para evitar saltos de ancho (`fontVariant: ['tabular-nums']`).
- **Título de Fase (Estudio / Descanso):** Tamaño `24pt` a `28pt` con `fontWeight: '600'`.
- **Contador de Pomodoros / Subtítulos:** Tamaño `16pt` a `18pt` con `fontWeight: '500'`.
- **Cuerpo / Etiquetas de Formulario:** Tamaño `14pt` a `16pt`.
- **Texto secundario / Leyendas:** Tamaño `12pt` a `13pt`.

### Tarjetas, Contenedores y Espaciado (Grid)
- **Margen de pantalla (Padding exterior):** `16pt` o `20pt` a los lados.
- **Tarjetas / Módulos:** `borderRadius: 16pt`, `padding: 16pt` o `20pt`.
- **Gap/Espaciado entre elementos:** Escala consistente de `8pt`, `12pt`, `16pt`, `24pt`, `32pt`.

## Prohibido (no cumplen contraste adecuado o rompen la identidad)
- Botones o íconos cliqueables menores a `44x44` puntos.
- Texto claro sobre amarillos o dorados claros sin suficiente contraste.
- Usar colores fuera de la paleta institucional definida sin previa autorización.

## Reglas
- La fase o estado actual del temporizador (Estudio, Descanso Corto, Descanso Largo) se comunica siempre con texto e indicadores visuales claros además del color.
- Usa únicamente colores y proporciones de esta lista. Si falta alguna dimensión o color para un estado específico, solicita aclaración antes de implementarlo.
- Prohibido CAMBIAR ALGUNA FUNCIONALIDAD, HOOKS DE REACT o la lógica de la aplicacion.