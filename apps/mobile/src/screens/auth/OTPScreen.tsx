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
  withSequence,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import { OTPInput } from '../../components/auth/OTPInput';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import type { AuthScreenProps } from '../../navigation/types';

const CODE_LENGTH = 6;
const SHAKE_OFFSET = 10;
const SHAKE_DURATION = 50;

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

  // Auto-focus hidden input
  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timeout);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
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
      const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
      setError(false);
      setCode(digits);
      setFocusedIndex(Math.min(digits.length, CODE_LENGTH - 1));

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

      {/* OTP digit boxes */}
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <OTPInput
          code={code}
          codeLength={CODE_LENGTH}
          focusedIndex={focusedIndex}
          isError={error}
          shakeX={shakeX}
          inputRef={inputRef}
        />
      </Animated.View>

      {/* Hidden TextInput */}
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
