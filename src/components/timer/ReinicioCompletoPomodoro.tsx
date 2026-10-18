/**
 * Botón siempre visible "Reinicio Completo de Pomodoro".
 * Al presionarlo se abre la confirmación de reinicio completo (RF-08, RF-09).
 * Objetivo táctil ≥44×44, accesibilidad y textos en español.
 * Constitución §2.1 (confirmación explícita para reinicios).
 */

import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinHeight, TouchMinWidth } from '@/constants/theme';

export type ReinicioCompletoPomodoroProps = {
  /** Acción que abre la confirmación de reinicio completo de pomodoro. */
  onReiniciarCompleto: () => void;
};

export function ReinicioCompletoPomodoro({
  onReiniciarCompleto,
}: ReinicioCompletoPomodoroProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.boton,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={onReiniciarCompleto}
      accessibilityLabel="Reinicio completo de pomodoro"
      accessibilityRole="button"
    >
      <ThemedText type="smallBold" style={styles.textoBoton} themeColor="surfaceText">
        Reinicio Completo de Pomodoro
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: 12,
    minWidth: TouchMinWidth,
    minHeight: TouchMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: '100%',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
