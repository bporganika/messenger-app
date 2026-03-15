import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui';

// ─── Icon SVG paths ─────────────────────────────────────
const ICON = {
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  micOff:
    'M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2M19 10v2c0 .3-.01.6-.04.89M12 19v4M8 23h8',
  speaker:
    'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
  speakerOff: 'M11 5L6 9H2v6h4l5 4V5z',
  video:
    'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z',
  end: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
};

// ─── Single Control Button ──────────────────────────────
function ControlButton({
  iconPath,
  label,
  bg,
  iconColor,
  onPress,
}: {
  iconPath: string;
  label: string;
  bg: string;
  iconColor: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.88, springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={styles.controlBtn}>
      <Animated.View
        style={[styles.controlCircle, { backgroundColor: bg }, animStyle]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d={iconPath}
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Call Controls Bar ──────────────────────────────────
interface CallControlsProps {
  isMuted: boolean;
  isSpeaker: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onSwitchToVideo: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMuted,
  isSpeaker,
  onToggleMute,
  onToggleSpeaker,
  onSwitchToVideo,
  onEndCall,
}: CallControlsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.springify().delay(200)}
      style={styles.controls}>
      <ControlButton
        iconPath={isMuted ? ICON.micOff : ICON.mic}
        label={t('voiceCall.mute')}
        bg={isMuted ? colors.accentPrimary : colors.surfaceDefault}
        iconColor={isMuted ? '#FFFFFF' : colors.textPrimary}
        onPress={onToggleMute}
      />
      <ControlButton
        iconPath={isSpeaker ? ICON.speaker : ICON.speakerOff}
        label={t('voiceCall.speaker')}
        bg={isSpeaker ? colors.accentPrimary : colors.surfaceDefault}
        iconColor={isSpeaker ? '#FFFFFF' : colors.textPrimary}
        onPress={onToggleSpeaker}
      />
      <ControlButton
        iconPath={ICON.video}
        label={t('voiceCall.video')}
        bg={colors.surfaceDefault}
        iconColor={colors.textPrimary}
        onPress={onSwitchToVideo}
      />
      <ControlButton
        iconPath={ICON.end}
        label={t('voiceCall.end')}
        bg={colors.accentError}
        iconColor="#FFFFFF"
        onPress={onEndCall}
      />
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['24'],
  },
  controlBtn: {
    alignItems: 'center',
    width: 64,
  },
  controlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
});
