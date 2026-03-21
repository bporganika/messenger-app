import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../ui';

type CallDirection = 'incoming' | 'outgoing' | 'missed';
type CallType = 'voice' | 'video';

export interface CallEntry {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  direction: CallDirection;
  callType: CallType;
  timestamp: string;
  duration?: string;
}

export interface CallHistoryItemProps {
  item: CallEntry;
  onAvatarPress: () => void;
  onCallPress: () => void;
}

function DirectionIcon({ direction, color }: { direction: CallDirection; color: string }) {
  const d = direction === 'outgoing'
    ? 'M7 17L17 7M17 7H7M17 7v10'
    : 'M17 7L7 17M7 17h10M7 17V7';

  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CallTypeButton({ callType, color, onPress }: { callType: CallType; color: string; onPress: () => void }) {
  const d = callType === 'voice'
    ? 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'
    : 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z';

  return (
    <Pressable onPress={() => { haptics.buttonPress(); onPress(); }} hitSlop={10} style={styles.callTypeBtn}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CallHistoryItem = React.memo(function CallHistoryItem({ item, onAvatarPress, onCallPress }: CallHistoryItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const isMissed = item.direction === 'missed';
  const nameColor = isMissed ? colors.accentError : colors.textPrimary;
  const dirColor = isMissed ? colors.accentError : colors.accentSuccess;

  const directionLabel =
    item.direction === 'incoming' ? t('calls.incoming')
    : item.direction === 'outgoing' ? t('calls.outgoing')
    : t('calls.missed');

  const typeLabel = item.callType === 'voice' ? t('calls.voice') : t('calls.videoType');

  return (
    <AnimatedPressable
      onPress={() => { haptics.buttonPress(); onCallPress(); }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.row, animStyle]}>
      <Avatar uri={item.avatarUrl} name={item.name} size="lg" onPress={onAvatarPress} />
      <View style={styles.rowContent}>
        <Text variant="bodyLg" color={nameColor} numberOfLines={1} style={styles.rowName}>
          {item.name}
        </Text>
        <View style={styles.rowMeta}>
          <DirectionIcon direction={item.direction} color={dirColor} />
          <Text variant="bodySm" color={colors.textSecondary}>
            {directionLabel} · {typeLabel}
          </Text>
          {item.duration && (
            <Text variant="bodySm" color={colors.textTertiary}> · {item.duration}</Text>
          )}
        </View>
        <Text variant="caption" color={colors.textTertiary}>{item.timestamp}</Text>
      </View>
      <CallTypeButton callType={item.callType} color={colors.accentPrimary} onPress={onCallPress} />
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  rowContent: {
    flex: 1,
    marginStart: spacing['12'],
  },
  rowName: {
    fontWeight: '600',
    marginBottom: spacing['2'],
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    marginBottom: spacing['2'],
  },
  callTypeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
