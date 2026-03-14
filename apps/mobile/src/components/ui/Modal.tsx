import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  const { colors, shadows } = useTheme();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, springs.bouncy);
      opacity.value = withTiming(1, timing.fast);
      backdropOpacity.value = withTiming(1, timing.normal);
    } else {
      scale.value = withSpring(0.9, springs.default);
      opacity.value = withTiming(0, timing.fast);
      backdropOpacity.value = withTiming(0, timing.fast);
    }
  }, [visible, scale, opacity, backdropOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSecondary,
            borderColor: colors.borderSubtle,
          },
          shadows.card,
          contentStyle,
        ]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: '85%',
    maxWidth: 360,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing['24'],
  },
});
