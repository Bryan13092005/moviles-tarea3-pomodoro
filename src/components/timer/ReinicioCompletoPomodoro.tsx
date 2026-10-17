/**
 * Botón siempre visible "Reinicio Completo de Pomodoro".
 * Al presionarlo se abre la confirmación de reinicio completo (RF-08, RF-09).
 * Objetivo táctil ≥44×44, accesibilidad y textos en español.
 * Constitución §2.1 (confirmación explícita para reinicios).
 */

import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ReinicioCompletoPomodoroProps = {
  /** Acción que abre la confirmación de reinicio completo de pomodoro. */
  onReiniciarCompleto: () => void;
};

export function ReinicioCompletoPomodoro({
  onReiniciarCompleto,
}: ReinicioCompletoPomodoroProps) {
  return (
    <Pressable
      style={styles.boton}
      onPress={onReiniciarCompleto}
      accessibilityLabel="Reinicio completo de pomodoro"
      accessibilityRole="button"
    >
      <ThemedText type="smallBold" style={styles.textoBoton}>
        Reinicio Completo de Pomodoro
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: '#3C9FFE',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.four,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
});
