import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Avatar } from '../ui';
import type { PulseContact } from './types';

// ─── Types ──────────────────────────────────────────────
export interface ContactRowProps {
  contact: PulseContact;
  onPress: () => void;
}

// ─── Component ──────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ContactRow = React.memo(function ContactRow({ contact, onPress }: ContactRowProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springs.snappy);
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
      style={[styles.contactRow, animStyle]}>
      <Avatar
        uri={contact.avatarUrl}
        name={contact.name}
        size="md"
        status={contact.onlineStatus}
      />
      <View style={styles.contactInfo}>
        <Text variant="bodyLg" numberOfLines={1} style={styles.contactName}>
          {contact.name}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} numberOfLines={1}>
          @{contact.username}
        </Text>
      </View>
    </AnimatedPressable>
  );
});

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  contactInfo: {
    flex: 1,
    marginStart: spacing['12'],
  },
  contactName: {
    fontWeight: '600',
    marginBottom: spacing['2'],
  },
});
