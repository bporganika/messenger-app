import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { radius, spacing } from '../../design-system/tokens';

const DOT_SIZE = 7;
const BOUNCE_HEIGHT = -6;
const DURATION = 400;
const DOT_COUNT = 3;
const STAGGER = 150;

function Dot({ index, color }: { index: number; color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      index * STAGGER,
      withRepeat(
        withTiming(BOUNCE_HEIGHT, {
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, [translateY, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bubbleReceivedBg,
          borderColor: colors.bubbleReceivedBorder,
        },
      ]}>
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <Dot key={i} index={i} color={colors.textTertiary} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['6'],
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
    borderRadius: radius.xl,
    borderWidth: 1,
    marginStart: spacing['12'],
    marginVertical: spacing['4'],
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
