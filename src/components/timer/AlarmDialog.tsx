/**
 * Diálogo de alarma al finalizar una fase.
 * Tocar Aceptar detiene la alarma (RF-11, Decisión 9).
 */

import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type AlarmDialogProps = {
  visible: boolean;
  onAceptar: () => void;
};

export function AlarmDialog({ visible, onAceptar }: AlarmDialogProps) {
  return (
    <Modal transparent visible={visible} onRequestClose={onAceptar}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.titulo}>
            ¡Fase finalizada!
          </ThemedText>
          <ThemedText type="default" style={styles.descripcion}>
            El tiempo de esta fase se ha completado.
          </ThemedText>
          <Pressable style={styles.boton} onPress={onAceptar}>
            <ThemedText type="smallBold" style={styles.textoBoton}>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
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
    backgroundColor: '#3C9FFE',
    alignItems: 'center',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
