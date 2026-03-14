import { Platform } from 'react-native';

// ─── Brand ───────────────────────────────────────────────
export const brand = {
  violet: '#7C3AED',
  cyan: '#06B6D4',
  cyanDark: '#0891B2',
  gradientStart: '#7C3AED',
  gradientEnd: '#06B6D4',
} as const;

// ─── Dark Theme Colors ──────────────────────────────────
export const darkColors = {
  bgPrimary: '#09090B',
  bgSecondary: '#18181B',
  bgTertiary: '#27272A',

  surfaceDefault: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceActive: 'rgba(255,255,255,0.12)',
  surfaceElevated: 'rgba(39,39,42,0.90)',
  surfaceGlass: 'rgba(255,255,255,0.05)',

  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textPlaceholder: '#52525B',

  accentPrimary: brand.violet,
  accentSecondary: brand.cyan,
  accentSuccess: '#10B981',
  accentWarning: '#F59E0B',
  accentError: '#EF4444',

  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.10)',
  borderFocus: 'rgba(124,58,237,0.5)',

  separator: 'rgba(255,255,255,0.06)',

  bubbleSentBg: 'rgba(124,58,237,0.15)',
  bubbleSentBorder: 'rgba(124,58,237,0.25)',
  bubbleReceivedBg: 'rgba(255,255,255,0.05)',
  bubbleReceivedBorder: 'rgba(255,255,255,0.08)',
} as const;

// ─── Light Theme Colors ─────────────────────────────────
export const lightColors = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F4F4F5',
  bgTertiary: '#E4E4E7',

  surfaceDefault: 'rgba(0,0,0,0.02)',
  surfaceHover: 'rgba(0,0,0,0.04)',
  surfaceActive: 'rgba(0,0,0,0.06)',
  surfaceElevated: 'rgba(255,255,255,0.95)',
  surfaceGlass: 'rgba(255,255,255,0.70)',

  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#71717A',
  textPlaceholder: '#A1A1AA',

  accentPrimary: brand.violet,
  accentSecondary: brand.cyanDark,
  accentSuccess: '#059669',
  accentWarning: '#D97706',
  accentError: '#DC2626',

  borderSubtle: 'rgba(0,0,0,0.04)',
  borderDefault: 'rgba(0,0,0,0.08)',
  borderFocus: 'rgba(124,58,237,0.4)',

  separator: 'rgba(0,0,0,0.06)',

  bubbleSentBg: 'rgba(124,58,237,0.08)',
  bubbleSentBorder: 'rgba(124,58,237,0.15)',
  bubbleReceivedBg: 'rgba(0,0,0,0.03)',
  bubbleReceivedBorder: 'rgba(0,0,0,0.06)',
} as const;

export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

// ─── Spacing (4px base grid) ────────────────────────────
export const spacing = {
  '2': 2,
  '4': 4,
  '6': 6,
  '8': 8,
  '12': 12,
  '16': 16,
  '20': 20,
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
  '64': 64,
} as const;

// ─── Border Radius ──────────────────────────────────────
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
  bubbleSent: {
    topLeft: 20,
    topRight: 20,
    bottomLeft: 20,
    bottomRight: 6,
  },
  bubbleReceived: {
    topLeft: 20,
    topRight: 20,
    bottomLeft: 6,
    bottomRight: 20,
  },
} as const;

// ─── Shadows ────────────────────────────────────────────
type ShadowValue = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const makeShadow = (
  color: string,
  offsetH: number,
  opacity: number,
  blur: number,
  elevation: number,
): ShadowValue => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetH },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

export const shadowsDark = {
  sm: makeShadow('#7C3AED', 0, 0.10, 8, 2),
  md: makeShadow('#7C3AED', 4, 0.15, 16, 4),
  lg: makeShadow('#7C3AED', 8, 0.20, 32, 8),
  card: makeShadow('#000000', 8, 0.35, 24, 12),
} as const;

export const shadowsLight = {
  sm: makeShadow('#000000', 1, 0.05, 4, 2),
  md: makeShadow('#000000', 4, 0.08, 12, 4),
  lg: makeShadow('#000000', 8, 0.12, 24, 8),
  card: makeShadow('#000000', 4, 0.06, 16, 12),
} as const;

export type ThemeShadows = typeof shadowsDark;

// ─── Avatar Sizes ───────────────────────────────────────
export const avatarSize = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 60,
  xl: 80,
  '2xl': 120,
} as const;

// ─── Button Heights ─────────────────────────────────────
export const buttonHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

// ─── Icon Sizes ─────────────────────────────────────────
export const iconSize = {
  compact: 20,
  standard: 24,
  large: 28,
} as const;
