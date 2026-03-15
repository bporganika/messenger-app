import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text } from '../ui';
import { ActionRow } from './ActionRow';

// ─── Types ──────────────────────────────────────────────
export interface ContactsListHeaderProps {
  synced: boolean;
  syncing: boolean;
  onInvite: () => void;
  onSyncContacts: () => void;
}

// ─── Component ──────────────────────────────────────────
export function ContactsListHeader({
  synced,
  syncing,
  onInvite,
  onSyncContacts,
}: ContactsListHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
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
          onPress={onInvite}
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
          onPress={onSyncContacts}
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
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  actions: {
    paddingHorizontal: spacing['16'],
    gap: spacing['8'],
    marginBottom: spacing['20'],
  },
  sectionLabel: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['8'],
    letterSpacing: 1,
  },
});
