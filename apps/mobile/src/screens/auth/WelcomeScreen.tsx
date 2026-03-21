import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, brand } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button } from '../../components/ui';
import { SocialSignInButtons } from '../../components/auth/SocialSignInButtons';
import { useTranslation } from 'react-i18next';
import type { AuthScreenProps } from '../../navigation/types';

const STAGGER = 100;

function PulseLogo({ size = 80 }: { size?: number }) {
  const scale = size / 64;
  return (
    <Svg
      width={64 * scale}
      height={52 * scale}
      viewBox="0 0 64 52"
      fill="none">
      <G opacity={0.85}>
        <Rect x={22} y={2} width={36} height={26} rx={13} fill={brand.cyan} />
        <Path d="M44 28l6 8H38z" fill={brand.cyan} />
      </G>
      <Rect x={6} y={12} width={36} height={26} rx={13} fill={brand.violet} />
      <Path d="M22 38l-6 8h12z" fill={brand.violet} />
    </Svg>
  );
}

function stagger(index: number) {
  return FadeInUp.delay(STAGGER * index)
    .springify()
    .damping(20)
    .stiffness(140);
}

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const logoProgress = useSharedValue(0);
  useEffect(() => {
    logoProgress.value = withSpring(1, springs.bouncy);
  }, [logoProgress]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(logoProgress.value, [0, 1], [0, 1]) }],
    opacity: interpolate(logoProgress.value, [0, 0.3, 1], [0, 0.5, 1]),
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + spacing['48'],
          paddingBottom: insets.bottom + spacing['16'],
        },
      ]}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <PulseLogo size={80} />
      </Animated.View>

      <Animated.View entering={stagger(1)}>
        <Text variant="displayXl" align="center" color={brand.violet}>
          {t('welcome.title')}{' '}
          <Text variant="displayXl" color={brand.cyan}>
            {t('welcome.titleBrand')}
          </Text>
        </Text>
      </Animated.View>

      <Animated.View entering={stagger(2)}>
        <Text
          variant="bodyLg"
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>
      </Animated.View>

      <View style={styles.spacer} />

      <SocialSignInButtons
        onApplePress={() => {}}
        onGooglePress={() => {}}
        staggerBase={3}
      />

      <Animated.View entering={stagger(5)} style={styles.btnGap}>
        <Button
          title={t('welcome.usePhone')}
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('PhoneAuth')}
        />
      </Animated.View>

      <Animated.View entering={stagger(6)}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.navigate('EmailAuth');
          }}
          style={styles.emailLink}>
          <Text variant="bodySm" color={colors.textSecondary}>
            {t('welcome.useEmail')}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={stagger(7)}>
        <Text
          variant="caption"
          color={colors.textTertiary}
          align="center"
          style={styles.terms}>
          {t('welcome.terms')}{' '}
          <Text variant="caption" color={colors.accentPrimary}>
            {t('welcome.termsLink')}
          </Text>
          {' & '}
          <Text variant="caption" color={colors.accentPrimary}>
            {t('welcome.privacyLink')}
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['24'],
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing['20'],
  },
  subtitle: {
    marginTop: spacing['8'],
  },
  spacer: {
    flex: 1,
    minHeight: spacing['40'],
  },
  btnGap: {
    marginTop: spacing['12'],
  },
  emailLink: {
    alignItems: 'center',
    paddingVertical: spacing['16'],
  },
  terms: {
    paddingHorizontal: spacing['8'],
  },
});
