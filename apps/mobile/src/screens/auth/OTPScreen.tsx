import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { timing } from '../../design-system/animations';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text } from '../../components/ui';
import type { AuthScreenProps } from '../../navigation/types';

const CODE_LENGTH = 6;

export function OTPScreen({ navigation, route }: AuthScreenProps<'OTP'>) {
  const { target } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [loading, setLoading] = useState(false);

  const refs = useRef<(TextInput | null)[]>([]);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Auto-focus first input
  useEffect(() => {
    const timeout = setTimeout(() => refs.current[0]?.focus(), 400);
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

  const handleDigit = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      setError(false);
      const newCode = [...code];
      newCode[index] = value.slice(-1);
      setCode(newCode);

      if (value && index < CODE_LENGTH - 1) {
        refs.current[index + 1]?.focus();
      }

      // Auto-submit
      const full = newCode.join('');
      if (full.length === CODE_LENGTH && !newCode.includes('')) {
        handleSubmit(full);
      }
    },
    [code],
  );

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        refs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    },
    [code],
  );

  const handleSubmit = async (fullCode: string) => {
    setLoading(true);
    // TODO: call POST /auth/otp/verify
    // Simulate verification: navigate to ProfileSetup for demo
    setTimeout(() => {
      setLoading(false);
      // In real flow: if isNewUser → ProfileSetup, else → setAuth
      navigation.navigate('ProfileSetup', {
        target,
        tempToken: 'demo-temp-token',
      });
    }, 800);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    haptics.buttonPress();
    setResendTimer(45);
    setCode(Array(CODE_LENGTH).fill(''));
    refs.current[0]?.focus();
    // TODO: call POST /auth/otp/send again
  };

  const triggerShake = () => {
    haptics.error();
    setError(true);
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

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
          Enter the code
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} style={styles.sub}>
          Sent to {target}
        </Text>
      </Animated.View>

      {/* OTP boxes */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.codeRow}>
        <Animated.View style={[styles.codeRow, shakeStyle]}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.digitBox,
                {
                  backgroundColor: colors.surfaceDefault,
                  borderColor: error
                    ? colors.accentError
                    : code[i]
                      ? colors.accentPrimary
                      : colors.borderDefault,
                },
              ]}>
              <TextInput
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={code[i]}
                onChangeText={(v) => handleDigit(i, v)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(i, nativeEvent.key)
                }
                keyboardType="number-pad"
                textContentType={i === 0 ? 'oneTimeCode' : 'none'}
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.digitInput,
                  {
                    color: colors.textPrimary,
                    fontFamily: fontFamily.bold,
                    fontSize: typography.heading.fontSize,
                  },
                ]}
              />
            </View>
          ))}
        </Animated.View>
      </Animated.View>

      {/* Resend */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={styles.resendWrap}>
        {resendTimer > 0 ? (
          <Text variant="mono" color={colors.textTertiary}>
            Resend code in {formatTimer(resendTimer)}
          </Text>
        ) : (
          <Pressable onPress={handleResend}>
            <Text variant="bodySm" color={colors.accentPrimary}>
              Resend code
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
  digitInput: {
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  resendWrap: {
    alignItems: 'center',
    marginTop: spacing['24'],
  },
});
