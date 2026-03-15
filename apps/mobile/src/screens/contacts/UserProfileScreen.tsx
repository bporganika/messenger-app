import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar, Divider } from '../../components/ui';
import { api } from '../../services/api';
import type { ContactScreenProps } from '../../navigation/types';

function ActionCircle({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={styles.actionCircle}>
      <View
        style={[styles.actionCircleIcon, { backgroundColor: colors.surfaceDefault }]}>
        {icon}
      </View>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

export function UserProfileScreen({
  navigation,
  route,
}: ContactScreenProps<'UserProfile'>) {
  const { userId, name, avatarUrl } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['12'],
        paddingBottom: insets.bottom + spacing['32'],
      }}>
      {/* Back */}
      <Pressable
        onPress={() => {
          haptics.buttonPress();
          navigation.goBack();
        }}
        hitSlop={12}
        style={styles.back}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      {/* Avatar + Info */}
      <View style={styles.profileArea}>
        <Avatar uri={avatarUrl} name={name} size="xl" />
        <Text variant="heading" align="center" style={styles.name}>
          {name}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary}>
          @{name.toLowerCase().replace(/\s/g, '')}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <ActionCircle
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('userProfile.chat')}
          onPress={async () => {
            const data = await api.post<{ conversationId: string }>('/conversations', { userId });
            navigation.navigate('Chat' as never, { conversationId: data.conversationId, name, avatarUrl } as never);
          }}
        />
        <ActionCircle
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('userProfile.call')}
          onPress={() => {}}
        />
        <ActionCircle
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('userProfile.video')}
          onPress={() => {}}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Block / Report */}
      <Pressable
        onPress={async () => {
          haptics.error();
          await api.post('/blocks', { userId });
        }}
        style={styles.dangerRow}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            stroke={colors.accentError}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="body" color={colors.accentError}>
          {t('userProfile.blockUser')}
        </Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          haptics.buttonPress();
          await api.post('/reports', { userId });
        }}
        style={styles.dangerRow}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
            stroke={colors.accentWarning}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text variant="body" color={colors.accentWarning}>
          {t('userProfile.reportUser')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  back: {
    marginLeft: spacing['16'],
    marginBottom: spacing['16'],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileArea: {
    alignItems: 'center',
    marginBottom: spacing['24'],
  },
  name: {
    marginTop: spacing['16'],
    marginBottom: spacing['4'],
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['32'],
    marginBottom: spacing['24'],
  },
  actionCircle: {
    alignItems: 'center',
    gap: spacing['6'],
  },
  actionCircleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginHorizontal: spacing['24'],
    marginBottom: spacing['16'],
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['24'],
    paddingVertical: spacing['12'],
    gap: spacing['12'],
  },
});
