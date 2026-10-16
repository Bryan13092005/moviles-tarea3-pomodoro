import { Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmDialog } from '@/components/timer/AlarmDialog';
import { ConfirmResetDialog } from '@/components/timer/ConfirmResetDialog';
import { PermissionBanner } from '@/components/timer/PermissionBanner';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTimer } from '@/hooks/useTimer';

export default function HomeScreen() {
  const {
    state,
    tiempoMostrar,
    alarmaActiva,
    permisoConcedido,
    mostrarBannerPermiso,
    mensajePermiso,
    iniciar,
    pausar,
    reanudar,
    solicitarReinicio,
    detenerAlarma,
    solicitarPermiso,
  } = useTimer();

  const [mostrarConfirmacionReinicio, setMostrarConfirmacionReinicio] =
    useState(false);

  const estaCorriendo = state.status === 'corriendo';
  const estaPausado = state.status === 'pausado';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {mostrarBannerPermiso && permisoConcedido === false && (
          <PermissionBanner
            mensaje={mensajePermiso}
            onHabilitar={solicitarPermiso}
            onCerrar={() => {
              // No navega; solo oculta el banner. El usuario podrá volver a
              // solicitar el permiso al intentar iniciar/reanudar.
            }}
          />
        )}
        <TimerDisplay
          state={state}
          tiempoMostrar={tiempoMostrar}
        />
        <TimerControls
          estaCorriendo={estaCorriendo}
          estaPausado={estaPausado}
          onIniciarPausar={
            estaCorriendo || estaPausado
              ? estaCorriendo
                ? pausar
                : reanudar
              : iniciar
          }
          onReiniciar={() => setMostrarConfirmacionReinicio(true)}
        />
        <ConfirmResetDialog
          visible={mostrarConfirmacionReinicio}
          onAceptar={() => {
            setMostrarConfirmacionReinicio(false);
            solicitarReinicio(true);
          }}
          onCancelar={() => setMostrarConfirmacionReinicio(false)}
        />
        <AlarmDialog
          visible={alarmaActiva}
          onAceptar={() => {
            detenerAlarma();
          }}
        />
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
