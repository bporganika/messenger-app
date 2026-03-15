import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar, Divider } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import type { SettingsScreenProps } from '../../navigation/types';

interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  screen: keyof import('../../navigation/types').SettingsStackParamList;
  danger?: boolean;
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SettingsScreen({
  navigation,
}: SettingsScreenProps<'Settings'>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const items: SettingsItem[] = [
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={12} cy={7} r={4} stroke={colors.textSecondary} strokeWidth={1.5} />
        </Svg>
      ),
      label: t('settings.editProfile'),
      screen: 'EditProfile',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.notifications'),
      screen: 'Notifications',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M19 11H5M19 11a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2M19 11V9a7 7 0 00-14 0v2" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.privacy'),
      screen: 'Privacy',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke={colors.textSecondary} strokeWidth={1.5} />
          <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.language'),
      screen: 'Language',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={5} stroke={colors.textSecondary} strokeWidth={1.5} />
          <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.appearance'),
      screen: 'Appearance',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.appLock'),
      screen: 'AppLock',
    },
    {
      icon: (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
      label: t('settings.storageData'),
      screen: 'Storage',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['12'],
        paddingBottom: insets.bottom + spacing['32'],
      }}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displayLg">{t('settings.title')}</Text>
      </View>

      {/* Profile card */}
      <Pressable
        onPress={() => {
          haptics.buttonPress();
          navigation.navigate('EditProfile');
        }}
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
          },
        ]}>
        <Avatar
          uri={user?.avatarUrl}
          name={user ? `${user.firstName} ${user.lastName}` : 'U'}
          size="lg"
        />
        <View style={styles.profileInfo}>
          <Text variant="title">
            {user ? `${user.firstName} ${user.lastName}` : t('settings.defaultUser')}
          </Text>
          <Text variant="bodySm" color={colors.textSecondary}>
            @{user?.username ?? t('settings.defaultUsername')}
          </Text>
        </View>
        <ChevronRight color={colors.textTertiary} />
      </Pressable>

      {/* Settings list */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
          },
        ]}>
        {items.map((item, i) => (
          <React.Fragment key={item.screen}>
            {i > 0 && <Divider inset={52} />}
            <Pressable
              onPress={() => {
                haptics.buttonPress();
                navigation.navigate(item.screen);
              }}
              style={styles.settingsRow}>
              <View style={styles.rowIcon}>{item.icon}</View>
              <Text variant="body" style={styles.rowLabel}>
                {item.label}
              </Text>
              <ChevronRight color={colors.textTertiary} />
            </Pressable>
          </React.Fragment>
        ))}
      </View>

      {/* Delete account */}
      <Pressable
        onPress={() => {
          haptics.error();
          navigation.navigate('DeleteAccount');
        }}
        style={[
          styles.dangerSection,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
          },
        ]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
            stroke={colors.accentError}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="body" color={colors.accentError}>
          {t('settings.deleteAccount')}
        </Text>
      </Pressable>

      {/* Version */}
      <Text
        variant="caption"
        color={colors.textTertiary}
        align="center"
        style={styles.version}>
        {t('settings.version')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['24'],
    marginBottom: spacing['20'],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['16'],
    padding: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing['12'],
    marginBottom: spacing['20'],
  },
  profileInfo: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing['20'],
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
    gap: spacing['12'],
  },
  rowIcon: {
    width: 24,
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  dangerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['16'],
    padding: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing['12'],
    marginBottom: spacing['24'],
  },
  version: {
    marginBottom: spacing['16'],
  },
});
