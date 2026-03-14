import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button } from '../../components/ui';
import type { AuthScreenProps } from '../../navigation/types';

// ─── Inline brand icons ──────────────────────────────────
function AppleLogo({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ─── Screen ──────────────────────────────────────────────
export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const logoScale = useSharedValue(0.6);
  React.useEffect(() => {
    logoScale.value = withSpring(1, springs.bouncy);
  }, [logoScale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgPrimary,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + spacing['16'],
        },
      ]}>
      {/* Logo */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <View style={[styles.logoCircle, { backgroundColor: brand.violet }]}>
          <Text variant="displayLg" color="#FFFFFF" align="center">
            P
          </Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <Text
          variant="displayXl"
          align="center"
          color={brand.violet}
          style={styles.title}>
          Welcome to Pulse
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeInUp.delay(300).springify()}>
        <Text
          variant="bodyLg"
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}>
          Connect with the people{'\n'}who matter most
        </Text>
      </Animated.View>

      <View style={styles.spacer} />

      {/* Auth buttons */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={styles.buttons}>
        <Button
          title="Continue with Apple"
          variant="secondary"
          size="lg"
          leftIcon={<AppleLogo color={colors.textPrimary} />}
          onPress={() => {}}
        />

        <Button
          title="Continue with Google"
          variant="secondary"
          size="lg"
          leftIcon={<GoogleLogo />}
          onPress={() => {}}
          style={styles.gap}
        />

        <Button
          title="Use phone number"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('PhoneAuth')}
          style={styles.gap}
        />
      </Animated.View>

      {/* Email link */}
      <Animated.View entering={FadeInUp.delay(500).springify()}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.navigate('EmailAuth');
          }}
          style={styles.emailLink}>
          <Text variant="bodySm" color={colors.textSecondary}>
            Use email instead
          </Text>
        </Pressable>
      </Animated.View>

      {/* Terms */}
      <Animated.View entering={FadeInUp.delay(600).springify()}>
        <Text
          variant="caption"
          color={colors.textTertiary}
          align="center"
          style={styles.terms}>
          By continuing you agree to our{' '}
          <Text variant="caption" color={colors.accentPrimary}>
            Terms
          </Text>
          {' & '}
          <Text variant="caption" color={colors.accentPrimary}>
            Privacy Policy
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
    marginBottom: spacing['24'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing['8'],
  },
  subtitle: {
    marginBottom: spacing['16'],
  },
  spacer: {
    flex: 1,
  },
  buttons: {
    marginBottom: spacing['16'],
  },
  gap: {
    marginTop: spacing['12'],
  },
  emailLink: {
    alignItems: 'center',
    paddingVertical: spacing['12'],
  },
  terms: {
    marginTop: spacing['8'],
    paddingHorizontal: spacing['16'],
  },
});
