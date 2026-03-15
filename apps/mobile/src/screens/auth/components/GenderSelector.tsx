import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../design-system';
import { springs } from '../../../design-system/animations';
import { spacing, radius } from '../../../design-system/tokens';
import { haptics } from '../../../design-system/haptics';
import { Text } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

// ─── Types ──────────────────────────────────────────────
export const GENDER_KEYS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

export type GenderKey = (typeof GENDER_KEYS)[number];

const GENDER_I18N_MAP: Record<GenderKey, string> = {
  MALE: 'profileSetup.genderMale',
  FEMALE: 'profileSetup.genderFemale',
  OTHER: 'profileSetup.genderOther',
  PREFER_NOT_TO_SAY: 'profileSetup.genderPreferNot',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Gender Chip ────────────────────────────────────────
function GenderChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.genderChip,
        {
          backgroundColor: selected
            ? colors.accentPrimary + '1A'
            : colors.surfaceDefault,
          borderColor: selected
            ? colors.accentPrimary
            : colors.borderDefault,
        },
        animStyle,
      ]}>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected
              ? colors.accentPrimary
              : colors.textTertiary,
          },
        ]}>
        {selected && (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: colors.accentPrimary },
            ]}
          />
        )}
      </View>
      <Text
        variant="bodySm"
        color={selected ? colors.accentPrimary : colors.textPrimary}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Exported Props ─────────────────────────────────────
export interface GenderSelectorProps {
  value: GenderKey;
  onChange: (gender: GenderKey) => void;
}

// ─── Main Component ─────────────────────────────────────
export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <Text
        variant="caption"
        color={colors.textSecondary}
        style={styles.genderLabel}>
        {t('profileSetup.gender')}
      </Text>
      <View style={styles.genderRow}>
        {GENDER_KEYS.map((key) => (
          <GenderChip
            key={key}
            label={t(GENDER_I18N_MAP[key])}
            selected={value === key}
            onPress={() => onChange(key)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  genderLabel: {
    marginBottom: spacing['8'],
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['8'],
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing['6'],
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
