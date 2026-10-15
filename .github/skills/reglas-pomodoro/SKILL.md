---
name: reglas-pomodoro
description: Úsala siempre que escribas, modifiques o revises código o textos que ejecuten, calculen, configuren o muestren el temporizador, estados, tiempos de descanso o ciclos del Pomodoro.
---
# Reglas de Negocio del Temporizador Pomodoro

## Reglas del Ciclo Pomodoro
- **Fase Inicial:** Toda nueva sesión inicia por defecto en la fase de **Estudio**.
- **Valores por Defecto:**
  - Tiempo de Estudio: 25 minutos (1500 segundos).
  - Descanso Corto: 5 minutos (300 segundos).
  - Descanso Largo: 15 minutos (900 segundos).
  - Ciclo para Descanso Largo: 4 pomodoros completados.
- **Transición de Fases:**
  - Al completar un tiempo de **Estudio**, el contador de pomodoros se incrementa en 1.
  - Si el número de pomodoros completados es menor al límite configurado (ej. 4), la siguiente fase es **Descanso Corto**.
  - Si el número de pomodoros completados alcanza el límite configurado (ej. 4), la siguiente fase es **Descanso Largo** y el contador de pomodoros del ciclo actual se reinicia a 0.
  - Al completar un **Descanso Corto** o **Descanso Largo**, la siguiente fase siempre es **Estudio**.

## Precisión e Integridad Numérica del Tiempo
- Todo tiempo interno debe calcularse en **segundos (enteros)** o **milisegundos**, pero mostrarse siempre al usuario formateado como `MM:SS` (minutos y segundos).
- **Cálculo basado en Timestamps:** Para evitar desfasajes en segundo plano o con pantalla bloqueada, el tiempo restante no debe depender de un temporizador de intervalo (`setInterval`), sino de la diferencia entre el instante de inicio/reanudación (`startTime`) y el tiempo actual del sistema (`Date.now()`).
- **Valores de Configuración Válidos:**
  - Duraciones de fases: Valores enteros estrictamente positivos (mayor a 0 minutos, dentro de rangos permitidos según la spec).
  - Rechazar entradas vacías, decimales no soportados, cero o números negativos.

## Checklist de Revisión
- [ ] ¿Se valida que al llegar al 4to pomodoro pase a Descanso Largo y el contador vuelva a 0?
- [ ] ¿Se prueba la precisión del tiempo al bloquear/cerrar y reabrir utilizando *timestamps*?
- [ ] ¿Se verifica el formato visual `MM:SS` en bordes como `00:00`, `00:01` y `59:59`?
- [ ] ¿Se rechaza la modificación de tiempos de una fase activa sin afectar el temporizador en ejecución actual?
- [ ] ¿Se verifica la persistencia local ante reinicios o cierre de la app?

## Al Terminar
Indica qué puntos del checklist has comprobado y cómo fueron verificados.