import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui/Text';

const CANCEL_THRESHOLD = -80;

export interface VoiceRecorderProps {
  recording: boolean;
  elapsed: string;
  onSend: () => void;
  onCancel: () => void;
}

export function VoiceRecorder({
  recording,
  elapsed,
  onSend,
  onCancel,
}: VoiceRecorderProps) {
  const { colors } = useTheme();
  const slideX = useSharedValue(0);
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (recording) {
      opacity.value = withSpring(1, springs.bouncy);
      pulse.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      opacity.value = withTiming(0, timing.fast);
      pulse.value = 1;
      slideX.value = withSpring(0, springs.snappy);
    }
  }, [recording, opacity, pulse, slideX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const dx = Math.min(0, gestureState.dx);
        slideX.value = dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < CANCEL_THRESHOLD) {
          haptics.deleteAction();
          onCancel();
        } else {
          haptics.sendMessage();
          onSend();
        }
        slideX.value = withSpring(0, springs.snappy);
      },
    }),
  ).current;

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.3], [0.8, 0.3]),
  }));

  const cancelOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(slideX.value, [0, CANCEL_THRESHOLD], [0.4, 1]),
  }));

  if (!recording) return null;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.cancelHint, cancelOpacity]}>
        <Text variant="bodySm" color={colors.accentError}>
          {'< Slide to cancel'}
        </Text>
      </Animated.View>
      <Animated.View
        style={[styles.container, { backgroundColor: colors.bgSecondary }, containerStyle]}
        {...panResponder.panHandlers}>
        <View style={styles.recRow}>
          <View style={styles.dotWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                { borderColor: colors.accentError },
                pulseStyle,
              ]}
            />
            <View
              style={[styles.recDot, { backgroundColor: colors.accentError }]}
            />
          </View>
          <Text variant="mono" color={colors.accentError} style={styles.timer}>
            {elapsed}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cancelHint: {
    position: 'absolute',
    start: spacing['16'],
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['12'],
    borderRadius: radius.full,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing['8'],
  },
  pulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timer: {
    minWidth: 48,
  },
});
