import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { Text, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

export function DeleteAccountScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingBottom: insets.bottom + spacing['24'],
        },
      ]}>
      <View style={styles.iconWrap}>
        <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
            stroke={colors.accentError}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <Text variant="heading" align="center" style={styles.title}>
        Delete your account?
      </Text>
      <Text
        variant="body"
        color={colors.textSecondary}
        align="center"
        style={styles.description}>
        This action cannot be undone. All your messages, contacts, and data will
        be permanently deleted after 30 days.
      </Text>

      <View style={styles.spacer} />

      <Button
        title="Delete my account"
        variant="danger"
        size="lg"
        loading={loading}
        onPress={() => {
          setLoading(true);
          // TODO: call DELETE /users/me
          setTimeout(() => {
            setLoading(false);
            logout();
          }, 800);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['24'],
    paddingTop: spacing['40'],
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing['20'],
  },
  title: {
    marginBottom: spacing['12'],
  },
  description: {
    paddingHorizontal: spacing['8'],
  },
  spacer: { flex: 1 },
});
