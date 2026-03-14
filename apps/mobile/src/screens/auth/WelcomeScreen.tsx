import React, { useCallback, useEffect } from 'react';
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
import { spacing, radius, buttonHeight, brand } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Button } from '../../components/ui';
import type { AuthScreenProps } from '../../navigation/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const STAGGER = 100; // ms between each element's entrance

// ─── Brand Logo Mark ─────────────────────────────────────
// Two overlapping speech bubbles: violet (front) + cyan (back)
function PulseLogo({ size = 80 }: { size?: number }) {
  const scale = size / 64;
  return (
    <Svg
      width={64 * scale}
      height={52 * scale}
      viewBox="0 0 64 52"
      fill="none">
      {/* Back bubble — cyan, slightly right and up */}
      <G opacity={0.85}>
        <Rect x={22} y={2} width={36} height={26} rx={13} fill={brand.cyan} />
        <Path d="M44 28l6 8H38z" fill={brand.cyan} />
      </G>
      {/* Front bubble — violet, lower-left */}
      <Rect x={6} y={12} width={36} height={26} rx={13} fill={brand.violet} />
      <Path d="M22 38l-6 8h12z" fill={brand.violet} />
    </Svg>
  );
}

// ─── Apple Logo ──────────────────────────────────────────
function AppleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

// ─── Google Logo ─────────────────────────────────────────
function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
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

// ─── Social Auth Button ──────────────────────────────────
// Custom pressable for Apple/Google with exact style control
function SocialButton({
  title,
  icon,
  backgroundColor,
  textColor,
  borderColor,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    haptics.buttonPress();
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.socialBtn,
        {
          backgroundColor,
          borderColor: borderColor ?? 'transparent',
          borderWidth: borderColor ? 1 : 0,
        },
        animatedStyle,
      ]}>
      {icon}
      <Text variant="bodyLg" color={textColor} style={styles.socialLabel}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Stagger helper ──────────────────────────────────────
function stagger(index: number) {
  return FadeInUp.delay(STAGGER * index)
    .springify()
    .damping(20)
    .stiffness(140);
}

// ─── Screen ──────────────────────────────────────────────
export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Logo entrance: scale 0 → 1 with springBouncy
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
      {/* ── Logo ── */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <PulseLogo size={80} />
      </Animated.View>

      {/* ── Title ── */}
      <Animated.View entering={stagger(1)}>
        <Text variant="displayXl" align="center" color={brand.violet}>
          Welcome to{' '}
          <Text variant="displayXl" color={brand.cyan}>
            Pulse
          </Text>
        </Text>
      </Animated.View>

      {/* ── Subtitle ── */}
      <Animated.View entering={stagger(2)}>
        <Text
          variant="bodyLg"
          color={colors.textSecondary}
          align="center"
          style={styles.subtitle}>
          Connect with the people{'\n'}who matter most
        </Text>
      </Animated.View>

      {/* ── Flexible space ── */}
      <View style={styles.spacer} />

      {/* ── Continue with Apple ── */}
      <Animated.View entering={stagger(3)}>
        <SocialButton
          title="Continue with Apple"
          icon={<AppleIcon color="#FFFFFF" />}
          backgroundColor={isDark ? colors.bgTertiary : '#000000'}
          textColor="#FFFFFF"
          borderColor={isDark ? colors.borderDefault : undefined}
          onPress={() => {
            // TODO: Sign in with Apple
          }}
        />
      </Animated.View>

      {/* ── Continue with Google ── */}
      <Animated.View entering={stagger(4)} style={styles.btnGap}>
        <SocialButton
          title="Continue with Google"
          icon={<GoogleIcon />}
          backgroundColor={isDark ? colors.surfaceDefault : '#FFFFFF'}
          textColor={colors.textPrimary}
          borderColor={colors.borderDefault}
          onPress={() => {
            // TODO: Google Sign-In
          }}
        />
      </Animated.View>

      {/* ── Use phone number ── */}
      <Animated.View entering={stagger(5)} style={styles.btnGap}>
        <Button
          title="Use phone number"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('PhoneAuth')}
        />
      </Animated.View>

      {/* ── Email link ── */}
      <Animated.View entering={stagger(6)}>
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

      {/* ── Terms ── */}
      <Animated.View entering={stagger(7)}>
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

// ─── Styles ──────────────────────────────────────────────
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
  socialBtn: {
    height: buttonHeight.lg,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['8'],
  },
  socialLabel: {
    fontWeight: '600',
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
