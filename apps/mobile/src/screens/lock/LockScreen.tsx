import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import { PinDots } from '../../components/lock/PinDots';
import { NumPad } from '../../components/lock/NumPad';
import { useAppLockStore } from '../../stores/appLockStore';

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

const LOCK_ICON = 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4';

const rnBiometrics = new ReactNativeBiometrics();

export function LockScreen() {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const pin = useAppLockStore((s) => s.pin);
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled);
  const unlock = useAppLockStore((s) => s.unlock);

  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const shakeX = useSharedValue(0);
  const biometricTriggered = useRef(false);

  // Biometric on mount
  const tryBiometric = useCallback(async () => {
    if (!biometricEnabled) return;
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) return;

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: t('lock.unlockBiometric'),
      });
      if (success) {
        haptics.success();
        unlock();
      }
    } catch {
      // user cancelled or error
    }
  }, [biometricEnabled, unlock, t]);

  useEffect(() => {
    if (!biometricTriggered.current && biometricEnabled) {
      biometricTriggered.current = true;
      const timer = setTimeout(tryBiometric, 300);
      return () => clearTimeout(timer);
    }
  }, [biometricEnabled, tryBiometric]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // Check PIN
  useEffect(() => {
    if (entered.length !== PIN_LENGTH) return;

    if (entered === pin) {
      haptics.success();
      setAttempts(0);
      unlock();
    } else {
      haptics.error();
      setError(true);
      const next = attempts + 1;
      setAttempts(next);

      shakeX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      setTimeout(() => {
        setEntered('');
        setError(false);
        if (next >= MAX_ATTEMPTS) {
          setCooldown(COOLDOWN_SECONDS);
          setAttempts(0);
        }
      }, 400);
    }
  }, [entered, pin, attempts, unlock, shakeX]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (cooldown > 0) return;
      if (entered.length >= PIN_LENGTH) return;
      setEntered((prev) => prev + digit);
    },
    [cooldown, entered.length],
  );

  const handleDelete = useCallback(() => {
    setEntered((prev) => prev.slice(0, -1));
  }, []);

  const locked = cooldown > 0;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['48'],
          paddingBottom: insets.bottom + spacing['24'],
        },
      ]}>
      {/* Lock icon */}
      <View style={[styles.lockIcon, { backgroundColor: colors.surfaceDefault }]}>
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path
            d={LOCK_ICON}
            stroke={brand.violet}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={styles.titleWrap}>
        <Text variant="heading" align="center">
          {t('lock.title')}
        </Text>
      </View>

      {/* PIN dots */}
      <PinDots pinLength={PIN_LENGTH} filledCount={entered.length} shakeX={shakeX} />

      {/* Status text */}
      <View style={styles.statusWrap}>
        {locked ? (
          <Text variant="bodySm" color={colors.accentError} align="center">
            {t('lock.tooManyAttempts', { cooldown })}
          </Text>
        ) : error ? (
          <Text variant="bodySm" color={colors.accentError} align="center">
            {t('lock.wrongPin')}
          </Text>
        ) : (
          <Text variant="bodySm" color={colors.textSecondary} align="center">
            {t('lock.enterPin')}
          </Text>
        )}
      </View>

      <View style={styles.spacer} />

      {/* Numpad */}
      <NumPad
        onDigit={handleDigit}
        onDelete={handleDelete}
        onBiometric={tryBiometric}
        biometricEnabled={biometricEnabled}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    paddingHorizontal: spacing['24'],
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['16'],
  },
  titleWrap: {
    marginBottom: spacing['32'],
  },
  statusWrap: {
    height: 20,
  },
  spacer: { flex: 1 },
});
