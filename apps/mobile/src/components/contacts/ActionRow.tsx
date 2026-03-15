import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui';

// ─── Types ──────────────────────────────────────────────
export interface ActionRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  loading?: boolean;
}

// ─── Component ──────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionRow({
  icon,
  label,
  subtitle,
  onPress,
  loading,
}: ActionRowProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.actionRow,
        {
          backgroundColor: colors.surfaceDefault,
          borderColor: colors.borderDefault,
        },
        animStyle,
      ]}>
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: colors.accentPrimary + '1A' },
        ]}>
        {icon}
      </View>
      <View style={styles.actionTextWrap}>
        <Text variant="body" style={styles.actionLabel}>
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.textTertiary}>
            {subtitle}
          </Text>
        )}
      </View>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 18l6-6-6-6"
          stroke={colors.textTertiary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </AnimatedPressable>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing['12'],
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionLabel: {
    fontWeight: '600',
  },
});
