import React, { useEffect } from 'react';
import { ViewStyle, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { shimmer } from '../../design-system/animations';
import { radius as radii } from '../../design-system/tokens';

type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps {
  width: DimensionValue;
  height: number;
  variant?: SkeletonVariant;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  variant = 'rect',
  radius,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: shimmer.duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.4, 1, 0.4]);
    return { opacity };
  });

  const borderRadius =
    variant === 'circle'
      ? (typeof height === 'number' ? height / 2 : 9999)
      : variant === 'text'
        ? radii.xs
        : radius ?? radii.sm;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceHover,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
