import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeInUp,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar, Badge, EmptyState } from '../../components/ui';
import { MessageStatus } from '../../components/chat/MessageStatus';
import type { ChatScreenProps } from '../../navigation/types';
import type { MessageType, MessageStatus as MsgStatus } from '@pulse/shared';

// ─── Types ──────────────────────────────────────────────
type OnlineStatus = 'online' | 'offline' | 'away';

interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  lastMessage?: string;
  lastMessageType: MessageType;
  lastMessageStatus?: MsgStatus;
  lastMessageIsSent: boolean;
  timestamp: string;
  unreadCount: number;
  isArchived: boolean;
}

// ─── Demo Data ──────────────────────────────────────────
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'John Doe',
    avatarUrl: undefined,
    onlineStatus: 'online',
    lastMessage: 'Hey, how are you doing?',
    lastMessageType: 'text',
    lastMessageStatus: 'read',
    lastMessageIsSent: true,
    timestamp: '2m',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: '2',
    name: 'Anna Smith',
    avatarUrl: undefined,
    onlineStatus: 'offline',
    lastMessage: undefined,
    lastMessageType: 'image',
    lastMessageStatus: undefined,
    lastMessageIsSent: false,
    timestamp: '1h',
    unreadCount: 3,
    isArchived: false,
  },
  {
    id: '3',
    name: 'Ali Yılmaz',
    avatarUrl: undefined,
    onlineStatus: 'away',
    lastMessage: undefined,
    lastMessageType: 'voice',
    lastMessageStatus: undefined,
    lastMessageIsSent: false,
    timestamp: '1d',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: '4',
    name: 'Maria García',
    avatarUrl: undefined,
    onlineStatus: 'online',
    lastMessage: 'Sure, let me check that for you',
    lastMessageType: 'text',
    lastMessageStatus: 'delivered',
    lastMessageIsSent: true,
    timestamp: '3h',
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: '5',
    name: 'David Chen',
    avatarUrl: undefined,
    onlineStatus: 'offline',
    lastMessage: undefined,
    lastMessageType: 'file',
    lastMessageStatus: undefined,
    lastMessageIsSent: false,
    timestamp: '2d',
    unreadCount: 1,
    isArchived: false,
  },
];

// ─── Message type icon ──────────────────────────────────
function getMessagePreview(
  type: MessageType,
  text: string | undefined,
): string {
  switch (type) {
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎬 Video';
    case 'voice':
      return '🎤 Voice message';
    case 'file':
      return '📎 Document';
    default:
      return text ?? '';
  }
}

// ─── Swipe action background ────────────────────────────
const SWIPE_THRESHOLD = 80;

