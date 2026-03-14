import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';

export interface DividerProps {
  inset?: number;
  style?: ViewStyle;
}

export function Divider({ inset = 0, style }: DividerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.separator,
          marginLeft: inset,
          marginVertical: spacing['2'],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
  },
});
