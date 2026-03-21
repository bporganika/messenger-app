import React, { useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { timing } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui/Text';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BAR_COUNT = 28;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const BAR_MAX_HEIGHT = 28;
const WAVEFORM_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP);

export interface VoicePlayerProps {
  duration: string;
  currentTime?: string;
  waveform?: number[];
  playing?: boolean;
  progress?: number;
  onPlayPause?: () => void;
  onLongPress?: () => void;
}

function PlayIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
    </Svg>
  );
}

function PauseIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
      <Path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Svg>
  );
}

function WaveformBar({
  index,
  height,
  played,
  activeColor,
  inactiveColor,
}: {
  index: number;
  height: number;
  played: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  const x = index * (BAR_WIDTH + BAR_GAP);
  const barH = Math.max(3, height * BAR_MAX_HEIGHT);
  const y = (BAR_MAX_HEIGHT - barH) / 2;

  return (
    <Rect
      x={x}
      y={y}
      width={BAR_WIDTH}
      height={barH}
      rx={1.5}
      fill={played ? activeColor : inactiveColor}
    />
  );
}

export function VoicePlayer({
  duration,
  currentTime,
  waveform,
  playing = false,
  progress = 0,
  onPlayPause,
  onLongPress,
}: VoicePlayerProps) {
  const { colors } = useTheme();

  const bars = waveform?.length
    ? waveform.slice(0, BAR_COUNT)
    : Array.from({ length: BAR_COUNT }, () => 0.2 + Math.random() * 0.6);

  while (bars.length < BAR_COUNT) {
    bars.push(0.2);
  }

  const playedBars = Math.round(progress * BAR_COUNT);

  const handlePlayPause = useCallback(() => {
    haptics.buttonPress();
    onPlayPause?.();
  }, [onPlayPause]);

  const handleLongPress = useCallback(() => {
    haptics.longPress();
    onLongPress?.();
  }, [onLongPress]);

  return (
    <Pressable onLongPress={handleLongPress} style={styles.container}>
      <Pressable onPress={handlePlayPause} hitSlop={4} style={styles.playBtn}>
        {playing ? (
          <PauseIcon color={colors.accentPrimary} />
        ) : (
          <PlayIcon color={colors.accentPrimary} />
        )}
      </Pressable>
      <View style={styles.waveformArea}>
        <Svg
          width={WAVEFORM_WIDTH}
          height={BAR_MAX_HEIGHT}
          viewBox={`0 0 ${WAVEFORM_WIDTH} ${BAR_MAX_HEIGHT}`}>
          {bars.map((h, i) => (
            <WaveformBar
              key={i}
              index={i}
              height={h}
              played={i < playedBars}
              activeColor={colors.accentPrimary}
              inactiveColor={colors.textTertiary}
            />
          ))}
        </Svg>
        <Text variant="mono" color={colors.textTertiary} style={styles.time}>
          {currentTime ?? duration}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing['8'],
  },
  waveformArea: {
    flex: 1,
  },
  time: {
    marginTop: spacing['4'],
  },
});
