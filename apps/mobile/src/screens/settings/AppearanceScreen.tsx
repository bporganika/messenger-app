import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../design-system';
import { useThemeStore } from '../../design-system/theme';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';

const MODES = [
  { key: 'light' as const, label: 'Light', icon: '☀️' },
  { key: 'dark' as const, label: 'Dark', icon: '🌙' },
  { key: 'auto' as const, label: 'Auto', icon: '📱' },
];

export function AppearanceScreen() {
  const { colors } = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Text
        variant="caption"
        color={colors.textTertiary}
        style={styles.sectionLabel}>
        Theme
      </Text>

      <View style={styles.row}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => {
              haptics.buttonPress();
              setMode(m.key);
            }}
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceDefault,
                borderColor:
                  mode === m.key ? colors.accentPrimary : colors.borderDefault,
                borderWidth: mode === m.key ? 2 : 1,
              },
            ]}>
            <Text variant="displayLg" align="center">
              {m.icon}
            </Text>
            <Text
              variant="bodySm"
              align="center"
              color={
                mode === m.key ? colors.accentPrimary : colors.textPrimary
              }>
              {m.label}
            </Text>
            {mode === m.key && (
              <View
                style={[styles.dot, { backgroundColor: colors.accentPrimary }]}
              />
            )}
          </Pressable>
        ))}
      </View>

      <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
        Auto follows your device settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['16'] },
  sectionLabel: {
    marginHorizontal: spacing['24'],
    marginBottom: spacing['12'],
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing['16'],
    gap: spacing['12'],
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing['20'],
    borderRadius: radius.lg,
    gap: spacing['8'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: spacing['4'],
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
  },
});
