import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  FadeInUp,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { timing } from '../../design-system/animations';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import type { AuthScreenProps } from '../../navigation/types';

const CODE_LENGTH = 6;
const SHAKE_OFFSET = 10;
const SHAKE_DURATION = 50;

// ─── Animated digit box ─────────────────────────────────
function DigitBox({
  digit,
  isFocused,
  isError,
}: {
  digit: string;
  isFocused: boolean;
  isError: boolean;
}) {
  const { colors } = useTheme();

  // Blinking cursor
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    if (isFocused && !digit) {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        true,
      );
    } else {
      cursorOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isFocused, digit, cursorOpacity]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Border color interpolation
  const borderProgress = useSharedValue(0);
  useEffect(() => {
    if (isError) {
      borderProgress.value = withTiming(2, { duration: 150 });
    } else if (digit || isFocused) {
      borderProgress.value = withTiming(1, { duration: 150 });
    } else {
      borderProgress.value = withTiming(0, { duration: 150 });
    }
  }, [isError, digit, isFocused, borderProgress]);

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1, 2],
      [colors.borderDefault, colors.accentPrimary, colors.accentError],
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.digitBox,
        { backgroundColor: colors.surfaceDefault },
        boxStyle,
      ]}>
      {digit ? (
        <Animated.Text
          style={[
            styles.digitText,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.bold,
              fontSize: typography.heading.fontSize,
            },
          ]}>
          {digit}
        </Animated.Text>
      ) : (
        <Animated.View
          style={[
            styles.cursor,
            { backgroundColor: colors.accentPrimary },
            cursorStyle,
          ]}
        />
      )}
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────────
export function OTPScreen({ navigation, route }: AuthScreenProps<'OTP'>) {
  const { target } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Auto-focus hidden input
  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timeout);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const triggerShake = useCallback(() => {
    haptics.error();
    setError(true);
    shakeX.value = withSequence(
      withTiming(-SHAKE_OFFSET, { duration: SHAKE_DURATION }),
      withTiming(SHAKE_OFFSET, { duration: SHAKE_DURATION }),
      withTiming(-SHAKE_OFFSET * 0.8, { duration: SHAKE_DURATION }),
      withTiming(SHAKE_OFFSET * 0.8, { duration: SHAKE_DURATION }),
      withTiming(-SHAKE_OFFSET * 0.4, { duration: SHAKE_DURATION }),
      withTiming(0, { duration: SHAKE_DURATION }),
    );
  }, [shakeX]);

  const handleSubmit = useCallback(
    async (fullCode: string) => {
      if (loading) return;
      setLoading(true);

      try {
        const response = await api.post<{
          isNewUser: boolean;
          tempToken?: string;
          accessToken?: string;
          refreshToken?: string;
          user?: { id: string; firstName: string; lastName: string; username: string; avatarUrl: string | null };
        }>('/auth/otp/verify', { target, code: fullCode });

        if (response.isNewUser) {
          navigation.navigate('ProfileSetup', {
            target,
            tempToken: response.tempToken!,
          });
        } else {
          setAuth(
            { accessToken: response.accessToken!, refreshToken: response.refreshToken! },
            response.user!,
          );
        }
      } catch {
        triggerShake();
        setCode('');
        inputRef.current?.focus();
      } finally {
        setLoading(false);
      }
    },
    [loading, target, navigation, triggerShake, setAuth],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      // Only digits
      const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
      setError(false);
      setCode(digits);
      setFocusedIndex(Math.min(digits.length, CODE_LENGTH - 1));

      // Auto-submit when all 6 digits entered
      if (digits.length === CODE_LENGTH) {
        handleSubmit(digits);
      }
    },
    [handleSubmit],
  );

  const handleResend = useCallback(() => {
    if (resendTimer > 0) return;
    haptics.buttonPress();
    setResendTimer(45);
    setCode('');
    setError(false);
    setFocusedIndex(0);
    inputRef.current?.focus();
    api.post('/auth/otp/send', { [target.includes('@') ? 'email' : 'phone']: target });
  }, [resendTimer, target]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Split code string into individual digits for display
  const digits = code.split('');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['12'],
          paddingBottom: insets.bottom + spacing['16'],
        },
      ]}>
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

      {/* Heading */}
      <Animated.View entering={FadeInUp.delay(100).springify()}>
        <Text variant="heading" style={styles.heading}>
          {t('otp.title')}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} style={styles.sub}>
          {t('otp.sentTo', { target })}
        </Text>
      </Animated.View>

      {/* OTP digit boxes — visual only, tapping focuses hidden input */}
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={styles.codeRow}>
          <Animated.View style={[styles.codeRow, shakeStyle]}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <DigitBox
                key={i}
                digit={digits[i] ?? ''}
                isFocused={!error && focusedIndex === i && code.length < CODE_LENGTH}
                isError={error}
              />
            ))}
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Hidden TextInput — captures all keyboard input + SMS auto-fill */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChangeText}
        onFocus={() => setFocusedIndex(Math.min(code.length, CODE_LENGTH - 1))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : undefined}
        maxLength={CODE_LENGTH}
        caretHidden
        autoFocus={false}
        style={styles.hiddenInput}
      />

      {/* Resend */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={styles.resendWrap}>
        {resendTimer > 0 ? (
          <Text variant="mono" color={colors.textTertiary}>
            {t('otp.resendIn', { time: formatTimer(resendTimer) })}
          </Text>
        ) : (
          <Pressable onPress={handleResend}>
            <Text variant="bodySm" color={colors.accentPrimary}>
              {t('otp.resend')}
            </Text>
          </Pressable>
        )}
      </Animated.View>

    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['24'],
  },
  back: {
    marginBottom: spacing['24'],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginBottom: spacing['8'],
  },
  sub: {
    marginBottom: spacing['32'],
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['8'],
  },
  digitBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  cursor: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resendWrap: {
    alignItems: 'center',
    marginTop: spacing['24'],
  },
});
