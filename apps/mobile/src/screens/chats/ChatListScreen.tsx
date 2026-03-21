import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Text, EmptyState, Skeleton } from '../../components/ui';
import { ChatListItem } from '../../components/chat/ChatListItem';
import type { ChatScreenProps } from '../../navigation/types';
import type { Conversation, DeleteTarget } from './types';
import { SwipeableRow } from './SwipeableRow';
import { ChatSearchBar } from './ChatSearchBar';
import { DeleteConversationModal } from './DeleteConversationModal';
import { ConversationContextModal } from './ConversationContextModal';

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

export function ChatListScreen({ navigation }: ChatScreenProps<'ChatList'>) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [contextTarget, setContextTarget] = useState<Conversation | null>(null);

  const filtered = useMemo(() => {
    const active = conversations.filter((c) => !c.isArchived);
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q)),
    );
  }, [conversations, search]);

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      haptics.pullToRefresh();
    }
    setError(false);
    try {
      const data = await api.get<{ conversations: Conversation[] }>(
        '/conversations',
      );
      setConversations(data.conversations);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleArchive = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c)),
    );
  }, []);

  const handleDelete = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      setConversations((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleLongPress = useCallback((item: Conversation) => {
    setContextTarget(item);
  }, []);

  const itemBgStyle = useMemo(
    () => ({ backgroundColor: colors.bgPrimary }),
    [colors.bgPrimary],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <SwipeableRow
        onArchive={() => handleArchive(item.id)}
        onDelete={() => handleDelete(item.id, item.name)}>
        <ChatListItem
          id={item.id}
          name={item.name}
          avatarUri={item.avatarUrl}
          onlineStatus={item.onlineStatus}
          lastMessage={item.lastMessage}
          lastMessageType={item.lastMessageType}
          lastMessageStatus={item.lastMessageStatus}
          lastMessageIsSent={item.lastMessageIsSent}
          timestamp={item.timestamp}
          unreadCount={item.unreadCount}
          style={itemBgStyle}
          onPress={() =>
            navigation.navigate('Chat', {
              conversationId: item.id,
              name: item.name,
              avatarUrl: item.avatarUrl,
            })
          }
          onLongPress={() => handleLongPress(item)}
        />
      </SwipeableRow>
    ),
    [navigation, handleArchive, handleDelete, handleLongPress, itemBgStyle],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

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
        <Text variant="displayLg">{t('tabs.chats')}</Text>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.getParent()?.navigate('ContactsTab');
          }}
          hitSlop={8}
          style={[
            styles.composeBtn,
            { backgroundColor: colors.surfaceDefault },
          ]}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M17.5 2.5a2.121 2.121 0 013 3L12 14l-4 1 1-4 8.5-8.5z"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </Animated.View>

      {/* Search */}
      <ChatSearchBar value={search} onChangeText={setSearch} />

      {/* Loading skeleton */}
      {loading && (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={60} height={60} variant="circle" />
              <View style={styles.skeletonText}>
                <Skeleton width="60%" height={14} variant="text" />
                <Skeleton width="80%" height={12} variant="text" style={{ marginTop: 8 }} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <EmptyState
          title={t('common.error')}
          actionTitle={t('common.retry')}
          onAction={() => loadConversations()}
        />
      )}

      {/* List */}
      {!loading && !error && <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadConversations(true)}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
        ListEmptyComponent={
          search.trim() ? (
            <View style={styles.noResults}>
              <Text
                variant="body"
                color={colors.textTertiary}
                align="center">
                {t('chat.noResults', { query: search })}
              </Text>
              <Text
                variant="bodySm"
                color={colors.textTertiary}
                align="center"
                style={styles.noResultsSub}>
                {t('chat.tryDifferent')}
              </Text>
            </View>
          ) : (
            <EmptyState
              title={t('chat.noConversations')}
              description={t('chat.noConversationsDesc')}
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
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke={colors.accentPrimary}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              }
              actionTitle={t('chat.startChat')}
              onAction={() => {
                navigation.getParent()?.navigate('ContactsTab');
              }}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />}

      {/* Modals */}
      <DeleteConversationModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <ConversationContextModal
        target={contextTarget}
        onClose={() => setContextTarget(null)}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['12'],
  },
  composeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['32'],
  },
  noResultsSub: {
    marginTop: spacing['4'],
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
});
