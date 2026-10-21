/**
 * Anillo circular de progreso del cronómetro. Se llena conforme transcurre el
 * tiempo de la fase. Implementado con vistas (sin dependencias nativas extra):
 * dos mitades recortadas cuyo borde coloreado se rota según el avance.
 */

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type TimerRingProps = {
  /** Avance de 0 a 1 (0 = anillo vacío, 1 = anillo completo). */
  progreso: number;
  size?: number;
  grosor?: number;
  children?: ReactNode;
};

export function TimerRing({
  progreso,
  size = 260,
  grosor = 14,
  children,
}: TimerRingProps) {
  const theme = useTheme();
  const p = Math.min(Math.max(Number.isFinite(progreso) ? progreso : 0, 0), 1);
  const grados = p * 360;
  const mitad = size / 2;

  const circulo = {
    position: 'absolute' as const,
    top: 0,
    width: size,
    height: size,
    borderRadius: mitad,
    borderWidth: grosor,
    borderColor: 'transparent',
    borderTopColor: theme.primary,
    borderRightColor: theme.primary,
  };

  const rotDerecha = Math.min(grados, 180) - 135;
  const rotIzquierda = Math.max(grados, 180) - 135;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityLabel="Progreso de la fase actual"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
    >
      <View
        style={[
          styles.pista,
          {
            width: size,
            height: size,
            borderRadius: mitad,
            borderWidth: grosor,
            borderColor: theme.border,
          },
        ]}
      />
      <View style={[styles.mitad, { left: mitad, width: mitad, height: size }]}>
        <View
          style={[circulo, { left: -mitad, transform: [{ rotate: `${rotDerecha}deg` }] }]}
        />
      </View>
      <View style={[styles.mitad, { left: 0, width: mitad, height: size }]}>
        <View
          style={[circulo, { left: 0, transform: [{ rotate: `${rotIzquierda}deg` }] }]}
        />
      </View>
      <View style={styles.centro}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pista: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mitad: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
