/**
 * Banner contextual que explica la utilidad del permiso de notificaciones
 * antes de solicitarlo al sistema operativo (Constitución §1.3, RNF-02).
 * RF-08, RF-09.
 */

import { StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

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
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="small" style={styles.mensaje}>
        {mensaje}
      </ThemedText>
      <View style={styles.botones}>
        <Pressable style={styles.boton} onPress={onHabilitar}>
          <ThemedText type="smallBold" style={styles.textoBoton}>
            Habilitar notificaciones
          </ThemedText>
        </Pressable>
        <Pressable style={styles.botonCerrar} onPress={onCerrar}>
          <ThemedText type="smallBold" style={styles.textoBoton}>
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
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: '#3C9FFE',
    flex: 1,
    marginRight: Spacing.one,
    alignItems: 'center',
  },
  botonCerrar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: '#E0E1E6',
    flex: 1,
    marginLeft: Spacing.one,
    alignItems: 'center',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
