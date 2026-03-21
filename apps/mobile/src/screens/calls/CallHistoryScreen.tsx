import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, EmptyState, Skeleton } from '../../components/ui';
import { CallHistoryItem } from '../../components/call/CallHistoryItem';
import type { CallEntry } from '../../components/call/CallHistoryItem';
import { api } from '../../services/api';
import type { RootStackParamList } from '../../navigation/types';

function ItemSeparator() {
  const { colors } = useTheme();
  return (
    <View style={[styles.separator, { backgroundColor: colors.separator }]} />
  );
}

export function CallHistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [calls, setCalls] = useState<CallEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadCalls = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      haptics.pullToRefresh();
    }
    setError(false);
    try {
      const data = await api.get<{ calls: CallEntry[] }>('/calls/history');
      setCalls(data.calls);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

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
      <CallHistoryItem
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
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text variant="displayLg">{t('calls.title')}</Text>
      </Animated.View>

      {loading && (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={60} height={60} variant="circle" />
              <View style={styles.skeletonText}>
                <Skeleton width="50%" height={14} variant="text" />
                <Skeleton width="70%" height={12} variant="text" style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {error && !loading && (
        <EmptyState
          title={t('common.error')}
          actionTitle={t('common.retry')}
          onAction={() => loadCalls()}
        />
      )}

      {!loading && !error && <FlatList
        data={calls}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={calls.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCalls(true)}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('calls.noCalls')}
            description={t('calls.noCallsDesc')}
            icon={
              <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceDefault }]}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
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
      />}
    </View>
  );
}

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
  separator: {
    height: StyleSheet.hairlineWidth,
    marginStart: spacing['16'] + 60 + spacing['12'],
  },
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: spacing['16'],
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['12'],
    gap: spacing['12'],
  },
  skeletonText: {
    flex: 1,
    gap: spacing['4'],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
