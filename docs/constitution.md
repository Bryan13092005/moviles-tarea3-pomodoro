# Constitución del Proyecto: Aplicación de Temporizador Pomodoro

Este documento establece las reglas, principios e innegociables arquitectónicos y funcionales derivados de las Historias de Usuario (HU-001 a HU-006). Todos los desarrollos, decisiones de diseño y planes de trabajo deben alinearse estrictamente a estos principios.

---

## 1. Principios Innegociables del Sistema (Core Non-Negotiables)

### 1.1. Experiencia de Usuario y Accesibilidad Inmediata (HU-006)
* **Cero Fricción Inicial:** La aplicación NO debe requerir registro, creación de cuenta, inicio de sesión ni configuración inicial previa para ser utilizada. El usuario aterriza directamente en la pantalla del temporizador al instalarla.
* **Privacidad y Funcionamiento Offline:** Funcionamiento 100% autónomo sin necesidad de conexión a internet (Wi-Fi o datos móviles). Todo el estado y la configuración deben persistir exclusivamente de forma local.
* **Sin Interrupciones:** Queda estrictamente prohibida la inclusión de anuncios publicitarios, pop-ups comerciales o banners en cualquier pantalla de la aplicación.

### 1.2. Fiabilidad e Integridad del Tiempo (HU-003)
* **Ejecución en Segundo Plano:** El temporizador DEBE mantener la precisión del tiempo exacto sin importar si el dispositivo está bloqueado, la aplicación pasa a segundo plano o es cerrada por el sistema/usuario.
* **Sincronización por Marca de Tiempo (Timestamp-based Logic):** El conteo del tiempo no dependerá exclusivamente de un ciclo activo en memoria (`setInterval`), sino de marcas de tiempo del sistema (*timestamps*) para recalcular con precisión el tiempo restante real al reabrir la app o recuperar el estado.
* **Persistencia del Estado Pausado:** Si el temporizador es pausado manualmente, el tiempo restante no debe sufrir ninguna degradación ni descuente al cerrar o reiniciar la aplicación.

### 1.3. Sistema de Notificaciones y Alarmas Robustas (HU-004)
* **Garantía de Notificación de Fin de Fase:** Al cumplir el tiempo de una fase (estudio o descanso), la alerta debe sonar/vibrar sin importar el estado del dispositivo (modo silencio, no molestar o pantalla bloqueada).
* **Transparencia en Permisos:** La solicitud del permiso de notificaciones debe explicarse claramente al usuario de forma contextual (al iniciar el primer lanzamiento de la aplicación o mientras el usuario denege el permiso), justificando su utilidad antes de invocar la solicitud nativa del sistema operativo.

---

## 2. Especificaciones de Ciclo de Vida y Flujo Pomodoro (HU-001, HU-002, HU-005)

### 2.1. Controles y Confirmaciones del Temporizador
* **Acciones Directas:** Iniciar y pausar/reanudar deben ser acciones inmediatas de un solo toque.
* **Protección ante Reinicio Accidental:** La acción de reiniciar un temporizador (corriendo o pausado) DEBE incluir un paso de confirmación explícito. La cancelación de dicha confirmación debe preservar exactamente el tiempo y estado previo sin alteraciones.

### 2.2. Reglas del Ciclo Pomodoro
* **Gestión Automática de Fases:**
  * Al finalizar un bloque de estudio, la app debe preparar automáticamente la fase de **Descanso Corto**, incrementando el contador de pomodoros.
  * Al completar la cantidad de pomodoros configurada (por defecto: 4), la app debe activar el **Descanso Largo** y reiniciar el contador de pomodoros del ciclo actual a cero.
  * Al finalizar un descanso (corto o largo), la app debe preparar la siguiente fase de **Estudio**.
* **Visualización de Estado:** La pantalla principal debe indicar claramente en todo momento:
  1. La fase actual (Estudio, Descanso Corto, Descanso Largo).
  2. El tiempo restante en formato min:seg.
  3. El número de pomodoros completados en el ciclo actual.

### 2.3. Parámetros y Valores por Defecto
* **Valores Iniciales del Sistema:**
  * Tiempo de Estudio: **25 minutos**
  * Descanso Corto: **5 minutos**
  * Descanso Largo: **15 minutos**
  * Ciclo de Pomodoros: **4 pomodoros**
* **Validación de Límites:**
  * Los campos de configuración no pueden guardarse vacíos, en 0 ni fuera de los rangos permitidos.
  * Los cambios de duración aplicados durante una fase en curso no deben alterar el temporizador activo actual; se aplicarán únicamente a partir de la siguiente iteración de dicha fase.
* **Opción de Restablecimiento:** Debe existir siempre la capacidad de volver a los valores predeterminados de fábrica mediante confirmación.

---

## 3. Matriz de Trazabilidad y Cobertura (Specs vs. Innegociables)

| ID Spec | Módulo / Requisito Clave | Criterio Innegociable de Aceptación |
| :--- | :--- | :--- |
| **HU-001** | Control del Temporizador | Confirmación obligatoria para reiniciar. Cancelación preserva estado intacto. |
| **HU-002** | Lógica de Transición Pomodoro | Alternancia automática de fases y reset del contador tras descanso largo. |
| **HU-003** | Resiliencia en Segundo Plano | Uso de *timestamps* del sistema para recalcular tiempo tras cierre/bloqueo. |
| **HU-004** | Notificaciones / Alarmas | Alerta garantizada en modo silencio/vibración; flujo claro de permisos. |
| **HU-005** | Configuración de Tiempos | Validación estricta de inputs; cambios no rompen la fase en ejecución actual. |
| **HU-006** | Acceso Offline y Sin Registro | Inicio inmediato en pantalla principal sin login/registro, 100% offline y sin anuncios. |

---

## 4. Guía de Cumplimiento para Desarrollo y QA

1. **Estrategia de Pruebas de Sistema:** Ninguna release o construcción de código será aprobada si incumple los escenarios de batería/segundo plano (HU-003) o si introduce dependencias de red/autenticación (HU-006).
2. **Arquitectura:** Toda actualización de estado debe guardarse de forma sincrónica o atómica en el almacenamiento local persistente (`Storage` / `Preferences`) antes de suspender la app.