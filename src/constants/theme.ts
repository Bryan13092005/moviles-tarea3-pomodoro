/**
 * Paleta institucional de la aplicación (skill: estilos-colores).
 * Fuente: Guía de Estilo Visual y Marca de la Academia Cotopaxi.
 *
 * Solo se usan los colores definidos en la guía. Cada rol semántico
 * se resuelve a un color de paleta según el tema (claro / oscuro).
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Colores base de la paleta institucional. */
export const Palette = {
  /** Azul Marino Profundo — encabezado y barra superior (texto #FFFFFF). */
  navyDeep: '#0E1326',
  /** Azul Marino Institucional — fondo de pantalla principal (texto #FFFFFF). */
  navyInstitutional: '#161D3A',
  /** Dorado Académico / Sol — botón primario y acento de tiempo (texto #0E1326). */
  goldAcademic: '#D4A017',
  /** Dorado Brillante — destacados, botones hover y estados activos (texto #0E1326). */
  goldBright: '#E5B83B',
  /** Blanco Puro — tarjetas y contenedores claros (texto #161D3A). */
  white: '#FFFFFF',
  /** Texto secundario sobre blanco. */
  textSecondary: '#5a6e82',
  /** Bordes y elementos inactivos. Nunca como color de texto principal. */
  border: '#b5bbc8',
} as const;

/**
 * Colores semánticos por tema.
 * Los valores de cada clave son siempre colores de `Palette` (o un
 * overlay derivado de un color de paleta para fondos de modal).
 */
export const Colors = {
  light: {
    background: Palette.white,        // fondo de pantalla principal
    surface: Palette.white,           // tarjetas y contenedores claros
    surfaceText: Palette.navyInstitutional, // texto sobre tarjetas blancas
    header: Palette.navyDeep,         // encabezado y barra superior
    headerText: Palette.white,        // texto en encabezado
    text: Palette.navyInstitutional,  // texto principal sobre fondo claro
    textSecondary: Palette.textSecondary, // texto secundario sobre blanco
    primary: Palette.goldAcademic,    // botón primario y acento de tiempo
    primaryText: Palette.navyDeep,    // texto sobre botón primario
    active: Palette.goldBright,       // destacados y estados activos
    activeText: Palette.navyDeep,     // texto sobre estado activo
    border: Palette.border,           // bordes y elementos inactivos
    backdrop: 'rgba(14, 19, 38, 0.4)', // overlay de modales (derivado de #0E1326)
  },
  dark: {
    background: Palette.navyInstitutional, // fondo de pantalla principal
    surface: Palette.white,           // tarjetas y contenedores claros
    surfaceText: Palette.navyInstitutional, // texto sobre tarjetas blancas
    header: Palette.navyDeep,         // encabezado y barra superior
    headerText: Palette.white,        // texto en encabezado
    text: Palette.white,              // texto principal sobre fondo oscuro
    textSecondary: Palette.textSecondary, // texto secundario suave sobre oscuro
    primary: Palette.goldAcademic,    // botón primario y acento de tiempo
    primaryText: Palette.navyDeep,    // texto sobre botón primario
    active: Palette.goldBright,       // destacados y estados activos
    activeText: Palette.navyDeep,     // texto sobre estado activo
    border: Palette.border,           // bordes y elementos inactivos
    backdrop: 'rgba(14, 19, 38, 0.6)', // overlay de modales (derivado de #0E1326)
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: undefined,
    serif: undefined,
    rounded: undefined,
    mono: undefined,
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Altura mínima de un objetivo táctil (accesibilidad). */
export const TouchMinHeight = 48;
export const TouchMinWidth = 48;
