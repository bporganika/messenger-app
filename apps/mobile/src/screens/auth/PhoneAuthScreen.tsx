import React, { useState, useRef, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { AuthScreenProps } from '../../navigation/types';
import { CountryPicker } from './CountryPicker';
import {
  DEFAULT_COUNTRY,
  formatPhone,
  maxDigits,
  phonePlaceholder,
  E164_REGEX,
} from './countries';
import type { Country } from './countries';

// ─── Chevron icons ───────────────────────────────────────
function BackChevron({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DownChevron({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Screen ──────────────────────────────────────────────
export function PhoneAuthScreen({ navigation }: AuthScreenProps<'PhoneAuth'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const phoneInputRef = useRef<TextInput>(null);

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [rawDigits, setRawDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const formatted = formatPhone(rawDigits, country.fmt);
  const fullNumber = `${country.dial}${rawDigits}`;
  const isValid = E164_REGEX.test(fullNumber);
  const max = maxDigits(country.fmt);

  const handlePhoneChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '');
      setRawDigits(digits.slice(0, max));
    },
    [max],
  );

  const handleSelectCountry = useCallback((c: Country) => {
    setCountry(c);
    setRawDigits('');
    setPickerOpen(false);
    setTimeout(() => phoneInputRef.current?.focus(), 300);
  }, []);

  const handleSendCode = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { phone: fullNumber });
      navigation.navigate('OTP', { target: fullNumber });
    } catch {
      // Error is handled by the API layer
    } finally {
      setLoading(false);
    }
  }, [isValid, fullNumber, navigation]);

  // Auto-focus
  React.useEffect(() => {
    const timer = setTimeout(() => phoneInputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
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
          <BackChevron color={colors.textPrimary} />
        </Pressable>

        {/* Heading */}
        <Animated.View
          entering={FadeInUp.delay(100).springify().damping(20)}>
          <Text variant="heading" style={styles.heading}>
            {t('phoneAuth.title')}
          </Text>
          <Text
            variant="bodySm"
            color={colors.textSecondary}
            style={styles.sub}>
            {t('phoneAuth.subtitle')}
          </Text>
        </Animated.View>

        {/* Phone input row */}
        <Animated.View
          entering={FadeInUp.delay(200).springify().damping(20)}
          style={styles.row}>
          {/* Country picker trigger */}
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              setPickerOpen(true);
            }}
            style={[
              styles.countryBtn,
              {
                backgroundColor: colors.surfaceDefault,
                borderColor: colors.borderDefault,
              },
            ]}>
            <Text variant="body" style={styles.flag}>
              {country.flag}
            </Text>
            <Text variant="body" style={styles.dialCode}>
              {country.dial}
            </Text>
            <DownChevron color={colors.textTertiary} />
          </Pressable>

          {/* Phone number input */}
          <View
            style={[
              styles.phoneBox,
              {
                backgroundColor: colors.surfaceDefault,
                borderColor: colors.borderDefault,
              },
            ]}>
            <TextInput
              ref={phoneInputRef}
              value={formatted}
              onChangeText={handlePhoneChange}
              placeholder={phonePlaceholder(country.fmt)}
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              maxLength={country.fmt.length}
              style={[
                styles.phoneInput,
                {
                  color: colors.textPrimary,
                  fontFamily: fontFamily.medium,
                  fontSize: typography.bodyLg.fontSize,
                  letterSpacing: 0.5,
                },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Send Code */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(20)}>
          <Button
            title={t('phoneAuth.sendCode')}
            variant="primary"
            size="lg"
            disabled={!isValid}
            loading={loading}
            onPress={handleSendCode}
          />
        </Animated.View>
      </View>

      {/* Country Picker */}
      <CountryPicker
        visible={pickerOpen}
        selectedCode={country.code}
        onSelect={handleSelectCountry}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────
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
    gap: spacing['8'],
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing['12'],
    gap: spacing['6'],
  },
  flag: {
    fontSize: 22,
  },
  dialCode: {
    minWidth: 36,
  },
  phoneBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 52,
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
