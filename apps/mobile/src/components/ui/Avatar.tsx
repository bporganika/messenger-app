import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { avatarSize as avatarSizes } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from './Text';

type AvatarSizeKey = keyof typeof avatarSizes;
type OnlineStatus = 'online' | 'offline' | 'away';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSizeKey;
  status?: OnlineStatus;
  onPress?: () => void;
}

function getInitial(name?: string): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function getFontVariant(size: AvatarSizeKey) {
  const map: Record<AvatarSizeKey, 'caption' | 'bodySm' | 'body' | 'title' | 'heading' | 'displayLg'> = {
    xs: 'caption',
    sm: 'bodySm',
    md: 'body',
    lg: 'title',
    xl: 'heading',
    '2xl': 'displayLg',
  };
  return map[size];
}

export function Avatar({
  uri,
  name,
  size = 'md',
  status,
  onPress,
}: AvatarProps) {
  const { colors, brand } = useTheme();
  const scale = useSharedValue(1);
  const dimension = avatarSizes[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!onPress) return;
    scale.value = withSpring(0.95, springs.snappy);
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (!onPress) return;
    scale.value = withSpring(1, springs.snappy);
  }, [onPress, scale]);

  const handlePress = useCallback(() => {
    if (!onPress) return;
    haptics.buttonPress();
    onPress();
  }, [onPress]);

  const ringSize = dimension + 6;
  const dotSize = Math.max(10, Math.round(dimension * 0.22));

  const showRing = status === 'online' || status === 'away';
  const ringColor =
    status === 'online' ? brand.violet : colors.textTertiary;

  const content = (
    <View style={[styles.wrapper, { width: ringSize, height: ringSize }]}>
      {showRing && (
        <View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderColor: ringColor,
              borderWidth: status === 'online' ? 2 : 1,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.avatarContainer,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: brand.violet,
          },
        ]}>
        {uri ? (
          <FastImage
            source={{ uri, priority: FastImage.priority.normal }}
            style={{
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Text variant={getFontVariant(size)} color="#FFFFFF" align="center">
            {getInitial(name)}
          </Text>
        )}
      </View>
      {status === 'online' && (
        <View
          style={[
            styles.statusDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: colors.accentSuccess,
              borderColor: colors.bgPrimary,
              borderWidth: 2,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}>
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
