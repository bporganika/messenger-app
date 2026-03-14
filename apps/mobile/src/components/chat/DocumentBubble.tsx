import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface DocumentBubbleProps {
  fileName: string;
  fileSize: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

function FileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DocumentBubble({
  fileName,
  fileSize,
  onPress,
  onLongPress,
}: DocumentBubbleProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

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
      <View style={[styles.container, { backgroundColor: colors.surfaceDefault }]}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: colors.accentPrimary + '1A' },
          ]}>
          <FileIcon color={colors.accentPrimary} />
        </View>
        <View style={styles.info}>
          <Text variant="bodySm" numberOfLines={1} style={styles.name}>
            {fileName}
          </Text>
          <Text variant="caption" color={colors.textTertiary}>
            {fileSize}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing['12'],
    minWidth: 200,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['12'],
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: spacing['2'],
  },
});
