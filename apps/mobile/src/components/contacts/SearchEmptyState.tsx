import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text } from '../ui';

// ─── Types ──────────────────────────────────────────────
export interface SearchEmptyStateProps {
  query: string;
  searching: boolean;
}

// ─── Component ──────────────────────────────────────────
export function SearchEmptyState({ query, searching }: SearchEmptyStateProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (searching) {
    return (
      <View style={styles.searchingWrap}>
        <Text variant="body" color={colors.textTertiary}>
          {t('contacts.searching')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.noResults}>
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
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
        {t('contacts.noResultsFor', { query })}
      </Text>
      <Text variant="bodySm" color={colors.textTertiary} align="center">
        {t('contacts.tryDifferentContact')}
      </Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
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
});
