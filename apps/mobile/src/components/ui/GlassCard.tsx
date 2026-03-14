import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../design-system';
import { radius, spacing } from '../../design-system/tokens';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
}

export function GlassCard({
  children,
  style,
  blurAmount = 20,
}: GlassCardProps) {
  const { colors, isDark, shadows } = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, shadows.card, style]}>
        <BlurView
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={blurAmount}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.overlay,
            { backgroundColor: colors.surfaceGlass },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.content,
        {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        },
        shadows.card,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: spacing['20'],
  },
});
