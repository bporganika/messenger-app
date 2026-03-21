import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Switch } from '../../components/ui';
import { useAppLockStore } from '../../stores/appLockStore';

const rnBiometrics = new ReactNativeBiometrics();

export function AppLockScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const pinEnabled = useAppLockStore((s) => s.pinEnabled);
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled);
  const setPin = useAppLockStore((s) => s.setPin);
  const removePin = useAppLockStore((s) => s.removePin);
  const setBiometric = useAppLockStore((s) => s.setBiometric);

  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState('');

  const handleBiometric = useCallback(
    async (v: boolean) => {
      haptics.buttonPress();
      if (v) {
        try {
          const { available } = await rnBiometrics.isSensorAvailable();
          if (!available) return;
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: t('appLock.confirmBiometric'),
          });
          if (success) {
            setBiometric(true);
          }
        } catch {
          // cancelled
        }
      } else {
        setBiometric(false);
      }
    },
    [setBiometric],
  );

  const handlePinToggle = useCallback(
    (v: boolean) => {
      haptics.buttonPress();
      if (v) {
        setShowPinInput(true);
        setPinValue('');
      } else {
        removePin();
        setShowPinInput(false);
        setPinValue('');
      }
    },
    [removePin],
  );

  const handlePinChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, 4);
      setPinValue(digits);
      if (digits.length === 4) {
        haptics.success();
        setPin(digits);
        setShowPinInput(false);
      }
    },
    [setPin],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Icon header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.iconWrap}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.surfaceDefault },
          ]}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Rect
              x="3"
              y="11"
              width="18"
              height="11"
              rx="2"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
            />
            <Path
              d="M7 11V7a5 5 0 0110 0v4"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 16v2"
              stroke={colors.accentPrimary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </Animated.View>

      {/* Biometric */}
      <Animated.View entering={FadeInUp.springify().delay(80)}>
        <Text
          variant="caption"
          color={colors.textTertiary}
          style={styles.sectionLabel}>
          {t('appLock.biometricSection')}
        </Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surfaceDefault,
              borderColor: colors.borderDefault,
            },
          ]}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 11c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM1 12a5 5 0 015-5M23 12a5 5 0 00-5-5M1 12a5 5 0 005 5M23 12a5 5 0 01-5 5M12 2a10 10 0 00-7 3M12 2a10 10 0 017 3M12 22a10 10 0 01-7-3M12 22a10 10 0 007-3"
                  stroke={colors.textSecondary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View style={styles.rowText}>
              <Text variant="body">{t('appLock.biometric')}</Text>
              <Text variant="caption" color={colors.textTertiary}>
                {t('appLock.biometricDesc')}
              </Text>
            </View>
            <Switch value={biometricEnabled} onValueChange={handleBiometric} />
          </View>
        </View>
      </Animated.View>

      {/* PIN */}
      <Animated.View entering={FadeInUp.springify().delay(160)}>
        <Text
          variant="caption"
          color={colors.textTertiary}
          style={styles.sectionLabel}>
          {t('appLock.pinSection')}
        </Text>
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surfaceDefault,
              borderColor: colors.borderDefault,
            },
          ]}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke={colors.textSecondary}
                  strokeWidth={1.5}
                />
                <Path
                  d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"
                  stroke={colors.textSecondary}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View style={styles.rowText}>
              <Text variant="body">{t('appLock.pin')}</Text>
              <Text variant="caption" color={colors.textTertiary}>
                {pinEnabled ? t('appLock.pinSet') : t('appLock.pinNotSet')}
              </Text>
            </View>
            <Switch value={pinEnabled} onValueChange={handlePinToggle} />
          </View>

          {showPinInput && (
            <View style={styles.pinInputWrap}>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={pinValue}
                onChangeText={handlePinChange}
                placeholder={t('appLock.pinPlaceholder')}
                placeholderTextColor={colors.textPlaceholder}
                style={[
                  styles.pinInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.borderDefault,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.springify().delay(240)}>
        <Text
          variant="caption"
          color={colors.textTertiary}
          style={styles.hint}>
          {t('appLock.hint')}
          {biometricEnabled && pinEnabled
            ? t('appLock.biometricFallback')
            : ''}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['8'] },
  iconWrap: {
    alignItems: 'center',
    marginVertical: spacing['20'],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginEnd: spacing['12'],
  },
  rowText: { flex: 1, gap: spacing['2'] },
  pinInputWrap: {
    paddingHorizontal: spacing['16'],
    paddingBottom: spacing['12'],
  },
  pinInput: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing['16'],
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
    lineHeight: 20,
  },
});
