import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, Button } from '../../components/ui';
import type { AuthScreenProps } from '../../navigation/types';

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function PhoneAuthScreen({ navigation }: AuthScreenProps<'PhoneAuth'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [countryCode, setCountryCode] = useState('+90');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fullNumber = `${countryCode}${phone.replace(/\s/g, '')}`;
  const isValid = E164_REGEX.test(fullNumber);

  const handleSendCode = async () => {
    if (!isValid) return;
    setLoading(true);
    // TODO: call POST /auth/otp/send
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTP', { target: fullNumber });
    }, 600);
  };

  React.useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.container,
          {
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
            What's your{'\n'}phone number?
          </Text>
          <Text
            variant="bodySm"
            color={colors.textSecondary}
            style={styles.sub}>
            We'll send you a code to verify your number
          </Text>
        </Animated.View>

        {/* Phone input row */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.row}>
          {/* Country code */}
          <View
            style={[
              styles.codeBox,
              {
                backgroundColor: colors.surfaceDefault,
                borderColor: colors.borderDefault,
              },
            ]}>
            <Text variant="body">🇹🇷</Text>
            <TextInput
              value={countryCode}
              onChangeText={setCountryCode}
              style={[
                styles.codeInput,
                {
                  color: colors.textPrimary,
                  fontFamily: fontFamily.medium,
                  fontSize: typography.body.fontSize,
                },
              ]}
              keyboardType="phone-pad"
              maxLength={4}
            />
          </View>

          {/* Number */}
          <View
            style={[
              styles.phoneBox,
              {
                backgroundColor: colors.surfaceDefault,
                borderColor: colors.borderDefault,
              },
            ]}>
            <TextInput
              ref={inputRef}
              value={phone}
              onChangeText={setPhone}
              placeholder="555 123 45 67"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              style={[
                styles.phoneInput,
                {
                  color: colors.textPrimary,
                  fontFamily: fontFamily.regular,
                  fontSize: typography.body.fontSize,
                },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Send */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Button
            title="Send Code"
            variant="primary"
            size="lg"
            disabled={!isValid}
            loading={loading}
            onPress={handleSendCode}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  row: {
    flexDirection: 'row',
    gap: spacing['12'],
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing['12'],
    gap: spacing['4'],
  },
  codeInput: {
    width: 44,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  phoneBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing['16'],
    justifyContent: 'center',
  },
  phoneInput: {
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  spacer: { flex: 1 },
});
