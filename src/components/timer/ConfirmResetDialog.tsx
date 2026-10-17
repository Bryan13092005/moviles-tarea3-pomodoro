/**
 * Diálogo de confirmación de reinicio: Aceptar / Cancelar.
 * Cancelar conserva exactamente el tiempo y estado previo (RF-07).
 * Aceptar restaura la duración completa y deja el temporizador detenido (RF-05, RF-06).
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ConfirmResetDialogProps = {
  visible: boolean;
  onAceptar: () => void;
  onCancelar: () => void;
  /** Título opcional para personalizar el diálogo (p. ej. reinicio completo). */
  titulo?: string;
  /** Descripción opcional para personalizar el diálogo. */
  descripcion?: string;
};

export function ConfirmResetDialog({
  visible,
  onAceptar,
  onCancelar,
  titulo,
  descripcion,
}: ConfirmResetDialogProps) {
  return (
    <Modal transparent visible={visible} onRequestClose={onCancelar}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.titulo}>
            {titulo ?? '¿Reiniciar el temporizador?'}
          </ThemedText>
          <ThemedText type="default" style={styles.descripcion}>
            {descripcion ??
              'Volverá a la duración completa de la fase actual y quedará detenido.'}
          </ThemedText>
          <View style={styles.botones}>
            <Pressable style={styles.boton} onPress={onCancelar}>
              <ThemedText type="smallBold" style={styles.textoBoton}>
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable style={styles.botonAceptar} onPress={onAceptar}>
              <ThemedText type="smallBold" style={styles.textoBoton}>
                Aceptar
              </ThemedText>
            </Pressable>
          </View>
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
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  boton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.one,
  },
  botonAceptar: {
    backgroundColor: '#3C9FFE',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
