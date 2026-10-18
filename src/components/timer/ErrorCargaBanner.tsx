/**
 * Banner de error de sistema (no comercial) que muestra el motivo de una
 * falla de lectura del almacenamiento al iniciar la aplicación.
 * Permite reintentar la lectura o cerrar el banner (RF-04, RF-05, RF-10).
 * No es un indicador de modo offline ni un anuncio.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export type ErrorCargaBannerProps = {
  /** Motivo de la falla de lectura del almacenamiento. */
  mensaje: string;
  /** Vuelve a intentar cargar configuración y estado del almacenamiento. */
  onReintentar: () => void;
  /** Oculta el banner (al relanzar la app se reintenta la lectura sola, RF-05). */
  onCerrar: () => void;
};

export function ErrorCargaBanner({
  mensaje,
  onReintentar,
  onCerrar,
}: ErrorCargaBannerProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="surface"
      style={[styles.container, { borderColor: theme.border }]}
    >
      <ThemedText type="small" style={styles.mensaje} themeColor="surfaceText">
        Error al leer el almacenamiento: {mensaje}
      </ThemedText>
      <View style={styles.botones}>
        <Pressable
          style={[
            styles.botonReintentar,
            { backgroundColor: theme.primary },
          ]}
          onPress={onReintentar}
        >
          <ThemedText type="smallBold" style={styles.textoBoton} themeColor="primaryText">
            Reintentar
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.botonCerrar,
            { borderColor: theme.border },
          ]}
          onPress={onCerrar}
        >
          <ThemedText type="smallBold" style={styles.textoBoton} themeColor="surfaceText">
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
  botones: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  botonReintentar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
    minWidth: 88,
  },
  botonCerrar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 88,
  },
  textoBoton: {
    textAlign: 'center',
  },
});
