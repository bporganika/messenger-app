import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';

const REPLY_THRESHOLD = 60;

export interface SwipeToReplyProps {
  children: React.ReactNode;
  onReply: () => void;
  enabled: boolean;
}

export function SwipeToReply({
  children,
  onReply,
  enabled,
}: SwipeToReplyProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const replyIconScale = useSharedValue(0);
  const didTrigger = useRef(false);

  const triggerReply = useCallback(() => {
    haptics.toggleSwitch();
    onReply();
  }, [onReply]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([15, 999])
    .failOffsetY([-10, 10])
    .enabled(enabled)
    .onUpdate((e) => {
      const tx = Math.max(0, e.translationX);
      translateX.value =
        tx > REPLY_THRESHOLD
          ? REPLY_THRESHOLD + (tx - REPLY_THRESHOLD) * 0.3
          : tx;
      replyIconScale.value = Math.min(tx / REPLY_THRESHOLD, 1);

      if (tx >= REPLY_THRESHOLD && !didTrigger.current) {
        didTrigger.current = true;
        runOnJS(triggerReply)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, springs.snappy);
      replyIconScale.value = withTiming(0, timing.fast);
      didTrigger.current = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: replyIconScale.value }],
    opacity: replyIconScale.value,
  }));

  return (
    <View>
      <Animated.View style={[styles.replyIconWrap, iconStyle]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 14L4 9l5-5"
            stroke={colors.accentPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M20 20v-7a4 4 0 00-4-4H4"
            stroke={colors.accentPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  replyIconWrap: {
    position: 'absolute',
    left: spacing['4'],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: 36,
    alignItems: 'center',
  },
});
