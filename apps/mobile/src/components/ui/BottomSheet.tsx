import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoint?: number;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoint = 0.5,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const sheetHeight = SCREEN_HEIGHT * snapPoint;

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, springs.gentle);
      backdropOpacity.value = withTiming(1, timing.normal);
    } else {
      translateY.value = withSpring(
        sheetHeight + 50,
        springs.default,
        (finished) => {
          if (finished) runOnJS(close)();
        },
      );
      backdropOpacity.value = withTiming(0, timing.normal);
    }
  }, [visible, sheetHeight, translateY, backdropOpacity, close]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && translateY.value >= sheetHeight) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom,
              backgroundColor: colors.bgSecondary,
              borderColor: colors.borderSubtle,
            },
            sheetStyle,
          ]}>
          <View style={styles.handleContainer}>
            <View
              style={[styles.handle, { backgroundColor: colors.textTertiary }]}
            />
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['20'],
  },
});
