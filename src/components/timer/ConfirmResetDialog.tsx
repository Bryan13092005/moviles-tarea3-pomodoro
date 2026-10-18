/**
 * Diálogo de confirmación de reinicio: Aceptar / Cancelar.
 * Cancelar conserva exactamente el tiempo y estado previo (RF-07).
 * Aceptar restaura la duración completa y deja el temporizador detenido (RF-05, RF-06).
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinHeight, TouchMinWidth } from '@/constants/theme';

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
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} onRequestClose={onCancelar}>
      <ThemedView style={styles.overlay}>
        <ThemedView type="surface" style={styles.card}>
          <ThemedText type="subtitle" style={styles.titulo} themeColor="surfaceText">
            {titulo ?? '¿Reiniciar el temporizador?'}
          </ThemedText>
          <ThemedText type="default" style={styles.descripcion} themeColor="textSecondary">
            {descripcion ??
              'Volverá a la duración completa de la fase actual y quedará detenido.'}
          </ThemedText>
          <View style={styles.botones}>
            <Pressable
              style={[
                styles.boton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
              onPress={onCancelar}
            >
              <ThemedText type="smallBold" style={styles.textoBoton} themeColor="surfaceText">
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.botonAceptar,
                { backgroundColor: theme.primary },
              ]}
              onPress={onAceptar}
            >
              <ThemedText type="smallBold" style={styles.textoBoton} themeColor="primaryText">
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
    backgroundColor: 'rgba(14, 19, 38, 0.6)',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    width: '90%',
    maxWidth: 420,
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
    width: '100%',
    gap: Spacing.three,
  },
  boton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    minWidth: TouchMinWidth,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
  },
  botonAceptar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    minWidth: TouchMinWidth,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textoBoton: {
    textAlign: 'center',
  },
});
