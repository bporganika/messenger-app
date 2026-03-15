import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import type { AuthScreenProps } from '../../navigation/types';

import {
  AvatarPickerSection,
  GenderSelector,
  UsernameField,
  sanitizeUsername,
} from './components';
import type { GenderKey, UsernameStatus } from './components';

// ─── Constants ──────────────────────────────────────────
const STAGGER = 100;

function stagger(index: number) {
  return FadeInUp.delay(STAGGER * index)
    .springify()
    .damping(20)
    .stiffness(140);
}

// ─── Screen ─────────────────────────────────────────────
export function ProfileSetupScreen({
  route,
}: AuthScreenProps<'ProfileSetup'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Form state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [gender, setGender] = useState<GenderKey>('PREFER_NOT_TO_SAY');
  const [loading, setLoading] = useState(false);

  const isComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking';

  // ── Submit ──
  const handleComplete = useCallback(async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    haptics.buttonPress();

    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: sanitizeUsername(username),
        gender,
      };
      const response = await api.patch<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          username: string;
          avatarUrl: string | null;
        };
      }>('/users/me', profileData, {
        headers: { Authorization: `Bearer ${route.params.tempToken}` },
      });

      if (avatarUri) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: avatarUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as unknown as Blob);
        await api.upload('/users/me/avatar', formData);
      }

      setAuth(
        {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        response.user,
      );
    } catch {
      // Error is handled by the API layer
    } finally {
      setLoading(false);
    }
  }, [
    isComplete,
    loading,
    firstName,
    lastName,
    username,
    gender,
    avatarUri,
    route.params.tempToken,
    setAuth,
  ]);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing['32'],
            paddingBottom: insets.bottom + spacing['24'],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Heading */}
        <Animated.View entering={stagger(0)}>
          <Text variant="heading" align="center" style={styles.heading}>
            {t('profileSetup.title')}
          </Text>
        </Animated.View>

        {/* Avatar */}
        <Animated.View entering={stagger(1)} style={styles.avatarSection}>
          <AvatarPickerSection
            avatarUri={avatarUri}
            onAvatarChange={setAvatarUri}
          />
        </Animated.View>

        {/* First name */}
        <Animated.View entering={stagger(2)}>
          <Input
            label={t('profileSetup.firstName')}
            placeholder={t('profileSetup.firstNamePlaceholder')}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            textContentType="givenName"
            containerStyle={styles.field}
          />
        </Animated.View>

        {/* Last name */}
        <Animated.View entering={stagger(3)}>
          <Input
            label={t('profileSetup.lastName')}
            placeholder={t('profileSetup.lastNamePlaceholder')}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
            containerStyle={styles.field}
          />
        </Animated.View>

        {/* Username */}
        <Animated.View entering={stagger(4)}>
          <UsernameField
            value={username}
            status={usernameStatus}
            onChangeText={setUsername}
            onStatusChange={setUsernameStatus}
          />
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={stagger(5)}>
          <GenderSelector value={gender} onChange={setGender} />
        </Animated.View>

        <View style={styles.spacer} />

        {/* Complete */}
        <Animated.View entering={stagger(6)}>
          <Button
            title={t('profileSetup.complete')}
            variant="primary"
            size="lg"
            disabled={!isComplete}
            loading={loading}
            onPress={handleComplete}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['24'],
  },
  heading: {
    marginBottom: spacing['8'],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['32'],
  },
  field: {
    marginBottom: spacing['16'],
  },
  spacer: {
    flex: 1,
    minHeight: spacing['32'],
  },
});
