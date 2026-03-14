import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import {
  darkColors,
  lightColors,
  shadowsDark,
  shadowsLight,
  brand,
  type ThemeColors,
  type ThemeShadows,
} from './tokens';

// ─── Types ──────────────────────────────────────────────
export type ThemeMode = 'dark' | 'light' | 'auto';
export type ResolvedTheme = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colors: ThemeColors;
  shadows: ThemeShadows;
  brand: typeof brand;
  isDark: boolean;
}

// ─── Store ──────────────────────────────────────────────
interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  setSystemScheme: (scheme: ColorSchemeName) => void;
}

function resolveTheme(mode: ThemeMode, system: ColorSchemeName): ResolvedTheme {
  if (mode === 'auto') {
    return system === 'light' ? 'light' : 'dark';
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'auto',
  resolved: resolveTheme('auto', Appearance.getColorScheme()),
  setMode: (mode) =>
    set({
      mode,
      resolved: resolveTheme(mode, Appearance.getColorScheme()),
    }),
  setSystemScheme: (scheme) => {
    const { mode } = get();
    if (mode === 'auto') {
      set({ resolved: resolveTheme('auto', scheme) });
    }
  },
}));

// ─── Context ────────────────────────────────────────────
const ThemeContext = createContext<Theme | null>(null);

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// ─── Provider ───────────────────────────────────────────
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, resolved, setSystemScheme } = useThemeStore();

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, [setSystemScheme]);

  const theme = useMemo<Theme>(
    () => ({
      mode,
      resolved,
      colors: resolved === 'dark' ? darkColors : lightColors,
      shadows: resolved === 'dark' ? shadowsDark : shadowsLight,
      brand,
      isDark: resolved === 'dark',
    }),
    [mode, resolved],
  );

  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}
