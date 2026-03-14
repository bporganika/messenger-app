import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text, Switch, Divider } from '../../components/ui';

export function AppLockScreen() {
  const { colors } = useTheme();
  const [biometric, setBiometric] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault },
        ]}>
        <View style={styles.row}>
          <Text variant="body" style={styles.label}>Face ID / Touch ID</Text>
          <Switch value={biometric} onValueChange={setBiometric} />
        </View>
        <Divider inset={16} />
        <View style={styles.row}>
          <Text variant="body" style={styles.label}>PIN Code</Text>
          <Switch value={pinEnabled} onValueChange={setPinEnabled} />
        </View>
      </View>

      <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
        When enabled, Pulse will ask for authentication every time you open the app
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
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['12'],
  },
});
