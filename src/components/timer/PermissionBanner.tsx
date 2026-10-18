/**
 * Banner contextual que explica la utilidad del permiso de notificaciones
 * antes de solicitarlo al sistema operativo (Constitución §1.3, RNF-02).
 * RF-08, RF-09.
 */

import { StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinHeight } from '@/constants/theme';

export type PermissionBannerProps = {
  mensaje: string;
  onHabilitar: () => void;
  onCerrar: () => void;
};

export function PermissionBanner({
  mensaje,
  onHabilitar,
  onCerrar,
}: PermissionBannerProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="surface"
      style={[styles.container, { borderColor: theme.border }]}
    >
      <ThemedText type="small" style={styles.mensaje} themeColor="surfaceText">
        {mensaje}
      </ThemedText>
      <View style={styles.botones}>
        <Pressable
          style={[
            styles.boton,
            { backgroundColor: theme.primary },
          ]}
          onPress={onHabilitar}
        >
          <ThemedText type="smallBold" style={styles.textoBoton} themeColor="primaryText">
            Habilitar notificaciones
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.botonCerrar,
            { backgroundColor: theme.surface, borderColor: theme.border },
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
    justifyContent: 'space-between',
  },
  boton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    flex: 1,
    marginRight: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchMinHeight,
  },
  botonCerrar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    flex: 1,
    marginLeft: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: TouchMinHeight,
  },
  textoBoton: {
    textAlign: 'center',
  },
});
