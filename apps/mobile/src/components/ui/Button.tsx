import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { buttonHeight, radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedDot = Animated.View;

function LoadingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  React.useEffect(() => {
    const animate = (sv: Animated.SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0.3, { duration: 300 }),
          ),
          -1,
          false,
        ),
      );
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  const dotStyle = { width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginHorizontal: 2 };

  return (
    <View style={styles.dotsRow}>
      <AnimatedDot style={[dotStyle, s1]} />
      <AnimatedDot style={[dotStyle, s2]} />
      <AnimatedDot style={[dotStyle, s3]} />
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const { colors, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    haptics.buttonPress();
    onPress?.();
  }, [disabled, loading, onPress]);

  const height = buttonHeight[size];
  const hitSlop = height < 44 ? (44 - height) / 2 : 0;

  const containerStyle = getContainerStyle(variant, colors, shadows);
  const labelStyle = getLabelStyle(variant, colors);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      hitSlop={hitSlop}
      style={[
        styles.base,
        { height },
        containerStyle,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <LoadingDots color={labelStyle.color as string} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text
            variant={size === 'sm' ? 'bodySm' : 'bodyLg'}
            color={labelStyle.color as string}
            style={[
              styles.label,
              leftIcon ? { marginStart: spacing['8'] } : undefined,
              rightIcon ? { marginEnd: spacing['8'] } : undefined,
            ]}>
            {title}
          </Text>
          {rightIcon}
        </View>
      )}
    </AnimatedPressable>
  );
}

function getContainerStyle(
  variant: ButtonVariant,
  colors: ReturnType<typeof useTheme>['colors'],
  shadows: ReturnType<typeof useTheme>['shadows'],
): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.accentPrimary,
        ...shadows.sm,
      };
    case 'secondary':
      return {
        backgroundColor: colors.surfaceDefault,
        borderWidth: 1,
        borderColor: colors.borderDefault,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: colors.accentError + '1A',
      };
  }
}

function getLabelStyle(
  variant: ButtonVariant,
  colors: ReturnType<typeof useTheme>['colors'],
): TextStyle {
  switch (variant) {
    case 'primary':
      return { color: '#FFFFFF' };
    case 'secondary':
      return { color: colors.textPrimary };
    case 'ghost':
      return { color: colors.accentPrimary };
    case 'danger':
      return { color: colors.accentError };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['24'],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
