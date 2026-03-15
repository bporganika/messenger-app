import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import { useAppLockStore } from '../../stores/appLockStore';

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

const ICON = {
  lock: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  fingerprint:
    'M12 10v4M6.5 13a6.5 6.5 0 0013 0M2 16a10 10 0 0020-4M12 3a7 7 0 00-7 7M17 7a5 5 0 00-5-5',
  delete: 'M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6',
};

const rnBiometrics = new ReactNativeBiometrics();

// ─── PIN Dot ─────────────────────────────────────────────
function PinDot({ filled }: { filled: boolean }) {
  const { colors, brand } = useTheme();
  const scale = useSharedValue(filled ? 1 : 0.5);

  useEffect(() => {
    scale.value = withSpring(filled ? 1 : 0.5, springs.snappy);
  }, [filled, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: filled ? brand.violet : 'transparent',
    borderColor: filled ? brand.violet : colors.borderDefault,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

// ─── Numpad Key ──────────────────────────────────────────
function NumpadKey({
  value,
  onPress,
  children,
}: {
  value: string;
  onPress: (v: string) => void;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.88, springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={() => {
        haptics.buttonPress();
        onPress(value);
      }}
      style={styles.keyWrap}>
      <Animated.View
        style={[
          styles.key,
          { backgroundColor: colors.surfaceDefault },
          animStyle,
        ]}>
        {children ?? (
          <Text variant="heading" color={colors.textPrimary}>
            {value}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────
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

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // ── Biometric on mount ─────────────────────────────────
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
      // user cancelled or error — stay on lock screen
    }
  }, [biometricEnabled, unlock, t]);

  useEffect(() => {
    if (!biometricTriggered.current && biometricEnabled) {
      biometricTriggered.current = true;
      const t = setTimeout(tryBiometric, 300);
      return () => clearTimeout(t);
    }
  }, [biometricEnabled, tryBiometric]);

  // ── Cooldown timer ─────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // ── Check PIN ──────────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────
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
      <View
        style={[styles.lockIcon, { backgroundColor: colors.surfaceDefault }]}>
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <Path
            d={ICON.lock}
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
      <Animated.View style={[styles.dotsRow, shakeStyle]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <PinDot key={i} filled={i < entered.length} />
        ))}
      </Animated.View>

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
      <View style={styles.numpad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <NumpadKey key={d} value={d} onPress={handleDigit} />
        ))}

        {/* Bottom row: biometric / 0 / delete */}
        {biometricEnabled ? (
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              tryBiometric();
            }}
            style={styles.keyWrap}>
            <View style={[styles.key, styles.keyTransparent]}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d={ICON.fingerprint}
                  stroke={brand.violet}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </Pressable>
        ) : (
          <View style={styles.keyWrap} />
        )}

        <NumpadKey value="0" onPress={handleDigit} />

        <Pressable
          onPress={() => {
            haptics.buttonPress();
            handleDelete();
          }}
          style={styles.keyWrap}>
          <View style={[styles.key, styles.keyTransparent]}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d={ICON.delete}
                stroke={colors.textSecondary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────
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
  dotsRow: {
    flexDirection: 'row',
    gap: spacing['16'],
    marginBottom: spacing['16'],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  statusWrap: {
    height: 20,
  },
  spacer: { flex: 1 },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 270,
    gap: spacing['12'],
  },
  keyWrap: {
    width: 74,
    height: 54,
  },
  key: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTransparent: {
    backgroundColor: 'transparent',
  },
});
