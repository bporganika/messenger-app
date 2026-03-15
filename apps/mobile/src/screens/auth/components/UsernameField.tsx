import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../design-system';
import { spacing } from '../../../design-system/tokens';
import { Text, Input } from '../../../components/ui';
import { api } from '../../../services/api';
import { useTranslation } from 'react-i18next';

// ─── Types ──────────────────────────────────────────────
export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export interface UsernameFieldProps {
  value: string;
  status: UsernameStatus;
  onChangeText: (value: string) => void;
  onStatusChange: (status: UsernameStatus) => void;
}

// ─── Constants ──────────────────────────────────────────
const USERNAME_DEBOUNCE = 500;

export function sanitizeUsername(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

// ─── Status Indicator ───────────────────────────────────
function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  const { colors } = useTheme();

  if (status === 'checking') {
    return (
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(i * 120).springify()}
            style={[styles.dot, { backgroundColor: colors.textTertiary }]}
          />
        ))}
      </View>
    );
  }

  if (status === 'available') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6L9 17l-5-5"
          stroke={colors.accentSuccess}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (status === 'taken') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 6L6 18M6 6l12 12"
          stroke={colors.accentError}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return null;
}

// ─── Main Component ─────────────────────────────────────
export function UsernameField({
  value,
  status,
  onChangeText,
  onStatusChange,
}: UsernameFieldProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (raw: string) => {
      const sanitized = sanitizeUsername(raw);
      onChangeText(sanitized);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (sanitized.length < 3) {
        onStatusChange('idle');
        return;
      }

      onStatusChange('checking');
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await api.get<{ available: boolean }>(
            '/users/check-username',
            { params: { username: sanitized } },
          );
          onStatusChange(result.available ? 'available' : 'taken');
        } catch {
          onStatusChange('idle');
        }
      }, USERNAME_DEBOUNCE);
    },
    [onChangeText, onStatusChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <View>
      <Input
        label={t('profileSetup.username')}
        placeholder={t('profileSetup.usernamePlaceholder')}
        value={value}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        leftIcon={
          <Text variant="body" color={colors.textTertiary}>
            @
          </Text>
        }
        rightIcon={<UsernameStatusIcon status={status} />}
        error={
          status === 'taken'
            ? t('profileSetup.usernameTaken')
            : undefined
        }
        containerStyle={styles.field}
      />
      {status === 'available' && (
        <Text
          variant="caption"
          color={colors.accentSuccess}
          style={styles.usernameHint}>
          {t('profileSetup.usernameAvailable')}
        </Text>
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  field: {
    marginBottom: spacing['16'],
  },
  usernameHint: {
    marginTop: -spacing['12'],
    marginBottom: spacing['16'],
    marginLeft: spacing['4'],
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
