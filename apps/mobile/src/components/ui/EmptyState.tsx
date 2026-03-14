import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text variant="title" align="center" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text
          variant="bodySm"
          color={colors.textSecondary}
          align="center"
          style={styles.description}>
          {description}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['32'],
  },
  icon: {
    marginBottom: spacing['20'],
  },
  title: {
    marginBottom: spacing['8'],
  },
  description: {
    marginBottom: spacing['24'],
  },
  action: {
    minWidth: 160,
  },
});
