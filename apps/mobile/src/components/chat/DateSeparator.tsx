import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text } from '../ui';

export interface DateSeparatorProps {
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.dateSeparator}>
      <View
        style={[
          styles.datePill,
          { backgroundColor: colors.surfaceDefault },
        ]}>
        <Text variant="caption" color={colors.textTertiary}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    transform: [{ scaleY: -1 }],
  },
  datePill: {
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['4'],
    borderRadius: radius.full,
  },
});
