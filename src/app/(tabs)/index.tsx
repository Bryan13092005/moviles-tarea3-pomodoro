import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmDialog } from '@/components/timer/AlarmDialog';
import { ConfirmResetDialog } from '@/components/timer/ConfirmResetDialog';
import { ErrorPersistenciaBanner } from '@/components/timer/ErrorPersistenciaBanner';
import { PermissionBanner } from '@/components/timer/PermissionBanner';
import { ReinicioCompletoPomodoro } from '@/components/timer/ReinicioCompletoPomodoro';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTimer } from '@/hooks/useTimer';
import {
  validarCampo,
  RANGOS,
  CONFIG_FABRICA,
  type CampoAjuste,
  type Configuracion,
} from '@/domain/config';

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
    restablecerAjustes,
    configuracion,
    cicloPomodoros,
    guardarAjustes,
    detenerAlarma,
    solicitarPermiso,
    cerrarBannerPermiso,
  } = useTimer();

  const [mostrarConfirmacionReinicio, setMostrarConfirmacionReinicio] =
    useState(false);
  const [mostrarConfirmacionReinicioCompleto, setMostrarConfirmacionReinicioCompleto] =
    useState(false);
  const [mostrarConfirmacionFabrica, setMostrarConfirmacionFabrica] =
    useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const guardadoRef = useRef<Configuracion | null>(null);

  const estaCorriendo = state.status === 'corriendo';
  const estaPausado = state.status === 'pausado';

    const [valoresAjustes, setValoresAjustes] = useState<
    Record<CampoAjuste, string>
  >({
    estudio: String(configuracion.estudio / 60),
    descansoCorto: String(configuracion.descansoCorto / 60),
    descansoLargo: String(configuracion.descansoLargo / 60),
    cicloPomodoros: String(configuracion.cicloPomodoros),
  });

  const [erroresAjustes, setErroresAjustes] = useState<
    Partial<Record<CampoAjuste, string>>
  >({});
  
  const navegarAjustes = useCallback(() => {
    setValoresAjustes({
      estudio: String(configuracion.estudio / 60),
      descansoCorto: String(configuracion.descansoCorto / 60),
      descansoLargo: String(configuracion.descansoLargo / 60),
      cicloPomodoros: String(configuracion.cicloPomodoros),
    });
    setErroresAjustes({});
    setMostrarAjustes(true);
  }, [configuracion]);

  const CAMPOS: CampoAjuste[] = [
    'estudio',
    'descansoCorto',
    'descansoLargo',
    'cicloPomodoros',
  ];

  const LABELS: Record<CampoAjuste, string> = {
    estudio: 'Tiempo de estudio',
    descansoCorto: 'Descanso corto',
    descansoLargo: 'Descanso largo',
    cicloPomodoros: 'Pomodoros por ciclo',
  };



  const hayErroresAjustes = Object.keys(erroresAjustes).length > 0;
  const validoParaGuardarAjustes = !hayErroresAjustes;

  const onCambiarValorAjuste = (campo: CampoAjuste, texto: string) => {
    setValoresAjustes((prev) => ({ ...prev, [campo]: texto }));

    const resultado = validarCampo(campo, texto);
    if (resultado.valido) {
      setErroresAjustes((prev) => {
        const siguiente = { ...prev };
        delete siguiente[campo];
        return siguiente;
      });
    } else {
      setErroresAjustes((prev) => ({
        ...prev,
        [campo]: resultado.mensaje ?? 'valor inválido',
      }));
    }
  };

  const onGuardarAjustes = async () => {
    if (!validoParaGuardarAjustes) {
      return;
    }

    const campos: Partial<Configuracion> = {};
    let invalido = false;

    for (const campo of CAMPOS) {
      const texto = valoresAjustes[campo];
      const resultado = validarCampo(campo, texto);
      if (!resultado.valido) {
        invalido = true;
        setErroresAjustes((prev) => ({
          ...prev,
          [campo]: resultado.mensaje ?? 'valor inválido',
        }));
      } else {
        // El hook recibe minutos (rango RANGOS) y los convierte a segundos.
        campos[campo] = Number(texto);
      }
    }

    if (invalido) {
      return;
    }

    try {
      const guardado = await guardarAjustes(campos);
      guardadoRef.current = guardado;
      setMostrarAjustes(false);
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : String(error);
      Alert.alert('No se pudieron guardar los cambios', mensaje, [{ text: 'Aceptar' }]);
    }
  };

  const onRestablecerAjustes = (aceptar: boolean) => {
    setMostrarConfirmacionFabrica(false);
    void restablecerAjustes(aceptar);
    if (aceptar) {
      setValoresAjustes({
        estudio: String(CONFIG_FABRICA.estudio / 60),
        descansoCorto: String(CONFIG_FABRICA.descansoCorto / 60),
        descansoLargo: String(CONFIG_FABRICA.descansoLargo / 60),
        cicloPomodoros: String(CONFIG_FABRICA.cicloPomodoros),
      });
    }
  };

  const campoInvalidoAjuste = (campo: CampoAjuste) => Boolean(erroresAjustes[campo]);

  const rangoTextoAjuste = (campo: CampoAjuste) => {
    const r = RANGOS[campo];
    return `${r.min}–${r.max} ${r.unidad}`;
  };

  // Alerta de confirmación tras cerrar el modal de ajustes (RF-04).
  // Se dispara cuando el modal se oculta y hay datos guardados pendientes.
  useEffect(() => {
    if (!mostrarAjustes && guardadoRef.current) {
      const guardado = guardadoRef.current;
      guardadoRef.current = null;
      Alert.alert(
        'Tiempos actualizados',
        `Estudio ${guardado.estudio / 60} min, Descanso corto ${guardado.descansoCorto / 60} min, Descanso largo ${guardado.descansoLargo / 60} min, ${guardado.cicloPomodoros} pomodoros por ciclo. Se aplicarán a la próxima iteración de cada fase.`,
        [{ text: 'Aceptar' }],
      );
    }
  }, [mostrarAjustes]);

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
            onCerrar={cerrarBannerPermiso}
          />
        )}
        <TimerDisplay
          state={state}
          tiempoMostrar={tiempoMostrar}
          cicloPomodoros={cicloPomodoros}
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

        <ConfirmResetDialog
          visible={mostrarConfirmacionFabrica}
          titulo="¿Restablecer a valores de fábrica?"
          descripcion={
            'Volverá a estudio 25 min, descanso corto 5 min, descanso largo 15 min y 4 pomodoros por ciclo. Se detendrá el temporizador y se reiniciará el contador de pomodoros.'
          }
          onAceptar={() => onRestablecerAjustes(true)}
          onCancelar={() => onRestablecerAjustes(false)}
        />

        {/* Botones flotantes: Ajustes y Reinicio a fábrica (esquina inferior derecha) */}
        <View style={styles.fabContainer}>
          <Pressable
            style={styles.fabAjustes}
            onPress={navegarAjustes}
            accessibilityLabel="Abrir ajustes de tiempos"
          >
            <ThemedText type="smallBold" style={styles.fabText}>
              ⚙️
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.fabFabrica}
            onPress={() => setMostrarConfirmacionFabrica(true)}
            accessibilityLabel="Restablecer valores de fábrica"
          >
            <ThemedText type="smallBold" style={styles.fabText}>
              🔄
            </ThemedText>
          </Pressable>
        </View>

        {/* Modal de ajustes */}
        <Modal
          transparent
          visible={mostrarAjustes}
          onRequestClose={() => setMostrarAjustes(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={styles.modalCard}>
              <ThemedText type="subtitle" style={styles.modalTitulo}>
                Ajustes del Pomodoro
              </ThemedText>
              <ThemedText type="small" style={styles.modalSubtitulo}>
                Los cambios aplican a la siguiente iteración de cada fase; la
                fase en curso no se altera.
              </ThemedText>

              {CAMPOS.map((campo) => (
                <View key={campo} style={styles.modalCampo}>
                  <ThemedText type="default" style={styles.modalEtiqueta}>
                    {LABELS[campo]}
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.modalInput,
                      campoInvalidoAjuste(campo) && styles.modalInputInvalido,
                    ]}
                    value={valoresAjustes[campo]}
                    onChangeText={(texto) => onCambiarValorAjuste(campo, texto)}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={true}
                  />
                  <ThemedText type="small" style={styles.modalRango}>
                    {rangoTextoAjuste(campo)}
                  </ThemedText>
                  {campoInvalidoAjuste(campo) && (
                    <ThemedText
                      type="small"
                      style={[styles.modalError, { color: '#D32F2F' }]}
                    >
                      {erroresAjustes[campo]}
                    </ThemedText>
                  )}
                </View>
              ))}

              <View style={styles.modalBotones}>
                <Pressable
                  style={[
                    styles.modalBotonGuardar,
                    !validoParaGuardarAjustes && styles.modalBotonDeshabilitado,
                  ]}
                  onPress={onGuardarAjustes}
                  disabled={!validoParaGuardarAjustes}
                >
                  <ThemedText type="smallBold" style={styles.modalTextoBoton}>
                    Guardar
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={styles.modalBotonCerrar}
                  onPress={() => setMostrarAjustes(false)}
                >
                  <ThemedText type="smallBold" style={styles.modalTextoBotonCerrar}>
                    Cerrar
                  </ThemedText>
                </Pressable>
              </View>

              {estaCorriendo || estaPausado ? (
                <ThemedText type="small" style={styles.modalNotaActiva}>
                  El temporizador está {estaCorriendo ? 'corriendo' : 'pausado'}.
                  Los cambios se aplicarán a la próxima iteración de cada fase.
                </ThemedText>
              ) : null}
            </ThemedView>
          </ThemedView>
        </Modal>
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
  fabContainer: {
    position: 'absolute',
    bottom: BottomTabInset + Spacing.four,
    right: Spacing.four,
    gap: Spacing.two,
  },
  fabAjustes: {
    backgroundColor: '#3C9FFE',
    borderRadius: Spacing.four,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 56,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabFabrica: {
    backgroundColor: '#D32F2F',
  },
  fabText: {
    fontSize: 20,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.three,
  },
  modalCard: {
    padding: Spacing.five,
    borderRadius: Spacing.four,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  modalSubtitulo: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  modalCampo: {
    width: '100%',
    gap: Spacing.one,
    alignItems: 'center',
  },
  modalEtiqueta: {
    fontSize: 15,
    fontWeight: 600,
    textAlign: 'center',
    width: '100%',
  },
  modalInput: {
    width: 100,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    textAlign: 'center',
    fontSize: 16,
  },
  modalInputInvalido: {
    borderColor: '#D32F2F',
  },
  modalRango: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalError: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: Spacing.half,
  },
  modalBotones: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    width: '100%',
    marginTop: Spacing.two,
  },
  modalBotonGuardar: {
    backgroundColor: '#2E7D32',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBotonDeshabilitado: {
    backgroundColor: '#9E9E9E',
  },
  modalBotonCerrar: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalTextoBoton: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
  },
  modalTextoBotonCerrar: {
    fontSize: 13,
    fontWeight: 700,
    color: '#000000',
    textAlign: 'center',
  },
  modalNotaActiva: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
