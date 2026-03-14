import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';
import { haptics } from '../../design-system/haptics';
import { Text, Button, BottomSheet, Divider } from '../../components/ui';
import type { AuthScreenProps } from '../../navigation/types';

// ─── Country data ────────────────────────────────────────
interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  /** # = digit placeholder, spaces/dashes are formatting chars */
  fmt: string;
}

const COUNTRIES: Country[] = [
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷', fmt: '### ### ## ##' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', fmt: '#### #######' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', fmt: '#### ######' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', fmt: '# ## ## ## ##' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', fmt: '### ### ####' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', fmt: '### ### ###' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', fmt: '# ########' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪', fmt: '### ## ## ##' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹', fmt: '#### ######' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', fmt: '## ### ## ##' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', fmt: '## ### ## ##' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', fmt: '### ## ###' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', fmt: '## ## ## ##' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', fmt: '## ### ####' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', fmt: '### ### ###' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', fmt: '### ### ###' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷', fmt: '### ### ####' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', fmt: '## ### ####' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿', fmt: '### ### ###' },
  { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴', fmt: '### ### ###' },
  { code: 'HU', name: 'Hungary', dial: '+36', flag: '🇭🇺', fmt: '## ### ####' },
  { code: 'BG', name: 'Bulgaria', dial: '+359', flag: '🇧🇬', fmt: '### ### ###' },
  { code: 'HR', name: 'Croatia', dial: '+385', flag: '🇭🇷', fmt: '## ### ####' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦', fmt: '## ### ## ##' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺', fmt: '### ### ## ##' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', fmt: '### ### ####' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', fmt: '### ### ####' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', fmt: '## ##### ####' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', fmt: '##### #####' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', fmt: '## ### ####' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', fmt: '## ### ####' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', fmt: '#### ### ###' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', fmt: '## #### ####' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', fmt: '## #### ####' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994', flag: '🇦🇿', fmt: '## ### ## ##' },
  { code: 'GE', name: 'Georgia', dial: '+995', flag: '🇬🇪', fmt: '### ## ## ##' },
].sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'TR')!;

// ─── Helpers ─────────────────────────────────────────────
function formatPhone(raw: string, fmt: string): string {
  let result = '';
  let di = 0;
  for (let i = 0; i < fmt.length && di < raw.length; i++) {
    result += fmt[i] === '#' ? raw[di++] : fmt[i];
  }
  return result;
}

function maxDigits(fmt: string): number {
  let count = 0;
  for (const c of fmt) {
    if (c === '#') count++;
  }
  return count;
}

function placeholder(fmt: string): string {
  return fmt.replace(/#/g, '0');
}

const E164 = /^\+[1-9]\d{6,14}$/;

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

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke={color}
        strokeWidth={1.5}
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
  const phoneInputRef = useRef<TextInput>(null);

  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [rawDigits, setRawDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const formatted = formatPhone(rawDigits, country.fmt);
  const fullNumber = `${country.dial}${rawDigits}`;
  const isValid = E164.test(fullNumber);
  const max = maxDigits(country.fmt);

  const handlePhoneChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '');
      setRawDigits(digits.slice(0, max));
    },
    [max],
  );

  const handleSelectCountry = useCallback((c: Country) => {
    haptics.buttonPress();
    setCountry(c);
    setRawDigits('');
    setPickerOpen(false);
    setSearch('');
    setTimeout(() => phoneInputRef.current?.focus(), 300);
  }, []);

  const handleSendCode = useCallback(() => {
    if (!isValid) return;
    setLoading(true);
    // TODO: call POST /auth/otp/send { phone: fullNumber }
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTP', { target: fullNumber });
    }, 600);
  }, [isValid, fullNumber, navigation]);

  // Auto-focus
  React.useEffect(() => {
    const t = setTimeout(() => phoneInputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // Filtered country list for picker
  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

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
              placeholder={placeholder(country.fmt)}
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
            title="Send Code"
            variant="primary"
            size="lg"
            disabled={!isValid}
            loading={loading}
            onPress={handleSendCode}
          />
        </Animated.View>
      </View>

      {/* ── Country Picker Bottom Sheet ── */}
      <BottomSheet
        visible={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setSearch('');
        }}
        snapPoint={0.7}>
        <Text variant="title" style={styles.sheetTitle}>
          Select country
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceDefault,
              borderColor: colors.borderDefault,
            },
          ]}>
          <SearchIcon color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search country or code..."
            placeholderTextColor={colors.textPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily.regular,
                fontSize: typography.body.fontSize,
              },
            ]}
          />
        </View>

        {/* Country list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectCountry(item)}
              style={styles.countryRow}>
              <Text variant="body" style={styles.countryFlag}>
                {item.flag}
              </Text>
              <Text variant="body" style={styles.countryName}>
                {item.name}
              </Text>
              <Text variant="bodySm" color={colors.textTertiary}>
                {item.dial}
              </Text>
              {item.code === country.code && (
                <View
                  style={[
                    styles.checkDot,
                    { backgroundColor: colors.accentPrimary },
                  ]}
                />
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text
                variant="bodySm"
                color={colors.textTertiary}
                align="center">
                No countries found
              </Text>
            </View>
          }
        />
      </BottomSheet>
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

  // ── Bottom sheet content ──
  sheetTitle: {
    marginBottom: spacing['16'],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    height: 40,
    paddingHorizontal: spacing['12'],
    gap: spacing['8'],
    marginBottom: spacing['12'],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['12'],
    gap: spacing['12'],
  },
  countryFlag: {
    fontSize: 24,
    width: 32,
  },
  countryName: {
    flex: 1,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptySearch: {
    paddingVertical: spacing['32'],
  },
});
