import React from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, EmptyState } from '../../components/ui';
import type { ContactScreenProps } from '../../navigation/types';

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={[
        styles.actionRow,
        {
          backgroundColor: colors.surfaceDefault,
          borderColor: colors.borderDefault,
        },
      ]}>
      {icon}
      <Text variant="body" style={styles.actionLabel}>
        {label}
      </Text>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 18l6-6-6-6"
          stroke={colors.textTertiary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

export function ContactsScreen({ navigation }: ContactScreenProps<'Contacts'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // TODO: replace with real data
  const contacts: never[] = [];

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
        <Text variant="displayLg">Contacts</Text>
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
        <Text variant="bodySm" color={colors.textPlaceholder}>
          Search by @username or phone
        </Text>
      </View>

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
          label="Invite friends"
          onPress={() => navigation.navigate('Invite')}
        />
        <ActionRow
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label="Sync contacts"
          onPress={() => {
            // TODO: request contacts permission + sync
          }}
        />
      </View>

      {/* Section label */}
      <Text
        variant="caption"
        color={colors.textTertiary}
        style={styles.sectionLabel}>
        ON PULSE
      </Text>

      {/* Contact list */}
      <FlatList
        data={contacts}
        keyExtractor={(_, i) => String(i)}
        renderItem={() => null}
        contentContainerStyle={
          contacts.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="Find friends"
            description="Sync your contacts or search by username to find people on Pulse"
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
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['12'],
  },
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
  actionLabel: {
    flex: 1,
  },
  sectionLabel: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['8'],
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: spacing['16'],
  },
  emptyContainer: {
    flex: 1,
  },
});
