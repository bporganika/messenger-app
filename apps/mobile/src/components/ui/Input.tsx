import React, { useState, useCallback } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { timing } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { typography, fontFamily } from '../../design-system/typography';
import { Text } from './Text';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderProgress = useSharedValue(0);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setFocused(true);
      borderProgress.value = withTiming(1, timing.fast);
      rest.onFocus?.(e);
    },
    [borderProgress, rest],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setFocused(false);
      borderProgress.value = withTiming(0, timing.fast);
      rest.onBlur?.(e);
    },
    [borderProgress, rest],
  );

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor:
      borderProgress.value > 0.5
        ? error
          ? colors.accentError
          : colors.borderFocus
        : error
          ? colors.accentError
          : colors.borderDefault,
  }));

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          variant="caption"
          color={
            error
              ? colors.accentError
              : focused
                ? colors.accentPrimary
                : colors.textSecondary
          }
          style={styles.label}>
          {label}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceDefault,
            borderColor: colors.borderDefault,
          },
          animatedBorder,
        ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={colors.textPlaceholder}
          selectionColor={colors.accentPrimary}
          {...rest}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontFamily: fontFamily.regular,
              fontSize: typography.body.fontSize,
            },
          ]}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </AnimatedView>
      {error && (
        <Text variant="caption" color={colors.accentError} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing['6'],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing['16'],
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    includeFontPadding: false,
  },
  iconLeft: {
    marginEnd: spacing['12'],
  },
  iconRight: {
    marginStart: spacing['12'],
  },
  error: {
    marginTop: spacing['4'],
  },
});