function SwipeableRow({
  children,
  onArchive,
  onDelete,
}: {
  children: React.ReactNode;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue<number | undefined>(undefined);

  const triggerArchive = useCallback(() => {
    haptics.buttonPress();
    onArchive();
  }, [onArchive]);

  const triggerDelete = useCallback(() => {
    haptics.deleteAction();
    onDelete();
  }, [onDelete]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Swipe right → archive
        translateX.value = withSpring(0, springs.snappy);
        runOnJS(triggerArchive)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → delete
        translateX.value = withSpring(0, springs.snappy);
        runOnJS(triggerDelete)();
      } else {
        translateX.value = withSpring(0, springs.snappy);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Left background (archive — revealed on swipe right)
  const leftBgStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? 1 : 0,
  }));

  // Right background (delete — revealed on swipe left)
  const rightBgStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
  }));

  return (
    <View>
      {/* Archive background (left) */}
      <Animated.View
        style={[
          styles.swipeBg,
          styles.swipeBgLeft,
          { backgroundColor: colors.accentSuccess },
          leftBgStyle,
        ]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="caption" color="#FFFFFF" style={styles.swipeLabel}>
          Archive
        </Text>
      </Animated.View>

      {/* Delete background (right) */}
      <Animated.View
        style={[
          styles.swipeBg,
          styles.swipeBgRight,
          { backgroundColor: colors.accentError },
          rightBgStyle,
        ]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="caption" color="#FFFFFF" style={styles.swipeLabel}>
          Delete
        </Text>
      </Animated.View>

      {/* Foreground row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Chat list row ──────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ChatRow({
  item,
  onPress,
  onLongPress,
}: {
  item: Conversation;
  onPress: () => void;
  onLongPress: () => void;
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

  const preview = getMessagePreview(item.lastMessageType, item.lastMessage);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onLongPress={() => {
        haptics.longPress();
        onLongPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.row, { backgroundColor: colors.bgPrimary }, animStyle]}>
      <Avatar
        uri={item.avatarUrl}
        name={item.name}
        size="lg"
        status={item.onlineStatus}
      />

      <View style={styles.rowContent}>
        {/* Top row: name + timestamp */}
        <View style={styles.topRow}>
          <Text variant="bodyLg" numberOfLines={1} style={styles.rowName}>
            {item.name}
          </Text>
          <Text
            variant="caption"
            color={
              item.unreadCount > 0
                ? colors.accentPrimary
                : colors.textTertiary
            }>
            {item.timestamp}
          </Text>
        </View>

        {/* Bottom row: preview + badge */}
        <View style={styles.bottomRow}>
          <View style={styles.previewRow}>
            {item.lastMessageIsSent && item.lastMessageStatus && (
              <MessageStatus status={item.lastMessageStatus} />
            )}
            <Text
              variant="bodySm"
              color={colors.textSecondary}
              numberOfLines={1}
              style={styles.previewText}>
              {preview}
            </Text>
          </View>
          {item.unreadCount > 0 && <Badge count={item.unreadCount} />}
        </View>
      </View>
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
export function ChatListScreen({ navigation }: ChatScreenProps<'ChatList'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] =
    useState<Conversation[]>(DEMO_CONVERSATIONS);

  // Filter conversations by search
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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.pullToRefresh();
    // TODO: re-fetch conversations from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleArchive = useCallback(
    (id: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c)),
      );
    },
    [],
  );

  const handleDelete = useCallback(
    (id: string, name: string) => {
      // TODO: replace Alert with custom modal
      Alert.alert(
        'Delete conversation',
        `Delete your conversation with ${name}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setConversations((prev) => prev.filter((c) => c.id !== id));
            },
          },
        ],
      );
    },
    [],
  );

  const handleLongPress = useCallback(
    (item: Conversation) => {
      // TODO: replace with custom context menu / bottom sheet
      Alert.alert(item.name, undefined, [
        {
          text: 'Archive',
          onPress: () => handleArchive(item.id),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(item.id, item.name),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [handleArchive, handleDelete],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <SwipeableRow
        onArchive={() => handleArchive(item.id)}
        onDelete={() => handleDelete(item.id, item.name)}>
        <ChatRow
          item={item}
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
    [navigation, handleArchive, handleDelete, handleLongPress],
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
      {/* ── Header ── */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text variant="displayLg">Chats</Text>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            // TODO: open new chat / contact picker
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

      {/* ── Search ── */}
      <Animated.View
        entering={FadeInUp.delay(80).springify()}
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: searchFocused
              ? colors.borderFocus
              : colors.borderDefault,
          },
        ]}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke={colors.textTertiary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search..."
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.accentPrimary}
          returnKeyType="search"
          autoCorrect={false}
          style={[
            styles.searchInput,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.regular,
              fontSize: typography.bodySm.fontSize,
            },
          ]}
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              setSearch('');
            }}
            hitSlop={8}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke={colors.textTertiary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        )}
      </Animated.View>

      {/* ── List ── */}
      <FlatList
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
            onRefresh={handleRefresh}
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
                No results for &ldquo;{search}&rdquo;
              </Text>
              <Text
                variant="bodySm"
                color={colors.textTertiary}
                align="center"
                style={styles.noResultsSub}>
                Try a different search term
              </Text>
            </View>
          ) : (
            <EmptyState
              title="No conversations yet"
              description="Start a chat with someone to begin messaging"
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
              actionTitle="Start a chat"
              onAction={() => {
                // TODO: navigate to contacts or new chat picker
              }}
            />
          )
        }
        showsVerticalScrollIndicator={false}
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

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['16'],
    marginBottom: spacing['8'],
    paddingHorizontal: spacing['12'],
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing['8'],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },

  // List
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['4'],
  },
  rowName: {
    flex: 1,
    marginRight: spacing['8'],
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing['8'],
    gap: spacing['4'],
  },
  previewText: {
    flex: 1,
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing['16'] + 60 + spacing['12'], // align with text start
  },

  // Swipe backgrounds
  swipeBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['8'],
    paddingHorizontal: spacing['24'],
  },
  swipeBgLeft: {
    justifyContent: 'flex-start',
  },
  swipeBgRight: {
    justifyContent: 'flex-end',
  },
  swipeLabel: {
    fontWeight: '700',
  },

  // Empty / no results
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
});
