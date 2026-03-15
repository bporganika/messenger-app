import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import Contacts from 'react-native-contacts';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar, EmptyState } from '../../components/ui';
import type { ContactScreenProps } from '../../navigation/types';

// ─── Types ──────────────────────────────────────────────
type OnlineStatus = 'online' | 'offline' | 'away';

interface PulseContact {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  phone?: string;
}

interface SearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

// ─── Demo data ──────────────────────────────────────────
const DEMO_CONTACTS: PulseContact[] = [
  {
    id: 'u1',
    name: 'John Doe',
    username: 'johndoe',
    onlineStatus: 'online',
  },
  {
    id: 'u2',
    name: 'Anna Smith',
    username: 'annasmith',
    onlineStatus: 'offline',
  },
  {
    id: 'u3',
    name: 'Ali Yılmaz',
    username: 'aliyilmaz',
    onlineStatus: 'online',
  },
  {
    id: 'u4',
    name: 'Maria García',
    username: 'mariagarcia',
    onlineStatus: 'away',
  },
  {
    id: 'u5',
    name: 'David Chen',
    username: 'davidchen',
    onlineStatus: 'offline',
  },
];

// ─── Action row ─────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionRow({
  icon,
  label,
  subtitle,
  onPress,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  loading?: boolean;
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

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.actionRow,
        {
          backgroundColor: colors.surfaceDefault,
          borderColor: colors.borderDefault,
        },
        animStyle,
      ]}>
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: colors.accentPrimary + '1A' },
        ]}>
        {icon}
      </View>
      <View style={styles.actionTextWrap}>
        <Text variant="body" style={styles.actionLabel}>
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.textTertiary}>
            {subtitle}
          </Text>
        )}
      </View>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 18l6-6-6-6"
          stroke={colors.textTertiary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </AnimatedPressable>
  );
}

// ─── Contact row ────────────────────────────────────────
function ContactRow({
  contact,
  onPress,
}: {
  contact: PulseContact;
  onPress: () => void;
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

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.contactRow, animStyle]}>
      <Avatar
        uri={contact.avatarUrl}
        name={contact.name}
        size="md"
        status={contact.onlineStatus}
      />
      <View style={styles.contactInfo}>
        <Text variant="bodyLg" numberOfLines={1} style={styles.contactName}>
          {contact.name}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} numberOfLines={1}>
          @{contact.username}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// ─── Search result row ──────────────────────────────────
function SearchResultRow({
  result,
  onPress,
}: {
  result: SearchResult;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={styles.contactRow}>
      <Avatar uri={result.avatarUrl} name={result.name} size="md" />
      <View style={styles.contactInfo}>
        <Text variant="bodyLg" numberOfLines={1} style={styles.contactName}>
          {result.name}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} numberOfLines={1}>
          @{result.username}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Separator ──────────────────────────────────────────
function ItemSeparator() {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.separator, { backgroundColor: colors.separator }]}
    />
  );
}

// ─── Screen ─────────────────────────────────────────────
export function ContactsScreen({
  navigation,
}: ContactScreenProps<'Contacts'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [contacts, setContacts] = useState<PulseContact[]>(DEMO_CONTACTS);
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
    debounceRef.current = setTimeout(() => {
      // TODO: call GET /api/v1/users/search?q={text}
      // Simulate API search
      const q = text.toLowerCase().replace('@', '');
      const results: SearchResult[] = DEMO_CONTACTS.filter(
        (c) =>
          c.username.includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(text)),
      ).map((c) => ({
        id: c.id,
        name: c.name,
        username: c.username,
        avatarUrl: c.avatarUrl,
      }));
      setSearchResults(results);
      setSearching(false);
    }, 500);
  }, []);

  // ── Sync contacts ──
  const handleSyncContacts = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      // Request permission
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        setSyncing(false);
        // TODO: show toast — "Contacts permission denied"
        // Offer to open settings
        if (Platform.OS === 'ios') {
          Linking.openSettings();
        }
        return;
      }

      // Get all device contacts
      const deviceContacts = await Contacts.getAll();

      // Extract phone numbers
      const phones = deviceContacts
        .flatMap((c) => c.phoneNumbers.map((p) => p.number))
        .filter(Boolean);

      // TODO: call POST /api/v1/contacts/sync { phones }
      // For now simulate: mark as synced
      setTimeout(() => {
        setSyncing(false);
        setSynced(true);
        haptics.success();
      }, 800);
    } catch {
      setSyncing(false);
      // TODO: show error toast
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

  // ── Refresh ──
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.pullToRefresh();
    // TODO: GET /api/v1/contacts
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ── Filtered contacts (local filter) ──
  const isSearching = search.trim().length > 0;

  // ── List header (actions + section title) ──
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Actions */}
        <View style={styles.actions}>
          <ActionRow
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                  stroke={colors.accentPrimary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  stroke={colors.accentPrimary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
            label={t('contacts.inviteFriends')}
            subtitle={t('contacts.inviteSubtitle')}
            onPress={handleInvite}
          />
          <ActionRow
            icon={
              synced ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17l-5-5"
                    stroke={colors.accentSuccess}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M17 1l4 4-4 4"
                    stroke={colors.accentPrimary}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"
                    stroke={colors.accentPrimary}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M21 13v2a4 4 0 01-4 4H3"
                    stroke={colors.accentPrimary}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )
            }
            label={synced ? t('contacts.contactsSynced') : t('contacts.syncContacts')}
            subtitle={
              synced
                ? t('contacts.phoneSynced')
                : t('contacts.findFromPhoneBook')
            }
            onPress={handleSyncContacts}
            loading={syncing}
          />
        </View>

        {/* Section header */}
        <Text
          variant="caption"
          color={colors.textTertiary}
          style={styles.sectionLabel}>
          {t('contacts.onPulse')}
        </Text>
      </View>
    ),
    [colors, handleInvite, handleSyncContacts, synced, syncing, t],
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
          onChangeText={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder={t('contacts.searchPlaceholder')}
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.accentPrimary}
          returnKeyType="search"
          autoCapitalize="none"
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
              setSearchResults([]);
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
            searching ? (
              <View style={styles.searchingWrap}>
                <Text variant="body" color={colors.textTertiary}>
                  {t('contacts.searching')}
                </Text>
              </View>
            ) : (
              <View style={styles.noResults}>
                <Svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  fill="none">
                  <Path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke={colors.textTertiary}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  variant="body"
                  color={colors.textTertiary}
                  align="center"
                  style={styles.noResultsText}>
                  {t('contacts.noResultsFor', { query: search })}
                </Text>
                <Text
                  variant="bodySm"
                  color={colors.textTertiary}
                  align="center">
                  {t('contacts.tryDifferentContact')}
                </Text>
              </View>
            )
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

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['16'],
    marginBottom: spacing['16'],
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

  // Actions
  actions: {
    paddingHorizontal: spacing['16'],
    gap: spacing['8'],
    marginBottom: spacing['20'],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing['12'],
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionLabel: {
    fontWeight: '600',
  },

  // Section
  sectionLabel: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['8'],
    letterSpacing: 1,
  },

  // Contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing['12'],
  },
  contactName: {
    fontWeight: '600',
    marginBottom: spacing['2'],
  },

  // Separator
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing['16'] + 44 + spacing['12'],
  },

  // List
  list: {
    paddingBottom: spacing['16'],
  },
  emptyContainer: {
    flex: 1,
  },

  // Search states
  searchingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['48'],
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['32'],
    paddingTop: spacing['48'],
    gap: spacing['8'],
  },
  noResultsText: {
    marginTop: spacing['8'],
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
