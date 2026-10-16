/**
 * Botones de acción directa un toque: Iniciar / Pausar-Reanudar / Reiniciar.
 * Constitución §2.1. RF-02, RF-04.
 */

import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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
  const esPausado = estaPausado;
  const labelPrincipal = estaCorriendo
    ? 'Pausar'
    : esPausado
      ? 'Reanudar'
      : 'Iniciar';

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={styles.botonPrincipal}
        onPress={onIniciarPausar}
        accessibilityLabel={labelPrincipal}
        accessibilityRole="button"
      >
        <ThemedText type="smallBold" style={styles.textoBoton}>
          {labelPrincipal}
        </ThemedText>
      </Pressable>
      <Pressable
        style={styles.botonSecundario}
        onPress={onReiniciar}
        accessibilityLabel="Reiniciar temporizador"
        accessibilityRole="button"
      >
        <ThemedText type="smallBold" style={styles.textoBoton}>
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
    paddingBottom: Spacing.five,
  },
  botonPrincipal: {
    backgroundColor: '#3C9FFE',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.four,
    minWidth: 120,
    alignItems: 'center',
  },
  botonSecundario: {
    backgroundColor: '#E0E1E6',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.four,
    minWidth: 120,
    alignItems: 'center',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
