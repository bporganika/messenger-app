import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import Contacts from 'react-native-contacts';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, EmptyState } from '../../components/ui';
import {
  ContactSearchBar,
  ContactsListHeader,
  ContactRow,
  SearchResultRow,
  SearchEmptyState,
  ItemSeparator,
} from '../../components/contacts';
import type { PulseContact, SearchResult } from '../../components/contacts';
import { api } from '../../services/api';
import type { ContactScreenProps } from '../../navigation/types';

// ─── Screen ─────────────────────────────────────────────
export function ContactsScreen({
  navigation,
}: ContactScreenProps<'Contacts'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [contacts, setContacts] = useState<PulseContact[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Search ──
  const handleSearch = useCallback((text: string) => {
    setSearch(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.get<{ users: SearchResult[] }>('/users/search', { params: { q: text } });
        setSearchResults(data.users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  // ── Sync contacts ──
  const handleSyncContacts = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        setSyncing(false);
        if (Platform.OS === 'ios') {
          Linking.openSettings();
        }
        return;
      }

      const deviceContacts = await Contacts.getAll();
      const phones = deviceContacts
        .flatMap((c) => c.phoneNumbers.map((p) => p.number))
        .filter(Boolean);

      await api.post('/contacts/sync', { phones });
      setSyncing(false);
      setSynced(true);
      haptics.success();
    } catch {
      setSyncing(false);
    }
  }, [syncing]);

  // ── Invite ──
  const handleInvite = useCallback(() => {
    navigation.navigate('Invite');
  }, [navigation]);

  // ── Navigate to profile ──
  const handleOpenProfile = useCallback(
    (userId: string, contactName: string, avatarUrl?: string) => {
      navigation.navigate('UserProfile', {
        userId,
        name: contactName,
        avatarUrl,
      });
    },
    [navigation],
  );

  // ── Load contacts ──
  const loadContacts = useCallback(async () => {
    try {
      const data = await api.get<{ contacts: PulseContact[] }>('/contacts');
      setContacts(data.contacts);
    } catch {
      // silently fail on load
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // ── Refresh ──
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.pullToRefresh();
    try {
      const data = await api.get<{ contacts: PulseContact[] }>('/contacts');
      setContacts(data.contacts);
    } catch {
      // silently fail on refresh
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Search clear ──
  const handleClearSearch = useCallback(() => {
    setSearch('');
    setSearchResults([]);
  }, []);

  // ── Derived state ──
  const isSearching = search.trim().length > 0;

  // ── List header (memoised) ──
  const ListHeader = useMemo(
    () => (
      <ContactsListHeader
        synced={synced}
        syncing={syncing}
        onInvite={handleInvite}
        onSyncContacts={handleSyncContacts}
      />
    ),
    [synced, syncing, handleInvite, handleSyncContacts],
  );

  // ── Render ──
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
        <Text variant="displayLg">{t('tabs.contacts')}</Text>
      </Animated.View>

      {/* Search */}
      <ContactSearchBar
        value={search}
        focused={searchFocused}
        onChangeText={handleSearch}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        onClear={handleClearSearch}
      />

      {/* ── Search results mode ── */}
      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultRow
              result={item}
              onPress={() =>
                handleOpenProfile(item.id, item.name, item.avatarUrl)
              }
            />
          )}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={
            searchResults.length === 0 ? styles.emptyContainer : styles.list
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <SearchEmptyState query={search} searching={searching} />
          }
        />
      ) : (
        /* ── Contacts list mode ── */
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactRow
              contact={item}
              onPress={() =>
                handleOpenProfile(item.id, item.name, item.avatarUrl)
              }
            />
          )}
          ListHeaderComponent={ListHeader}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={
            contacts.length === 0 ? styles.emptyContainer : styles.list
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
              title={t('contacts.findFriends')}
              description={t('contacts.findFriendsDesc')}
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
                      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                      stroke={colors.accentPrimary}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              }
              actionTitle={t('contacts.syncContacts')}
              onAction={handleSyncContacts}
            />
          }
        />
      )}
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
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
