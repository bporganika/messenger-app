import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../../components/ui';
import type { RootScreenProps } from '../../navigation/types';

function PulsingRing({
  delay,
  color,
  size,
}: {
  delay: number;
  color: string;
  size: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(1.6, { duration: 2500 }), -1, false),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0, { duration: 2500 }), -1, false),
    );
  }, [delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export function VoiceCallScreen({
  navigation,
  route,
}: RootScreenProps<'VoiceCall'>) {
  const { name, avatarUrl } = route.params;
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['24'],
          paddingBottom: insets.bottom + spacing['32'],
        },
      ]}>
      {/* Back */}
      <Pressable
        onPress={() => {
          haptics.buttonPress();
          navigation.goBack();
        }}
        hitSlop={12}
        style={styles.backBtn}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      <Text variant="title" align="center">
        {name}
      </Text>

      <View style={styles.avatarArea}>
        <PulsingRing delay={0} color={brand.violet} size={160} />
        <PulsingRing delay={400} color={brand.violet} size={160} />
        <PulsingRing delay={800} color={brand.violet} size={160} />
        <Avatar uri={avatarUrl} name={name} size="2xl" />
      </View>

      <Text variant="body" color={colors.textSecondary} align="center">
        Calling...
      </Text>

      <View style={styles.spacer} />

      {/* Controls */}
      <View style={styles.controls}>
        <ControlButton
          icon="mic-off"
          label="Mute"
          color={colors.surfaceDefault}
          iconColor={colors.textPrimary}
          onPress={() => {}}
        />
        <ControlButton
          icon="speaker"
          label="Speaker"
          color={colors.surfaceDefault}
          iconColor={colors.textPrimary}
          onPress={() => {}}
        />
        <ControlButton
          icon="video"
          label="Video"
          color={colors.surfaceDefault}
          iconColor={colors.textPrimary}
          onPress={() => {}}
        />
        <ControlButton
          icon="end"
          label="End"
          color={colors.accentError}
          iconColor="#FFFFFF"
          onPress={() => {
            haptics.error();
            navigation.goBack();
          }}
        />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  color,
  iconColor,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  iconColor: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const iconPaths: Record<string, string> = {
    'mic-off':
      'M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6',
    speaker:
      'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
    video:
      'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
    end: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  };

  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={styles.controlBtn}>
      <View
        style={[
          styles.controlCircle,
          { backgroundColor: color },
        ]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d={iconPaths[icon] ?? ''}
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Text variant="caption" color={colors.textSecondary} style={styles.controlLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['24'],
  },
  backBtn: {
    position: 'absolute',
    top: 0,
    left: spacing['16'],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarArea: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing['40'],
  },
  spacer: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['24'],
  },
  controlBtn: {
    alignItems: 'center',
  },
  controlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
  controlLabel: {
    marginTop: spacing['2'],
  },
});
