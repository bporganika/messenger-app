import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { callRingPulse } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { Avatar } from '../ui';

// ─── Constants ──────────────────────────────────────────
const RING_SIZE = 160;

// ─── Single Ring ────────────────────────────────────────
function PulsingRing({
  delay,
  color,
  duration,
}: {
  delay: number;
  color: string;
  duration: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(callRingPulse.opacityFrom);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(callRingPulse.scaleTo, {
            duration,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(1, { duration: 0 }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration, easing: Easing.out(Easing.quad) }),
          withTiming(callRingPulse.opacityFrom, { duration: 0 }),
        ),
        -1,
      ),
    );
  }, [delay, duration, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: RING_SIZE,
          height: RING_SIZE,
          borderRadius: RING_SIZE / 2,
          borderColor: color,
        },
        animStyle,
      ]}
    />
  );
}

// ─── Pulsing Rings + Avatar ─────────────────────────────
interface PulsingRingsProps {
  ringColor: string;
  ringDuration: number;
  avatarUri: string | undefined;
  name: string;
}

export function PulsingRings({
  ringColor,
  ringDuration,
  avatarUri,
  name,
}: PulsingRingsProps) {
  return (
    <View style={styles.avatarArea}>
      {Array.from({ length: callRingPulse.ringCount }).map((_, i) => (
        <PulsingRing
          key={i}
          delay={i * callRingPulse.stagger}
          color={ringColor}
          duration={ringDuration}
        />
      ))}
      <Avatar uri={avatarUri} name={name} size="2xl" />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  avatarArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing['40'],
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
});
