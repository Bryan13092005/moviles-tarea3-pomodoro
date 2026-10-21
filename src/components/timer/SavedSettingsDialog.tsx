/**
 * Diálogo de confirmación tras guardar los ajustes (RF-04).
 * Sustituye a la alerta nativa y muestra un resumen de los tiempos guardados.
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, TouchMinWidth } from '@/constants/theme';

export type SavedSettingsDialogProps = {
  visible: boolean;
  /** Valores guardados en minutos (cicloPomodoros en unidades). */
  estudio: number;
  descansoCorto: number;
  descansoLargo: number;
  cicloPomodoros: number;
  onAceptar: () => void;
};

export function SavedSettingsDialog({
  visible,
  estudio,
  descansoCorto,
  descansoLargo,
  cicloPomodoros,
  onAceptar,
}: SavedSettingsDialogProps) {
  const theme = useTheme();

  const filas: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Estudio', valor: `${estudio} min` },
    { etiqueta: 'Descanso corto', valor: `${descansoCorto} min` },
    { etiqueta: 'Descanso largo', valor: `${descansoLargo} min` },
    { etiqueta: 'Pomodoros por ciclo', valor: `${cicloPomodoros}` },
  ];

  return (
    <Modal transparent visible={visible} onRequestClose={onAceptar}>
      <ThemedView style={[styles.overlay, { backgroundColor: theme.backdrop }]}>
        <ThemedView type="surface" style={styles.card}>
          <View style={[styles.icono, { backgroundColor: theme.primary }]}>
            <ThemedText type="subtitle" style={styles.check} themeColor="primaryText">
              ✓
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.titulo} themeColor="surfaceText">
            Tiempos actualizados
          </ThemedText>

          <View style={[styles.resumen, { borderColor: theme.border }]}>
            {filas.map((fila, i) => (
              <View
                key={fila.etiqueta}
                style={[
                  styles.fila,
                  i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                ]}
              >
                <ThemedText type="default" style={styles.etiqueta} themeColor="surfaceText">
                  {fila.etiqueta}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.valor} themeColor="surfaceText">
                  {fila.valor}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText type="small" style={styles.nota} themeColor="textSecondary">
            Se aplicarán a la próxima iteración de cada fase.
          </ThemedText>

          <Pressable
            style={[styles.boton, { backgroundColor: theme.primary }]}
            onPress={onAceptar}
            accessibilityRole="button"
            accessibilityLabel="Aceptar"
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
    padding: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    width: '90%',
    maxWidth: 420,
    alignItems: 'center',
  },
  icono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  check: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    marginBottom: Spacing.three,
  },
  resumen: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two + Spacing.one,
    gap: Spacing.two,
  },
  etiqueta: {
    fontSize: 14,
    flexShrink: 1,
  },
  valor: {
    fontSize: 14,
    fontWeight: '700',
  },
  nota: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  boton: {
    width: '100%',
    minWidth: TouchMinWidth,
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    textAlign: 'center',
  },
});
