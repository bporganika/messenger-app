import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../ui';
import type { SearchResult } from './types';

// ─── Types ──────────────────────────────────────────────
export interface SearchResultRowProps {
  result: SearchResult;
  onPress: () => void;
}

// ─── Component ──────────────────────────────────────────
export function SearchResultRow({ result, onPress }: SearchResultRowProps) {
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

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  contactInfo: {
    flex: 1,
    marginStart: spacing['12'],
  },
  contactName: {
    fontWeight: '600',
    marginBottom: spacing['2'],
  },
});
