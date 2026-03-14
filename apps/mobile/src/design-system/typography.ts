import { TextStyle } from 'react-native';

// ─── Font Families ──────────────────────────────────────
export const fontFamily = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
  mono: 'JetBrainsMono-Regular',
} as const;

// ─── Type Scale ─────────────────────────────────────────
export const typography = {
  displayXl: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamily.extrabold,
    letterSpacing: -1.0,
  },
  displayLg: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fontFamily.semibold,
    letterSpacing: -0.2,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamily.medium,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.2,
  },
  mono: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fontFamily.mono,
    letterSpacing: 0.3,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
