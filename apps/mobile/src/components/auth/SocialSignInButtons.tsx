import React, { useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, radius, buttonHeight } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui';
import { useTranslation } from 'react-i18next';

// ─── Types ──────────────────────────────────────────────
export type SocialSignInButtonsProps = {
  /** Called when Apple sign-in is pressed */
  onApplePress: () => void;
  /** Called when Google sign-in is pressed */
  onGooglePress: () => void;
  /** Base stagger index for entrance animations */
  staggerBase: number;
};

// ─── Stagger helper ─────────────────────────────────────
const STAGGER = 100;

function stagger(index: number) {
  return FadeInUp.delay(STAGGER * index)
    .springify()
    .damping(20)
    .stiffness(140);
}

// ─── Apple Logo ─────────────────────────────────────────
function AppleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

// ─── Google Logo ────────────────────────────────────────
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

// ─── Social Auth Button ─────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

// ─── SocialSignInButtons ────────────────────────────────
export function SocialSignInButtons({
  onApplePress,
  onGooglePress,
  staggerBase,
}: SocialSignInButtonsProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* Continue with Apple */}
      <Animated.View entering={stagger(staggerBase)}>
        <SocialButton
          title={t('welcome.continueApple')}
          icon={<AppleIcon color="#FFFFFF" />}
          backgroundColor={isDark ? colors.bgTertiary : '#000000'}
          textColor="#FFFFFF"
          borderColor={isDark ? colors.borderDefault : undefined}
          onPress={onApplePress}
        />
      </Animated.View>

      {/* Continue with Google */}
      <Animated.View entering={stagger(staggerBase + 1)} style={styles.btnGap}>
        <SocialButton
          title={t('welcome.continueGoogle')}
          icon={<GoogleIcon />}
          backgroundColor={isDark ? colors.surfaceDefault : '#FFFFFF'}
          textColor={colors.textPrimary}
          borderColor={colors.borderDefault}
          onPress={onGooglePress}
        />
      </Animated.View>
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
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
});
