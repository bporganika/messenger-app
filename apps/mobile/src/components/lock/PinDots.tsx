import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';

// ─── Types ──────────────────────────────────────────────
export type PinDotsProps = {
  /** Total number of PIN digits */
  pinLength: number;
  /** Number of digits entered so far */
  filledCount: number;
  /** Shared value controlling horizontal shake translation */
  shakeX: SharedValue<number>;
};

// ─── Single Dot ─────────────────────────────────────────
function PinDot({ filled }: { filled: boolean }) {
  const { colors, brand } = useTheme();
  const scale = useSharedValue(filled ? 1 : 0.5);

  useEffect(() => {
    scale.value = withSpring(filled ? 1 : 0.5, springs.snappy);
  }, [filled, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: filled ? brand.violet : 'transparent',
    borderColor: filled ? brand.violet : colors.borderDefault,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

// ─── PinDots Row ────────────────────────────────────────
export function PinDots({ pinLength, filledCount, shakeX }: PinDotsProps) {
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={[styles.dotsRow, shakeStyle]}>
      {Array.from({ length: pinLength }).map((_, i) => (
        <PinDot key={i} filled={i < filledCount} />
      ))}
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    gap: spacing['16'],
    marginBottom: spacing['16'],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
