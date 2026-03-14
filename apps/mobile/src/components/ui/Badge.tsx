import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text } from './Text';

export interface BadgeProps {
  count: number;
  maxCount?: number;
  style?: ViewStyle;
}

export function Badge({ count, maxCount = 99, style }: BadgeProps) {
  const { colors } = useTheme();

  if (count <= 0) return null;

  const label = count > maxCount ? `${maxCount}+` : `${count}`;
  const isWide = label.length > 1;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.accentError,
          minWidth: 20,
          paddingHorizontal: isWide ? spacing['6'] : 0,
        },
        style,
      ]}>
      <Text variant="caption" color="#FFFFFF" style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
