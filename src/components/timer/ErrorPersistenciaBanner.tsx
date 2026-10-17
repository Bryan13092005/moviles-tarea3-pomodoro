/**
 * Banner no bloqueante que muestra el motivo de un fallo de persistencia
 * y permite cerrarlo (RF-05). No interrumpe el uso de la aplicación.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ErrorPersistenciaBannerProps = {
  /** Motivo del fallo de almacenamiento. */
  mensaje: string;
  /** Acción para cerrar el banner. */
  onCerrar: () => void;
};

export function ErrorPersistenciaBanner({
  mensaje,
  onCerrar,
}: ErrorPersistenciaBannerProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="small" style={styles.mensaje}>
        Error al guardar: {mensaje}
      </ThemedText>
      <View style={styles.botonCerrarContenedor}>
        <Pressable style={styles.botonCerrar} onPress={onCerrar}>
          <ThemedText type="smallBold" style={styles.textoBotonCerrar}>
            Cerrar
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Spacing.four,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  mensaje: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  botonCerrarContenedor: {
    alignItems: 'center',
  },
  botonCerrar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: '#E0E1E6',
    alignItems: 'center',
  },
  textoBotonCerrar: {
    textAlign: 'center',
  },
});
