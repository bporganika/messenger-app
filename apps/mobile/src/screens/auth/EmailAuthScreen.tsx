import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button, Input } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { AuthScreenProps } from '../../navigation/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailAuthScreen({ navigation }: AuthScreenProps<'EmailAuth'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = EMAIL_REGEX.test(email);

  const handleSendCode = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { email });
      navigation.navigate('OTP', { target: email });
    } catch {
      // Error is handled by the API layer
    } finally {
      setLoading(false);
    }
  };

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
            {t('emailAuth.title')}
          </Text>
          <Text
            variant="bodySm"
            color={colors.textSecondary}
            style={styles.sub}>
            {t('emailAuth.subtitle')}
          </Text>
        </Animated.View>

        {/* Email input */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Input
            placeholder={t('emailAuth.placeholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
        </Animated.View>

        <View style={styles.spacer} />

        {/* Send */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Button
            title={t('emailAuth.sendCode')}
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
  spacer: { flex: 1 },
});
