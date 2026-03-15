import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar, EmptyState } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

// ─── Types ──────────────────────────────────────────────
type CallDirection = 'incoming' | 'outgoing' | 'missed';
type CallType = 'voice' | 'video';

interface CallEntry {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  direction: CallDirection;
  callType: CallType;
  timestamp: string;
  duration?: string;
}

// ─── Demo data ──────────────────────────────────────────
const DEMO_CALLS: CallEntry[] = [
  {
    id: '1',
    userId: 'u1',
    name: 'John Doe',
    direction: 'incoming',
    callType: 'voice',
    timestamp: 'Today, 14:30',
    duration: '5:23',
  },
  {
    id: '2',
    userId: 'u2',
    name: 'Anna Smith',
    direction: 'outgoing',
    callType: 'video',
    timestamp: 'Today, 12:15',
    duration: '12:07',
  },
  {
    id: '3',
    userId: 'u3',
    name: 'Ali Yılmaz',
    direction: 'missed',
    callType: 'voice',
    timestamp: 'Yesterday, 18:00',
  },
  {
    id: '4',
    userId: 'u4',
    name: 'Maria García',
    direction: 'outgoing',
    callType: 'voice',
    timestamp: 'Yesterday, 09:15',
    duration: '2:41',
  },
  {
    id: '5',
    userId: 'u1',
    name: 'John Doe',
    direction: 'missed',
    callType: 'video',
    timestamp: 'Mar 10, 20:45',
  },
  {
    id: '6',
    userId: 'u5',
    name: 'David Chen',
    direction: 'incoming',
    callType: 'video',
    timestamp: 'Mar 10, 16:30',
    duration: '8:12',
  },
  {
    id: '7',
    userId: 'u2',
    name: 'Anna Smith',
    direction: 'outgoing',
    callType: 'voice',
    timestamp: 'Mar 9, 11:00',
    duration: '0:45',
  },
];

// ─── Direction icon ─────────────────────────────────────
function DirectionIcon({
  direction,
  color,
}: {
  direction: CallDirection;
  color: string;
}) {
  if (direction === 'outgoing') {
    // ↗ Arrow top-right
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 17L17 7M17 7H7M17 7v10"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // ↙ Arrow bottom-left (incoming + missed)
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 7L7 17M7 17h10M7 17V7"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Call type icon (right side) ────────────────────────
function CallTypeButton({
  callType,
  color,
  onPress,
}: {
  callType: CallType;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      hitSlop={10}
      style={styles.callTypeBtn}>
      {callType === 'voice' ? (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </Pressable>
  );
}

// ─── Call row ───────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CallRow({
  item,
  onAvatarPress,
  onCallPress,
}: {
  item: CallEntry;
  onAvatarPress: () => void;
  onCallPress: () => void;
}) {
  const { colors } = useTheme();
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

  const { t } = useTranslation();

  const directionLabel =
    item.direction === 'incoming'
      ? t('calls.incoming')
      : item.direction === 'outgoing'
        ? t('calls.outgoing')
        : t('calls.missed');

  const typeLabel = item.callType === 'voice' ? t('calls.voice') : t('calls.videoType');

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onCallPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.row, animStyle]}>
      <Avatar
        uri={item.avatarUrl}
        name={item.name}
        size="lg"
        onPress={onAvatarPress}
      />

      <View style={styles.rowContent}>
        <Text
          variant="bodyLg"
          color={nameColor}
          numberOfLines={1}
          style={styles.rowName}>
          {item.name}
        </Text>

        <View style={styles.rowMeta}>
          <DirectionIcon direction={item.direction} color={dirColor} />
          <Text variant="bodySm" color={colors.textSecondary}>
            {directionLabel} · {typeLabel}
          </Text>
          {item.duration && (
            <Text variant="bodySm" color={colors.textTertiary}>
              {' '}· {item.duration}
            </Text>
          )}
        </View>

        <Text variant="caption" color={colors.textTertiary}>
          {item.timestamp}
        </Text>
      </View>

      <CallTypeButton
        callType={item.callType}
        color={colors.accentPrimary}
        onPress={onCallPress}
      />
    </AnimatedPressable>
  );
}

// ─── Separator ──────────────────────────────────────────
function ItemSeparator() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.separator,
        { backgroundColor: colors.separator },
      ]}
    />
  );
}

// ─── Screen ─────────────────────────────────────────────
export function CallHistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rootNav =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [calls, setCalls] = useState<CallEntry[]>(DEMO_CALLS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.pullToRefresh();
    // TODO: GET /api/v1/calls/history
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCall = useCallback(
    (item: CallEntry) => {
      const params = {
        callId: `new-${Date.now()}`,
        userId: item.userId,
        name: item.name,
        avatarUrl: item.avatarUrl,
      };

      if (item.callType === 'video') {
        rootNav.navigate('VideoCall', params);
      } else {
        rootNav.navigate('VoiceCall', params);
      }
    },
    [rootNav],
  );

  const handleAvatarPress = useCallback(
    (item: CallEntry) => {
      // Navigate to UserProfile in ContactsTab
      rootNav.navigate('Main', {
        screen: 'ContactsTab',
        params: {
          screen: 'UserProfile',
          params: {
            userId: item.userId,
            name: item.name,
            avatarUrl: item.avatarUrl,
          },
        },
      });
    },
    [rootNav],
  );

  const renderItem = useCallback(
    ({ item }: { item: CallEntry }) => (
      <CallRow
        item={item}
        onCallPress={() => handleCall(item)}
        onAvatarPress={() => handleAvatarPress(item)}
      />
    ),
    [handleCall, handleAvatarPress],
  );

  const keyExtractor = useCallback((item: CallEntry) => item.id, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['12'],
        },
      ]}>
      {/* Header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text variant="displayLg">{t('calls.title')}</Text>
      </Animated.View>

      {/* List */}
      <FlatList
        data={calls}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={
          calls.length === 0 ? styles.emptyContainer : styles.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('calls.noCalls')}
            description={t('calls.noCallsDesc')}
            icon={
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.surfaceDefault },
                ]}>
                <Svg
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none">
                  <Path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                    stroke={colors.accentPrimary}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            }
          />
        }
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['12'],
  },
  list: {
    paddingBottom: spacing['16'],
  },
  emptyContainer: {
    flex: 1,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  rowContent: {
    flex: 1,
    marginLeft: spacing['12'],
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

  // Call type button
  callTypeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing['16'] + 60 + spacing['12'],
  },

  // Empty
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
