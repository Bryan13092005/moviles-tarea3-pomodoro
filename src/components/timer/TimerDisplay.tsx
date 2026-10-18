/**
 * Muestra la fase actual, el tiempo restante en MM:SS y los pomodoros del ciclo.
 * RF-06: fase actual (Estudio, Descanso Corto o Descanso Largo), tiempo restante
 * en formato MM:SS y número de pomodoros completados en el ciclo actual
 * (incluido 4/4 durante Descanso Largo). Constitución §2.2.
 * La fase se comunica siempre con texto + indicador de color además del color.
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatMMSS } from '@/domain/timer';
import { Spacing, ThemeColor } from '@/constants/theme';

const ETIQUETA_FASE: Record<string, string> = {
  estudio: 'Estudio',
  descansoCorto: 'Descanso corto',
  descansoLargo: 'Descanso largo',
};

/** Color del indicador de fase por fase (siempre acompañado de su etiqueta de texto). */
const COLOR_INDICADOR_FASE: Record<string, string> = {
  estudio: 'primary',        // Dorado Académico
  descansoCorto: 'active',   // Dorado Brillante
  descansoLargo: 'primary',  // Dorado Académico
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
  const indicadorColor = COLOR_INDICADOR_FASE[state.fase] ?? 'primary';

  return (
    <ThemedView type="surface" style={styles.container}>
      {/* Indicador de fase: texto + punto de color */}
      <ThemedView type="surface" style={styles.faseRow}>
        <ThemedView type={indicadorColor as ThemeColor} style={styles.indicador} />
        <ThemedText
          type="subtitle"
          style={styles.fase}
          themeColor="surfaceText"
          accessibilityLabel={`Fase: ${etiqueta}`}
          accessibilityRole="text"
        >
          {etiqueta}
        </ThemedText>
      </ThemedView>

      {/* Tiempo restante: acento de tiempo (fondo dorado, texto institucional) */}
      <ThemedView type="primary" style={styles.timePill}>
        <ThemedText
          type="title"
          style={styles.cronometro}
          themeColor="primaryText"
          accessibilityLabel={`Tiempo restante ${formatMMSS(tiempoMostrar)}`}
          accessibilityRole="text"
        >
          {formatMMSS(tiempoMostrar)}
        </ThemedText>
      </ThemedView>

      <ThemedText
        type="default"
        style={styles.pomodoros}
        themeColor="textSecondary"
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
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  faseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  indicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fase: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  timePill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cronometro: {
    textAlign: 'center',
    fontSize: 72,
    lineHeight: 84,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pomodoros: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
});
