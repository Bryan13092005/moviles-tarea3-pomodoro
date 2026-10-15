# Temporizador Pomodoro

Aplicación móvil para estudiantes: controlar sesiones de estudio y descansos mediante la técnica Pomodoro, adaptar tiempos y mantener el conteo en segundo plano. Proyecto didáctico construido con Spec-Driven Development (SDD).

## Stack y Estructura

- **Tecnologías:** Expo (plantilla por defecto de `create-expo-app`), TypeScript y Expo Router.
- **Persistencia local:** `@react-native-async-storage/async-storage`. Sin backend ni cuentas.
- **Arquitectura:**
  - `src/domain/`: Lógica pura (sin React ni AsyncStorage).
  - `src/storage/`: Persistencia local.
  - `app/`: Pantallas y navegación (Expo Router).
  - `tests/`: Pruebas unitarias e integración junto a cada módulo.

## Comandos

- **Pruebas:** `npx jest`
- **Tipos:** `npx tsc --noEmit`
- **Ejecutar la app:** `npx expo start` (solo cuando el usuario lo pida)

## Dónde está cada cosa

- `constitution.md` (o `docs/constitution.md`): Principios e innegociables del proyecto.
- `docs/historias/` (o raíz): Historias de usuario en formato Gherkin (`HU-001.md` a `HU-006.md`).
- `specs/HU-nombre/`: `decisiones.md`, `spec.md`, `plan.md` y `tasks.md` de cada historia.
- `MEMORY.md`: Estado actual del trabajo.
- `.github/skills/`: Método SDD, reglas de negocio del Pomodoro, paleta y convenciones.

## Cómo trabajar

1. **Al empezar:** Lee siempre `MEMORY.md` y `constitution.md`.
2. **Idiomas:** Código, variables y nombres en inglés; textos de interfaz, comentarios y documentos en español.
3. **Aclaraciones:** No tomes decisiones de producto o de diseño que la historia o `decisiones.md` no definan. Márcalas como `[NECESITA ACLARACIÓN]` y avísame.
4. **Alcance:** Haz solo la fase o la tarea que se te pide. No me avances a la siguiente sin autorización.
5. **TDD:** En la lógica del dominio, escribe primero las pruebas (*Test-Driven Development*).
6. **Permisos:** Pregunta antes de instalar dependencias, crear archivos fuera del plan o cambiar el formato de los datos guardados.
7. **Restricciones:** No reemplaces archivos existentes si la tarea no lo pide. No guardes datos sensibles. No hagas commit.

## Manejo de MEMORY.md

- Solo debe contener las secciones "Estado actual" y "Próximos pasos".
- Al terminar una fase o tarea, actualiza únicamente esas dos secciones.
- No copies decisiones ni contenido detallado de las specs.
- Mantén el archivo dentro del límite de 50 líneas.