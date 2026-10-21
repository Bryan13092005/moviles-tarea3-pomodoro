/**
 * Muestra la fase actual, el tiempo restante en MM:SS y los pomodoros del ciclo.
 * RF-06: fase actual (Estudio, Descanso Corto o Descanso Largo), tiempo restante
 * en formato MM:SS y número de pomodoros completados en el ciclo actual
 * (incluido 4/4 durante Descanso Largo). Constitución §2.2.
 * La fase se comunica siempre con texto + indicador de color además del color.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimerRing } from '@/components/timer/TimerRing';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const completados = Math.min(state.pomodoros, cicloPomodoros);
  const progresoFase =
    state.duracionFase > 0 ? 1 - tiempoMostrar / state.duracionFase : 0;
  const progreso = cicloPomodoros > 0 ? completados / cicloPomodoros : 0;

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

      {/* Tiempo restante dentro de un anillo que se llena con el avance de la fase */}
      <TimerRing progreso={progresoFase}>
        <ThemedText
          type="title"
          style={styles.cronometro}
          themeColor="surfaceText"
          numberOfLines={1}
          accessibilityLabel={`Tiempo restante ${formatMMSS(tiempoMostrar)}`}
          accessibilityRole="text"
        >
          {formatMMSS(tiempoMostrar)}
        </ThemedText>
      </TimerRing>

      <ThemedText
        type="default"
        style={styles.pomodoros}
        themeColor="textSecondary"
        accessibilityLabel={`Pomodoros: ${state.pomodoros} de ${cicloPomodoros}`}
        accessibilityRole="text"
      >
        Pomodoros: {state.pomodoros}/{cicloPomodoros}
      </ThemedText>

      <View
        style={[styles.barraPista, { backgroundColor: theme.border }]}
        accessibilityRole="progressbar"
        accessibilityLabel="Progreso del ciclo de pomodoros"
        accessibilityValue={{ min: 0, max: cicloPomodoros, now: completados }}
      >
        <View
          style={[
            styles.barraRelleno,
            { backgroundColor: theme.primary, width: `${progreso * 100}%` },
          ]}
        />
      </View>
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
  cronometro: {
    textAlign: 'center',
    fontSize: 64,
    lineHeight: 76,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barraPista: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 5,
  },
  pomodoros: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
});
