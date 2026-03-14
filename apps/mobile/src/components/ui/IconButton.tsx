import React, { useCallback } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconButtonSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<IconButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 56,
};

export interface IconButtonProps {
  icon: React.ReactNode;
  size?: IconButtonSize;
  variant?: 'default' | 'filled' | 'ghost';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  onPress,
  disabled = false,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    haptics.buttonPress();
    onPress?.();
  }, [disabled, onPress]);

  const dimension = sizeMap[size];

  const bgColor =
    variant === 'filled'
      ? colors.accentPrimary
      : variant === 'default'
        ? colors.surfaceDefault
        : 'transparent';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.full,
          backgroundColor: bgColor,
        },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
