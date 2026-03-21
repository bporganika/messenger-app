import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { Text } from './Text';

type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  duration?: number;
  onDismiss: () => void;
}

export function Toast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, springs.bouncy);
      opacity.value = withSpring(1, springs.bouncy);
      if (duration > 0) {
        translateY.value = withDelay(
          duration,
          withSpring(-100, springs.default, (finished) => {
            if (finished) runOnJS(dismiss)();
          }),
        );
        opacity.value = withDelay(duration, withSpring(0, springs.default));
      }
    } else {
      translateY.value = withSpring(-100, springs.default);
      opacity.value = withSpring(0, springs.default);
    }
  }, [visible, duration, translateY, opacity, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const accentColor =
    type === 'success'
      ? colors.accentSuccess
      : type === 'warning'
        ? colors.accentWarning
        : type === 'error'
          ? colors.accentError
          : colors.accentPrimary;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing['8'],
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderDefault,
          borderStartColor: accentColor,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <Text variant="bodySm" numberOfLines={2}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    start: spacing['16'],
    end: spacing['16'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderStartWidth: 3,
    zIndex: 9999,
  },
  pressable: {
    padding: spacing['16'],
  },
});
