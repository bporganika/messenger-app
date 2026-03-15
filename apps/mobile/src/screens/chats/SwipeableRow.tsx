import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui';

const SWIPE_THRESHOLD = 80;

export interface SwipeableRowProps {
  children: React.ReactNode;
  onArchive: () => void;
  onDelete: () => void;
}

export function SwipeableRow({
  children,
  onArchive,
  onDelete,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const translateX = useSharedValue(0);

  const triggerArchive = useCallback(() => {
    haptics.buttonPress();
    onArchive();
  }, [onArchive]);

  const triggerDelete = useCallback(() => {
    haptics.deleteAction();
    onDelete();
  }, [onDelete]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, springs.snappy);
        runOnJS(triggerArchive)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, springs.snappy);
        runOnJS(triggerDelete)();
      } else {
        translateX.value = withSpring(0, springs.snappy);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftBgStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? 1 : 0,
  }));

  const rightBgStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
  }));

  return (
    <View>
      {/* Archive background (left) */}
      <Animated.View
        style={[
          styles.swipeBg,
          styles.swipeBgLeft,
          { backgroundColor: colors.accentSuccess },
          leftBgStyle,
        ]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="caption" color="#FFFFFF" style={styles.swipeLabel}>
          {t('chat.archive')}
        </Text>
      </Animated.View>

      {/* Delete background (right) */}
      <Animated.View
        style={[
          styles.swipeBg,
          styles.swipeBgRight,
          { backgroundColor: colors.accentError },
          rightBgStyle,
        ]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="caption" color="#FFFFFF" style={styles.swipeLabel}>
          {t('common.delete')}
        </Text>
      </Animated.View>

      {/* Foreground row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['8'],
    paddingHorizontal: spacing['24'],
  },
  swipeBgLeft: {
    justifyContent: 'flex-start',
  },
  swipeBgRight: {
    justifyContent: 'flex-end',
  },
  swipeLabel: {
    fontWeight: '700',
  },
});
