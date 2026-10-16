/**
 * Muestra la fase actual, el tiempo restante en MM:SS y los pomodoros del ciclo.
 * RF-03, RF-14, Constitución §2.2.
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
  tiempoMostrar: number;
};

export function TimerDisplay({
  state,
  tiempoMostrar,
}: TimerDisplayProps) {
  const etiqueta = ETIQUETA_FASE[state.fase] ?? state.fase;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.fase}>
        {etiqueta}
      </ThemedText>
      <ThemedText type="title" style={styles.cronometro}>
        {formatMMSS(tiempoMostrar)}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.pomodoros}>
        Pomodoros: {state.pomodoros}/4
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
