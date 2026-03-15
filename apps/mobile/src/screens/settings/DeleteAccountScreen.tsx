import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

const CONFIRM_WORD = 'DELETE';

const CONSEQUENCE_KEYS = [
  'deleteAccountScreen.consequence1',
  'deleteAccountScreen.consequence2',
  'deleteAccountScreen.consequence3',
  'deleteAccountScreen.consequence4',
] as const;

export function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const isConfirmed = useMemo(
    () => confirmation.trim().toUpperCase() === CONFIRM_WORD,
    [confirmation],
  );

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleDelete = () => {
    haptics.error();
    setLoading(true);
    // TODO: DELETE /api/v1/users/me
    setTimeout(() => {
      setLoading(false);
      logout();
    }, 1200);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingBottom: insets.bottom + spacing['24'],
        },
      ]}>
      {/* Warning icon */}
      <Animated.View entering={FadeInUp.springify()} style={styles.iconWrap}>
        <Animated.View style={[styles.iconCircle, { backgroundColor: colors.accentError + '15' }, pulseStyle]}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
              stroke={colors.accentError}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInUp.springify().delay(80)}>
        <Text variant="heading" align="center" style={styles.title}>
          {t('deleteAccountScreen.title')}
        </Text>
      </Animated.View>

      {/* Consequences */}
      <Animated.View entering={FadeInUp.springify().delay(160)} style={styles.consequencesWrap}>
        {CONSEQUENCE_KEYS.map((key) => (
          <View key={key} style={styles.consequenceRow}>
            <View style={[styles.bullet, { backgroundColor: colors.accentError }]} />
            <Text variant="bodySm" color={colors.textSecondary} style={styles.consequenceText}>
              {t(key)}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Confirmation input */}
      <Animated.View entering={FadeInUp.springify().delay(240)}>
        <Text variant="bodySm" color={colors.textSecondary} style={styles.confirmLabel}>
          {t('deleteAccountScreen.confirmLabel', { word: CONFIRM_WORD })
            .split(CONFIRM_WORD)
            .reduce<React.ReactNode[]>((acc, part, i, arr) => {
              acc.push(part);
              if (i < arr.length - 1) {
                acc.push(
                  <Text key={i} variant="bodySm" color={colors.accentError} style={{ fontWeight: '700' }}>
                    {CONFIRM_WORD}
                  </Text>,
                );
              }
              return acc;
            }, [])}
        </Text>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surfaceDefault,
              borderColor: isConfirmed ? colors.accentError : colors.borderDefault,
            },
          ]}>
          <TextInput
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder={t('deleteAccountScreen.confirmPlaceholder')}
            placeholderTextColor={colors.textPlaceholder}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>
      </Animated.View>

      <View style={styles.spacer} />

      {/* Delete button */}
      <Animated.View entering={FadeInUp.springify().delay(320)}>
        <Button
          title={t('deleteAccountScreen.deleteButton')}
          variant="danger"
          size="lg"
          disabled={!isConfirmed}
          loading={loading}
          onPress={handleDelete}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['24'],
    paddingTop: spacing['32'],
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing['20'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginBottom: spacing['20'] },
  consequencesWrap: {
    marginBottom: spacing['24'],
    gap: spacing['12'],
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['12'],
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  consequenceText: { flex: 1 },
  confirmLabel: {
    marginBottom: spacing['8'],
  },
  inputWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing['16'],
  },
  input: {
    height: 48,
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '600',
  },
  spacer: { flex: 1 },
});
