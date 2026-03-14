import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, radius, avatarSize } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button, Input, BottomSheet } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import type { AuthScreenProps } from '../../navigation/types';

// ─── Constants ──────────────────────────────────────────
const GENDERS = [
  { key: 'MALE', label: 'Male' },
  { key: 'FEMALE', label: 'Female' },
  { key: 'OTHER', label: 'Other' },
  { key: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

type GenderKey = (typeof GENDERS)[number]['key'];

const USERNAME_DEBOUNCE = 500;
const STAGGER = 100;
const AVATAR_DISPLAY = avatarSize['2xl']; // 120

function stagger(index: number) {
  return FadeInUp.delay(STAGGER * index)
    .springify()
    .damping(20)
    .stiffness(140);
}

// ─── Avatar Picker Circle ───────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AvatarPicker({
  uri,
  onPress,
}: {
  uri: string | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.avatarWrap, animStyle]}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : (
        <View
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
        </View>
      )}

      {/* Edit badge when image is set */}
      {uri && (
        <View
          style={[
            styles.editBadge,
            { backgroundColor: colors.accentPrimary },
          ]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={13} r={4} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>
        </View>
      )}
    </AnimatedPressable>
  );
}

// ─── Picker BottomSheet option ──────────────────────────
function PickerOption({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={[styles.pickerOption, { borderBottomColor: colors.separator }]}>
      {icon}
      <Text
        variant="bodyLg"
        color={color ?? colors.textPrimary}
        style={styles.pickerLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Username status indicator ──────────────────────────
function UsernameStatusIcon({
  status,
}: {
  status: 'idle' | 'checking' | 'available' | 'taken';
}) {
  const { colors } = useTheme();

  if (status === 'checking') {
    // Three animated dots
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

// ─── Gender chip ────────────────────────────────────────
function GenderChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.genderChip,
        {
          backgroundColor: selected
            ? colors.accentPrimary + '1A'
            : colors.surfaceDefault,
          borderColor: selected
            ? colors.accentPrimary
            : colors.borderDefault,
        },
        animStyle,
      ]}>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected
              ? colors.accentPrimary
              : colors.textTertiary,
          },
        ]}>
        {selected && (
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
        color={selected ? colors.accentPrimary : colors.textPrimary}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Screen ─────────────────────────────────────────────
export function ProfileSetupScreen({
  route,
}: AuthScreenProps<'ProfileSetup'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Form state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<GenderKey>('PREFER_NOT_TO_SAY');
  const [loading, setLoading] = useState(false);

  // Username uniqueness
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image picker sheet
  const [pickerVisible, setPickerVisible] = useState(false);

  const isComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.trim().length >= 3 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking';

  // ── Username change with debounce ──
  const handleUsernameChange = useCallback((value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (sanitized.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(() => {
      // TODO: call GET /api/v1/users/search?q=@{sanitized}
      // Simulate API — most usernames available, "taken" = taken
      const isTaken = sanitized === 'taken';
      setUsernameStatus(isTaken ? 'taken' : 'available');
    }, USERNAME_DEBOUNCE);
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Avatar picker handlers ──
  const handlePickFromCamera = useCallback(async () => {
    setPickerVisible(false);
    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    });
    if (result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    setPickerVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setPickerVisible(false);
    setAvatarUri(null);
  }, []);

  // ── Submit ──
  const handleComplete = useCallback(() => {
    if (!isComplete || loading) return;
    setLoading(true);
    haptics.buttonPress();

    // TODO: call PATCH /users/me with route.params.tempToken
    // TODO: if avatarUri → POST /users/me/avatar with FormData
    setTimeout(() => {
      setLoading(false);
      setAuth(
        { accessToken: 'demo-access', refreshToken: 'demo-refresh' },
        {
          id: 'demo-user',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username,
          avatarUrl: avatarUri,
        },
      );
    }, 800);
  }, [isComplete, loading, firstName, lastName, username, avatarUri, setAuth]);

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
            Set up your profile
          </Text>
        </Animated.View>

        {/* Avatar */}
        <Animated.View
          entering={stagger(1)}
          style={styles.avatarSection}>
          <AvatarPicker
            uri={avatarUri}
            onPress={() => setPickerVisible(true)}
          />
        </Animated.View>

        {/* First name */}
        <Animated.View entering={stagger(2)}>
          <Input
            label="First name"
            placeholder="John"
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
            label="Last name"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            textContentType="familyName"
            containerStyle={styles.field}
          />
        </Animated.View>

        {/* Username */}
        <Animated.View entering={stagger(4)}>
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
            rightIcon={<UsernameStatusIcon status={usernameStatus} />}
            error={
              usernameStatus === 'taken' ? 'Username is taken' : undefined
            }
            containerStyle={styles.field}
          />
          {usernameStatus === 'available' && (
            <Text
              variant="caption"
              color={colors.accentSuccess}
              style={styles.usernameHint}>
              Username is available
            </Text>
          )}
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={stagger(5)}>
          <Text
            variant="caption"
            color={colors.textSecondary}
            style={styles.genderLabel}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <GenderChip
                key={g.key}
                label={g.label}
                selected={gender === g.key}
                onPress={() => setGender(g.key)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Complete */}
        <Animated.View entering={stagger(6)}>
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

      {/* Image picker BottomSheet */}
      <BottomSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        snapPoint={avatarUri ? 0.35 : 0.28}>
        <Text variant="title" style={styles.sheetTitle}>
          Profile photo
        </Text>

        <PickerOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx={12}
                cy={13}
                r={4}
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
              />
            </Svg>
          }
          label="Take a photo"
          onPress={handlePickFromCamera}
        />

        <PickerOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                fill={colors.accentPrimary}
              />
              <Path
                d="M21 15l-5-5L5 21"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label="Choose from gallery"
          onPress={handlePickFromGallery}
        />

        {avatarUri && (
          <PickerOption
            icon={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                  stroke={colors.accentError}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
            label="Remove photo"
            color={colors.accentError}
            onPress={handleRemoveAvatar}
          />
        )}
      </BottomSheet>
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
  avatarWrap: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
  },
  avatarImage: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    marginTop: spacing['4'],
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginBottom: spacing['16'],
  },
  usernameHint: {
    marginTop: -spacing['12'],
    marginBottom: spacing['16'],
    marginLeft: spacing['4'],
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
  sheetTitle: {
    marginBottom: spacing['16'],
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['16'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing['12'],
  },
  pickerLabel: {
    flex: 1,
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
