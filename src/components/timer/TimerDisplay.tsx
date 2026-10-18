/**
 * Muestra la fase actual, el tiempo restante en MM:SS y los pomodoros del ciclo.
 * RF-06: fase actual (Estudio, Descanso Corto o Descanso Largo), tiempo restante
 * en formato MM:SS y número de pomodoros completados en el ciclo actual
 * (incluido 4/4 durante Descanso Largo). Constitución §2.2.
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatMMSS } from '@/domain/timer';
import { Spacing } from '@/constants/theme';

const ETIQUETA_FASE: Record<string, string> = {
  estudio: 'Estudio',
  descansoCorto: 'Descanso corto',
  descansoLargo: 'Descanso largo',
};

export type TimerDisplayProps = {
  state: {
    fase: string;
    pomodoros: number;
    status: string;
    tiempoRestante: number;
    startedAt: number | null;
    duracionFase: number;
  };
  tiempoMostrar: number; // tiempo restante calculado en tiempo real para mostrar
  cicloPomodoros: number; // cantidad de pomodoros por ciclo configurada
};

export function TimerDisplay({
  state,
  tiempoMostrar,
  cicloPomodoros,
}: TimerDisplayProps) {
  const etiqueta = ETIQUETA_FASE[state.fase] ?? state.fase;

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="subtitle"
        style={styles.fase}
        accessibilityLabel={`Fase: ${etiqueta}`}
        accessibilityRole="text"
      >
        {etiqueta}
      </ThemedText>
      <ThemedText
        type="title"
        style={styles.cronometro}
        accessibilityLabel={`Tiempo restante ${formatMMSS(tiempoMostrar)}`}
        accessibilityRole="text"
      >
        {formatMMSS(tiempoMostrar)}
      </ThemedText>
      <ThemedText
        type="smallBold"
        style={styles.pomodoros}
        accessibilityLabel={`Pomodoros: ${state.pomodoros} de ${cicloPomodoros}`}
        accessibilityRole="text"
      >
        Pomodoros: {state.pomodoros}/{cicloPomodoros}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  fase: {
    textAlign: 'center',
  },
  cronometro: {
    textAlign: 'center',
  },
  pomodoros: {
    textAlign: 'center',
  },
});
