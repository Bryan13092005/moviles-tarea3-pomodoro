import { Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmDialog } from '@/components/timer/AlarmDialog';
import { ConfirmResetDialog } from '@/components/timer/ConfirmResetDialog';
import { ErrorPersistenciaBanner } from '@/components/timer/ErrorPersistenciaBanner';
import { PermissionBanner } from '@/components/timer/PermissionBanner';
import { ReinicioCompletoPomodoro } from '@/components/timer/ReinicioCompletoPomodoro';
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
    errorPersistencia,
    iniciar,
    pausar,
    reanudar,
    solicitarReinicio,
    reiniciarCompleto,
    detenerAlarma,
    solicitarPermiso,
  } = useTimer();

  const [mostrarConfirmacionReinicio, setMostrarConfirmacionReinicio] =
    useState(false);
  const [mostrarConfirmacionReinicioCompleto, setMostrarConfirmacionReinicioCompleto] =
    useState(false);

  const estaCorriendo = state.status === 'corriendo';
  const estaPausado = state.status === 'pausado';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {errorPersistencia && (
          <ErrorPersistenciaBanner
            mensaje={errorPersistencia}
            onCerrar={() => {
              // Se limpia desde el hook al persistir correctamente o al reiniciar.
            }}
          />
        )}
        {mostrarBannerPermiso && permisoConcedido === false && (
          <PermissionBanner
            mensaje={mensajePermiso}
            onHabilitar={solicitarPermiso}
            onCerrar={() => {
              // No navega; solo oculta el banner.
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
        <ReinicioCompletoPomodoro
          onReiniciarCompleto={() =>
            setMostrarConfirmacionReinicioCompleto(true)
          }
        />
        <ConfirmResetDialog
          visible={mostrarConfirmacionReinicio}
          onAceptar={() => {
            setMostrarConfirmacionReinicio(false);
            solicitarReinicio(true);
          }}
          onCancelar={() => setMostrarConfirmacionReinicio(false)}
        />
        <ConfirmResetDialog
          visible={mostrarConfirmacionReinicioCompleto}
          titulo="¿Reiniciar completamente el pomodoro?"
          descripcion={
            'Volverá a la fase de Estudio con 25:00 y se reiniciará el contador de pomodoros.'
          }
          onAceptar={() => {
            setMostrarConfirmacionReinicioCompleto(false);
            reiniciarCompleto();
          }}
          onCancelar={() => setMostrarConfirmacionReinicioCompleto(false)}
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
