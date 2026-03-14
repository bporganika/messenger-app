import React, { useCallback } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAX_WIDTH = 240;
const MAX_HEIGHT = 300;

export interface VideoBubbleProps {
  thumbnailUri: string;
  duration?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function VideoBubble({
  thumbnailUri,
  duration,
  width,
  height,
  onPress,
  onLongPress,
}: VideoBubbleProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const aspect =
    width && height ? Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1) : 1;
  const imgW = width ? Math.round(width * aspect) : MAX_WIDTH;
  const imgH = height ? Math.round(height * aspect) : MAX_HEIGHT * 0.6;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handleLongPress = useCallback(() => {
    haptics.longPress();
    onLongPress?.();
  }, [onLongPress]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}>
      <View style={[styles.wrapper, { width: imgW, height: imgH }]}>
        <FastImage
          source={{ uri: thumbnailUri, priority: FastImage.priority.normal }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.overlay} />
        <View style={styles.playButton}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="#FFFFFF">
            <Path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
          </Svg>
        </View>
        {duration && (
          <View style={styles.duration}>
            <Text variant="mono" color="#FFFFFF">
              {duration}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: spacing['2'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: spacing['8'],
    right: spacing['8'],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['2'],
  },
});
