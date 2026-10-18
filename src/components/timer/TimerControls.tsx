/**
 * Botones de acción directa un toque: Iniciar / Pausar-Reanudar / Reiniciar.
 * Constitución §2.1. RF-02, RF-04.
 */

import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinHeight, TouchMinWidth } from '@/constants/theme';

export type TimerControlsProps = {
  /** Si el temporizador está corriendo. */
  estaCorriendo: boolean;
  /** Si el temporizador está pausado. */
  estaPausado: boolean;
  /** Acción para iniciar o pausar/reanudar. */
  onIniciarPausar: () => void;
  /** Acción para solicitar reinicio. */
  onReiniciar: () => void;
};

export function TimerControls({
  estaCorriendo,
  estaPausado,
  onIniciarPausar,
  onReiniciar,
}: TimerControlsProps) {
  const theme = useTheme();
  const esPausado = estaPausado;
  const labelPrincipal = estaCorriendo
    ? 'Pausar'
    : esPausado
      ? 'Reanudar'
      : 'Iniciar';

  return (
    <ThemedView type="surface" style={styles.container}>
      <Pressable
        style={[
          styles.botonPrincipal,
          { backgroundColor: theme.primary },
        ]}
        onPress={onIniciarPausar}
        accessibilityLabel={labelPrincipal}
        accessibilityRole="button"
      >
        <ThemedText type="smallBold" style={styles.textoBoton} themeColor="primaryText">
          {labelPrincipal}
        </ThemedText>
      </Pressable>
      <Pressable
        style={[
          styles.botonSecundario,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
        onPress={onReiniciar}
        accessibilityLabel="Reiniciar temporizador"
        accessibilityRole="button"
      >
        <ThemedText type="smallBold" style={styles.textoBoton} themeColor="surfaceText">
          Reiniciar
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  botonPrincipal: {
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    minWidth: TouchMinWidth,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundario: {
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
    minWidth: TouchMinWidth,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textoBoton: {
    textAlign: 'center',
  },
});
