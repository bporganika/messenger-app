import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { springs } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAX_WIDTH = 240;
const MAX_HEIGHT = 300;

export interface PhotoBubbleProps {
  uri: string;
  width?: number;
  height?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function PhotoBubble({
  uri,
  width,
  height,
  onPress,
  onLongPress,
}: PhotoBubbleProps) {
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
      <FastImage
        source={{ uri, priority: FastImage.priority.normal }}
        style={[
          styles.image,
          { width: imgW, height: imgH },
        ]}
        resizeMode={FastImage.resizeMode.cover}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: radius.md,
    marginVertical: spacing['2'],
  },
});
