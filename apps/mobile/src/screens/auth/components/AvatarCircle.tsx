import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../../design-system';
import { springs } from '../../../design-system/animations';
import { spacing, avatarSize } from '../../../design-system/tokens';
import { haptics } from '../../../design-system/haptics';
import { Text } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

const AVATAR_DISPLAY = avatarSize['2xl'];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AvatarCircleProps {
  uri: string | null;
  onPress: () => void;
}

export function AvatarCircle({ uri, onPress }: AvatarCircleProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => { haptics.buttonPress(); onPress(); }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.avatarWrap, animStyle]}>
      {uri ? (
        <FastImage
          source={{ uri, priority: FastImage.priority.normal }}
          style={styles.avatarImage}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { borderColor: colors.borderDefault }]}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke={colors.textTertiary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={13} r={4} stroke={colors.textTertiary} strokeWidth={1.5} />
          </Svg>
          <Text variant="caption" color={colors.textTertiary} style={styles.avatarLabel}>
            {t('profileSetup.addPhoto')}
          </Text>
        </View>
      )}

      {uri && (
        <View style={[styles.editBadge, { backgroundColor: colors.accentPrimary }]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={13} r={4} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
  },
  avatarImage: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    marginTop: spacing['4'],
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    end: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
