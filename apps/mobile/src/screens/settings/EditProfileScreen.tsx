import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Input, Button, Avatar, BottomSheet } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export function EditProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleUsernameChange = useCallback(
    (text: string) => {
      const clean = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setUsername(clean);
      setUsernameStatus('idle');
      if (timerRef.current) clearTimeout(timerRef.current);
      if (clean.length >= 3 && clean !== user?.username) {
        setUsernameStatus('checking');
        timerRef.current = setTimeout(() => {
          // TODO: GET /api/v1/users/search?q=@clean
          setUsernameStatus(clean === 'taken' ? 'taken' : 'available');
        }, 500);
      }
    },
    [user?.username],
  );

  const hasChanges = useMemo(
    () =>
      firstName !== (user?.firstName ?? '') ||
      lastName !== (user?.lastName ?? '') ||
      username !== (user?.username ?? '') ||
      avatarUri !== user?.avatarUrl,
    [firstName, lastName, username, avatarUri, user],
  );

  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    username.length >= 3 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking';

  const handlePickAvatar = useCallback((type: 'camera' | 'gallery') => {
    setPickerVisible(false);
    const opts = { mediaType: 'photo' as const, maxWidth: 800, maxHeight: 800, quality: 0.8 as const };
    const launcher = type === 'camera' ? launchCamera : launchImageLibrary;
    launcher(opts, (res) => {
      if (res.assets?.[0]?.uri) setAvatarUri(res.assets[0].uri);
    });
  }, []);

  const avatarScale = useSharedValue(1);
  const avatarAnim = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgPrimary }]}
        contentContainerStyle={{
          paddingTop: spacing['24'],
          paddingBottom: insets.bottom + spacing['24'],
        }}
        keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <Animated.View entering={FadeInUp.springify()} style={styles.avatarWrap}>
          <Pressable
            onPressIn={() => { avatarScale.value = withSpring(0.95, springs.snappy); }}
            onPressOut={() => { avatarScale.value = withSpring(1, springs.snappy); }}
            onPress={() => { haptics.buttonPress(); setPickerVisible(true); }}>
            <Animated.View style={avatarAnim}>
              <Avatar uri={avatarUri} name={firstName || 'U'} size="2xl" />
              <View style={[styles.cameraBadge, { backgroundColor: colors.accentPrimary }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="12" cy="13" r="4" stroke="#FFF" strokeWidth={2} />
                </Svg>
              </View>
            </Animated.View>
          </Pressable>
          <Pressable onPress={() => { haptics.buttonPress(); setPickerVisible(true); }}>
            <Text variant="bodySm" color={colors.accentPrimary} style={styles.changeLabel}>
              Change photo
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.springify().delay(80)}>
          <Input label="First name" value={firstName} onChangeText={setFirstName} textContentType="givenName" containerStyle={styles.field} />
        </Animated.View>
        <Animated.View entering={FadeInUp.springify().delay(160)}>
          <Input label="Last name" value={lastName} onChangeText={setLastName} textContentType="familyName" containerStyle={styles.field} />
        </Animated.View>
        <Animated.View entering={FadeInUp.springify().delay(240)}>
          <Input
            label="Username"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            leftIcon={<Text variant="body" color={colors.textTertiary}>@</Text>}
            rightIcon={
              usernameStatus === 'checking' ? <Text variant="caption" color={colors.textTertiary}>...</Text>
              : usernameStatus === 'available' ? <Text variant="caption" color={colors.accentSuccess}>✓</Text>
              : usernameStatus === 'taken' ? <Text variant="caption" color={colors.accentError}>✗</Text>
              : null
            }
            error={usernameStatus === 'taken' ? 'Username is already taken' : undefined}
            containerStyle={styles.field}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.springify().delay(320)}>
          <Button
            title="Save changes"
            variant="primary"
            size="lg"
            disabled={!hasChanges || !canSave}
            loading={saving}
            onPress={() => {
              haptics.buttonPress();
              setSaving(true);
              // TODO: PATCH /api/v1/users/me
              setTimeout(() => setSaving(false), 800);
            }}
            style={styles.saveBtn}
          />
        </Animated.View>
      </ScrollView>

      <BottomSheet visible={pickerVisible} onClose={() => setPickerVisible(false)} snapPoint={avatarUri ? 230 : 180}>
        <View style={styles.pickerContent}>
          <PickerRow label="Take photo" color={colors.textPrimary} onPress={() => handlePickAvatar('camera')}
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={colors.accentPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="13" r="4" stroke={colors.accentPrimary} strokeWidth={1.5} /></Svg>} />
          <PickerRow label="Choose from gallery" color={colors.textPrimary} onPress={() => handlePickAvatar('gallery')}
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke={colors.accentPrimary} strokeWidth={1.5} strokeLinecap="round" /><Path d="M21 15l-5-5L5 21" stroke={colors.accentPrimary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="8.5" cy="8.5" r="1.5" stroke={colors.accentPrimary} strokeWidth={1.5} /></Svg>} />
          {avatarUri && (
            <PickerRow label="Remove photo" color={colors.accentError} onPress={() => { setPickerVisible(false); setAvatarUri(undefined); }}
              icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={colors.accentError} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>} />
          )}
        </View>
      </BottomSheet>
    </>
  );
}

function PickerRow({ icon, label, color, onPress }: { icon: React.ReactNode; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={() => { haptics.buttonPress(); onPress(); }} style={styles.pickerRow}>
      {icon}
      <Text variant="body" color={color}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginBottom: spacing['32'] },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  changeLabel: { marginTop: spacing['8'] },
  field: { marginBottom: spacing['16'], marginHorizontal: spacing['24'] },
  saveBtn: { marginHorizontal: spacing['24'], marginTop: spacing['16'] },
  pickerContent: { paddingHorizontal: spacing['8'] },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing['16'], paddingVertical: spacing['16'],
    gap: spacing['16'],
  },
});
