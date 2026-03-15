import React, { useEffect } from 'react';
import { StyleSheet, Pressable, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { fontFamily, typography } from '../../design-system/typography';

// ─── Types ──────────────────────────────────────────────
export type OTPInputProps = {
  /** Current code string (e.g. "12" for first two digits entered) */
  code: string;
  /** Total number of digit boxes */
  codeLength: number;
  /** Index of the currently focused box */
  focusedIndex: number;
  /** Whether to show error styling on all boxes */
  isError: boolean;
  /** Shared value controlling horizontal shake translation */
  shakeX: SharedValue<number>;
  /** Ref to the hidden TextInput for focusing */
  inputRef: React.RefObject<TextInput>;
};

// ─── Animated digit box ─────────────────────────────────
function DigitBox({
  digit,
  isFocused,
  isError,
}: {
  digit: string;
  isFocused: boolean;
  isError: boolean;
}) {
  const { colors } = useTheme();

  // Blinking cursor
  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    if (isFocused && !digit) {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        true,
      );
    } else {
      cursorOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isFocused, digit, cursorOpacity]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // Border color interpolation
  const borderProgress = useSharedValue(0);
  useEffect(() => {
    if (isError) {
      borderProgress.value = withTiming(2, { duration: 150 });
    } else if (digit || isFocused) {
      borderProgress.value = withTiming(1, { duration: 150 });
    } else {
      borderProgress.value = withTiming(0, { duration: 150 });
    }
  }, [isError, digit, isFocused, borderProgress]);

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1, 2],
      [colors.borderDefault, colors.accentPrimary, colors.accentError],
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.digitBox,
        { backgroundColor: colors.surfaceDefault },
        boxStyle,
      ]}>
      {digit ? (
        <Animated.Text
          style={[
            styles.digitText,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.bold,
              fontSize: typography.heading.fontSize,
            },
          ]}>
          {digit}
        </Animated.Text>
      ) : (
        <Animated.View
          style={[
            styles.cursor,
            { backgroundColor: colors.accentPrimary },
            cursorStyle,
          ]}
        />
      )}
    </Animated.View>
  );
}

// ─── OTPInput ───────────────────────────────────────────
export function OTPInput({
  code,
  codeLength,
  focusedIndex,
  isError,
  shakeX,
  inputRef,
}: OTPInputProps) {
  const digits = code.split('');

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={styles.codeRow}>
      <Animated.View style={[styles.codeRow, shakeStyle]}>
        {Array.from({ length: codeLength }).map((_, i) => (
          <DigitBox
            key={i}
            digit={digits[i] ?? ''}
            isFocused={!isError && focusedIndex === i && code.length < codeLength}
            isError={isError}
          />
        ))}
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
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
  digitText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  cursor: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
});
