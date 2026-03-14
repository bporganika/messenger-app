import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import type { AuthScreenProps } from '../../navigation/types';

const GENDERS = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
  { key: 'OTHER', label: 'Other' },
  { key: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

type GenderKey = (typeof GENDERS)[number]['key'];

export function ProfileSetupScreen({
  route,
}: AuthScreenProps<'ProfileSetup'>) {
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<GenderKey>('PREFER_NOT_TO_SAY');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const isComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3;

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    if (sanitized.length >= 3) {
      setUsernameStatus('checking');
      // TODO: debounce + call GET /users/search?q=@username
      setTimeout(() => setUsernameStatus('available'), 500);
    } else {
      setUsernameStatus('idle');
    }
  };

  const handleComplete = () => {
    if (!isComplete) return;
    setLoading(true);
    // TODO: call PATCH /users/me with tempToken
    setTimeout(() => {
      setLoading(false);
      setAuth(
        { accessToken: 'demo-access', refreshToken: 'demo-refresh' },
        {
          id: 'demo-user',
          firstName,
          lastName,
          username,
          avatarUrl: null,
        },
      );
    }, 800);
  };

  const usernameRight =
    usernameStatus === 'available' ? (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6L9 17l-5-5"
          stroke={colors.accentSuccess}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ) : usernameStatus === 'taken' ? (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 6L6 18M6 6l12 12"
          stroke={colors.accentError}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ) : undefined;

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
        keyboardShouldPersistTaps="handled">
        {/* Heading */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text variant="heading" align="center" style={styles.heading}>
            Set up your profile
          </Text>
        </Animated.View>

        {/* Avatar placeholder */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              // TODO: image picker
            }}
            style={[
              styles.avatarPlaceholder,
              { borderColor: colors.borderDefault },
            ]}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke={colors.textTertiary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx={12}
                cy={13}
                r={4}
                stroke={colors.textTertiary}
                strokeWidth={1.5}
              />
            </Svg>
            <Text
              variant="caption"
              color={colors.textTertiary}
              style={styles.avatarLabel}>
              Add photo
            </Text>
          </Pressable>
        </Animated.View>

        {/* Form fields */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Input
            label="First name"
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            textContentType="givenName"
            containerStyle={styles.field}
          />

          <Input
            label="Last name"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
            containerStyle={styles.field}
          />

          <Input
            label="Username"
            placeholder="johndoe"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            leftIcon={
              <Text variant="body" color={colors.textTertiary}>
                @
              </Text>
            }
            rightIcon={usernameRight}
            error={usernameStatus === 'taken' ? 'Username is taken' : undefined}
            containerStyle={styles.field}
          />
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Text
            variant="caption"
            color={colors.textSecondary}
            style={styles.genderLabel}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <Pressable
                key={g.key}
                onPress={() => {
                  haptics.buttonPress();
                  setGender(g.key);
                }}
                style={[
                  styles.genderChip,
                  {
                    backgroundColor:
                      gender === g.key
                        ? colors.accentPrimary + '1A'
                        : colors.surfaceDefault,
                    borderColor:
                      gender === g.key
                        ? colors.accentPrimary
                        : colors.borderDefault,
                  },
                ]}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor:
                        gender === g.key
                          ? colors.accentPrimary
                          : colors.textTertiary,
                    },
                  ]}>
                  {gender === g.key && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.accentPrimary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  variant="bodySm"
                  color={
                    gender === g.key
                      ? colors.accentPrimary
                      : colors.textPrimary
                  }>
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Complete */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Button
            title="Complete Setup"
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['24'],
  },
  heading: {
    marginBottom: spacing['24'],
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing['32'],
  },
  avatarLabel: {
    marginTop: spacing['4'],
  },
  field: {
    marginBottom: spacing['16'],
  },
  genderLabel: {
    marginBottom: spacing['8'],
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['8'],
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing['6'],
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spacer: {
    flex: 1,
    minHeight: spacing['32'],
  },
});
