import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';

// ─── Component ──────────────────────────────────────────
export function ItemSeparator() {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.separator, { backgroundColor: colors.separator }]}
    />
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing['16'] + 44 + spacing['12'],
  },
});
