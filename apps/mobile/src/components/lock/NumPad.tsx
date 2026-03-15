import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text } from '../ui';

// ─── Types ──────────────────────────────────────────────
export type NumPadProps = {
  /** Called when a digit (0-9) is pressed */
  onDigit: (digit: string) => void;
  /** Called when the delete key is pressed */
  onDelete: () => void;
  /** Called when the biometric key is pressed (bottom-left) */
  onBiometric?: () => void;
  /** Whether to show the biometric button */
  biometricEnabled: boolean;
};

// ─── Icons ──────────────────────────────────────────────
const ICON = {
  fingerprint:
    'M12 10v4M6.5 13a6.5 6.5 0 0013 0M2 16a10 10 0 0020-4M12 3a7 7 0 00-7 7M17 7a5 5 0 00-5-5',
  delete: 'M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6',
};

// ─── Single Key ─────────────────────────────────────────
function NumpadKey({
  value,
  onPress,
  children,
}: {
  value: string;
  onPress: (v: string) => void;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.88, springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={() => {
        haptics.buttonPress();
        onPress(value);
      }}
      style={styles.keyWrap}>
      <Animated.View
        style={[
          styles.key,
          { backgroundColor: colors.surfaceDefault },
          animStyle,
        ]}>
        {children ?? (
          <Text variant="heading" color={colors.textPrimary}>
            {value}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── NumPad ─────────────────────────────────────────────
export function NumPad({
  onDigit,
  onDelete,
  onBiometric,
  biometricEnabled,
}: NumPadProps) {
  const { colors, brand } = useTheme();

  return (
    <View style={styles.numpad}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <NumpadKey key={d} value={d} onPress={onDigit} />
      ))}

      {/* Bottom row: biometric / 0 / delete */}
      {biometricEnabled ? (
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            onBiometric?.();
          }}
          style={styles.keyWrap}>
          <View style={[styles.key, styles.keyTransparent]}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path
                d={ICON.fingerprint}
                stroke={brand.violet}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </Pressable>
      ) : (
        <View style={styles.keyWrap} />
      )}

      <NumpadKey value="0" onPress={onDigit} />

      <Pressable
        onPress={() => {
          haptics.buttonPress();
          onDelete();
        }}
        style={styles.keyWrap}>
        <View style={[styles.key, styles.keyTransparent]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d={ICON.delete}
              stroke={colors.textSecondary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </Pressable>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 270,
    gap: spacing['12'],
  },
  keyWrap: {
    width: 74,
    height: 54,
  },
  key: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTransparent: {
    backgroundColor: 'transparent',
  },
});
