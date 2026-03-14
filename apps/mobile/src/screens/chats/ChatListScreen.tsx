import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, EmptyState } from '../../components/ui';
import type { ChatScreenProps } from '../../navigation/types';

export function ChatListScreen({ navigation }: ChatScreenProps<'ChatList'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  // TODO: replace with real data from API/store
  const conversations: never[] = [];

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
      <View style={styles.header}>
        <Text variant="displayLg">Chats</Text>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            // TODO: open new chat picker
          }}
          hitSlop={8}
          style={[styles.composeBtn, { backgroundColor: colors.surfaceDefault }]}>
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
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
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
        <View style={styles.searchInputWrap}>
          <Text variant="bodySm" color={colors.textPlaceholder}>
            Search...
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={conversations}
        keyExtractor={(item, i) => String(i)}
        renderItem={() => null}
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No conversations yet"
            description="Start a chat with someone to begin messaging"
            actionTitle="Start a chat"
            onAction={() => {
              // TODO: open contact picker
            }}
          />
        }
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
  searchInputWrap: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing['16'],
  },
  emptyContainer: {
    flex: 1,
  },
});
