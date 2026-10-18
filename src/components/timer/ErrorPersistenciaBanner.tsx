/**
 * Banner no bloqueante que muestra el motivo de un fallo de persistencia
 * y permite cerrarlo (RF-05). No interrumpe el uso de la aplicación.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();

  return (
    <ThemedView
      type="surface"
      style={[styles.container, { borderColor: theme.border }]}
    >
      <ThemedText type="small" style={styles.mensaje} themeColor="surfaceText">
        Error al guardar: {mensaje}
      </ThemedText>
      <View style={styles.botonCerrarContenedor}>
        <Pressable
          style={[
            styles.botonCerrar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={onCerrar}
        >
          <ThemedText type="smallBold" style={styles.textoBotonCerrar} themeColor="surfaceText">
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
    borderRadius: 12,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderWidth: 1,
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
    alignItems: 'center',
    borderWidth: 1,
  },
  textoBotonCerrar: {
    textAlign: 'center',
  },
});
