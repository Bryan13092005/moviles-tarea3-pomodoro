/**
 * Diálogo de alarma al finalizar una fase.
 * Tocar Aceptar detiene la alarma (RF-11, Decisión 9).
 */

import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinHeight, TouchMinWidth } from '@/constants/theme';

export type AlarmDialogProps = {
  visible: boolean;
  onAceptar: () => void;
};

export function AlarmDialog({ visible, onAceptar }: AlarmDialogProps) {
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} onRequestClose={onAceptar}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="surface" style={styles.card}>
          <ThemedText type="subtitle" style={styles.titulo} themeColor="surfaceText">
            ¡Fase finalizada!
          </ThemedText>
          <ThemedText type="default" style={styles.descripcion} themeColor="textSecondary">
            El tiempo de esta fase se ha completado.
          </ThemedText>
          <Pressable
            style={[
              styles.boton,
              { backgroundColor: theme.primary },
            ]}
            onPress={onAceptar}
          >
            <ThemedText type="smallBold" style={styles.textoBoton} themeColor="primaryText">
              Aceptar
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 19, 38, 0.6)',
  },
  card: {
    padding: Spacing.five,
    borderRadius: 16,
    minWidth: 280,
    alignItems: 'center',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  descripcion: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  boton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    minWidth: TouchMinWidth,
    minHeight: TouchMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
