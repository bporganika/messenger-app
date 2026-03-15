import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Divider } from '../../components/ui';

type Visibility = 'everyone' | 'contacts' | 'nobody';

const VISIBILITY_KEYS: Record<Visibility, string> = {
  everyone: 'privacy.everyone',
  contacts: 'privacy.contactsOnly',
  nobody: 'privacy.nobody',
};

const CYCLE: Visibility[] = ['everyone', 'contacts', 'nobody'];

function nextVisibility(current: Visibility): Visibility {
  const idx = CYCLE.indexOf(current);
  return CYCLE[(idx + 1) % CYCLE.length];
}

export function PrivacyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [phone, setPhone] = useState<Visibility>('contacts');
  const [lastSeen, setLastSeen] = useState<Visibility>('everyone');
  const [avatar, setAvatar] = useState<Visibility>('everyone');

  const cycle = useCallback(
    (setter: (v: Visibility) => void, current: Visibility) => {
      haptics.buttonPress();
      setter(nextVisibility(current));
      // TODO: PATCH /api/v1/users/me/privacy
    },
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          {t('privacy.section')}
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault }]}>
          <PrivacyRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label={t('privacy.phoneNumber')}
            value={t(VISIBILITY_KEYS[phone])}
            onPress={() => cycle(setPhone, phone)}
          />
          <Divider inset={52} />
          <PrivacyRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={colors.textSecondary} strokeWidth={1.5} /><Path d="M12 6v6l4 2" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label={t('privacy.lastSeen')}
            value={t(VISIBILITY_KEYS[lastSeen])}
            onPress={() => cycle(setLastSeen, lastSeen)}
          />
          <Divider inset={52} />
          <PrivacyRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M12 3a4 4 0 100 8 4 4 0 000-8z" stroke={colors.textSecondary} strokeWidth={1.5} /></Svg>}
            label={t('privacy.profilePhoto')}
            value={t(VISIBILITY_KEYS[avatar])}
            onPress={() => cycle(setAvatar, avatar)}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.springify().delay(100)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
          {t('privacy.hint')}
        </Text>
      </Animated.View>
    </View>
  );
}

function PrivacyRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text variant="body" style={styles.rowLabel}>{label}</Text>
      <Text variant="bodySm" color={colors.accentPrimary}>
        {value}
      </Text>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={styles.chevron}>
        <Path d="M9 18l6-6-6-6" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['8'] },
  sectionLabel: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
    marginBottom: spacing['8'],
    letterSpacing: 0.8,
  },
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
  rowIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: spacing['12'],
  },
  rowLabel: { flex: 1 },
  chevron: { marginLeft: spacing['4'] },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
    lineHeight: 20,
  },
});
