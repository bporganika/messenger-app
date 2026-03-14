import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text, Button } from '../../components/ui';

export function StorageScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault },
        ]}>
        <View style={styles.row}>
          <Text variant="body" style={styles.label}>Cache size</Text>
          <Text variant="bodySm" color={colors.textSecondary}>0 MB</Text>
        </View>
      </View>

      <Button
        title="Clear cache"
        variant="secondary"
        size="md"
        onPress={() => {
          // TODO: clear cache
        }}
        style={styles.clearBtn}
      />

      <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
        Clearing cache will remove locally stored media. Your messages will not be affected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['16'] },
  section: {
    marginHorizontal: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  label: { flex: 1 },
  clearBtn: {
    marginHorizontal: spacing['16'],
    marginTop: spacing['16'],
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['12'],
  },
});
