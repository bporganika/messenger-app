import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text, Switch, Divider } from '../../components/ui';

export function NotificationsScreen() {
  const { colors } = useTheme();
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [previews, setPreviews] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault },
        ]}>
        <Row label="Sound" value={sound} onToggle={setSound} />
        <Divider inset={16} />
        <Row label="Vibration" value={vibration} onToggle={setVibration} />
        <Divider inset={16} />
        <Row label="Message previews" value={previews} onToggle={setPreviews} />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.rowLabel}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onToggle} />
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
  rowLabel: { flex: 1 },
});
