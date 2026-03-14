import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { useThemeStore } from '../../design-system/theme';
import { springs } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';

interface ThemeOption {
  key: 'light' | 'dark' | 'auto';
  label: string;
  previewBg: string;
  previewFg: string;
  previewAccent: string;
}

const OPTIONS: ThemeOption[] = [
  { key: 'light', label: 'Light', previewBg: '#FFFFFF', previewFg: '#09090B', previewAccent: '#7C3AED' },
  { key: 'dark', label: 'Dark', previewBg: '#09090B', previewFg: '#FAFAFA', previewAccent: '#7C3AED' },
  { key: 'auto', label: 'Auto', previewBg: '#09090B', previewFg: '#FAFAFA', previewAccent: '#06B6D4' },
];

export function AppearanceScreen() {
  const { colors } = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          THEME
        </Text>
        <View style={styles.cardsRow}>
          {OPTIONS.map((opt) => (
            <ThemeCard
              key={opt.key}
              option={opt}
              isSelected={mode === opt.key}
              onPress={() => {
                haptics.buttonPress();
                setMode(opt.key);
              }}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.springify().delay(100)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
          {mode === 'auto'
            ? 'Theme follows your device settings'
            : `${mode === 'dark' ? 'Dark' : 'Light'} theme is always active`}
        </Text>
      </Animated.View>
    </View>
  );
}

function ThemeCard({
  option,
  isSelected,
  onPress,
}: {
  option: ThemeOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95, springs.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
      onPress={onPress}
      style={styles.cardPressable}>
      <Animated.View
        style={[
          styles.card,
          animStyle,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: isSelected ? colors.accentPrimary : colors.borderDefault,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}>
        {/* Mini phone preview */}
        <View style={[styles.preview, { backgroundColor: option.previewBg, borderColor: option.previewFg + '20' }]}>
          <View style={[styles.previewBar, { backgroundColor: option.previewFg + '15' }]} />
          <View style={[styles.previewLine, { backgroundColor: option.previewAccent, width: '60%' }]} />
          <View style={[styles.previewLine, { backgroundColor: option.previewFg + '20', width: '80%' }]} />
          <View style={[styles.previewLine, { backgroundColor: option.previewFg + '12', width: '50%' }]} />
        </View>

        {/* Icon */}
        {option.key === 'light' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={isSelected ? colors.accentPrimary : colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" />
            <Path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke={isSelected ? colors.accentPrimary : colors.textSecondary} strokeWidth={1.5} />
          </Svg>
        )}
        {option.key === 'dark' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={isSelected ? colors.accentPrimary : colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        {option.key === 'auto' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="2" width="14" height="20" rx="2" stroke={isSelected ? colors.accentPrimary : colors.textSecondary} strokeWidth={1.5} />
            <Path d="M12 18h.01" stroke={isSelected ? colors.accentPrimary : colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        )}

        <Text
          variant="bodySm"
          align="center"
          color={isSelected ? colors.accentPrimary : colors.textPrimary}>
          {option.label}
        </Text>

        {isSelected && (
          <View style={[styles.dot, { backgroundColor: colors.accentPrimary }]} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['8'] },
  sectionLabel: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
    marginBottom: spacing['12'],
    letterSpacing: 0.8,
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['16'],
    gap: spacing['12'],
  },
  cardPressable: { flex: 1 },
  card: {
    alignItems: 'center',
    paddingTop: spacing['12'],
    paddingBottom: spacing['16'],
    borderRadius: radius.lg,
    gap: spacing['8'],
  },
  preview: {
    width: '70%',
    aspectRatio: 0.6,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing['6'],
    gap: spacing['4'],
    marginBottom: spacing['4'],
  },
  previewBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing['4'],
  },
  previewLine: {
    height: 3,
    borderRadius: 1.5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
  },
});
