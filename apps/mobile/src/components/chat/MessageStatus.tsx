import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import type { MessageStatus as Status } from '@pulse/shared';

export interface MessageStatusProps {
  status: Status;
}

const CHECK_SIZE = 16;

function SingleCheck({ color }: { color: string }) {
  return (
    <Svg width={CHECK_SIZE} height={CHECK_SIZE} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l5 5L20 7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DoubleCheck({ color }: { color: string }) {
  return (
    <Svg width={CHECK_SIZE + 4} height={CHECK_SIZE} viewBox="0 0 28 24" fill="none">
      <Path
        d="M2 12.5l5 5L17.5 7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 12.5l5 5L24 7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MessageStatus({ status }: MessageStatusProps) {
  const { colors } = useTheme();

  if (status === 'sending') {
    return (
      <View style={styles.container}>
        <View
          style={[styles.clock, { borderColor: colors.textTertiary }]}
        />
      </View>
    );
  }

  if (status === 'sent') {
    return (
      <View style={styles.container}>
        <SingleCheck color={colors.textTertiary} />
      </View>
    );
  }

  if (status === 'delivered') {
    return (
      <View style={styles.container}>
        <DoubleCheck color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DoubleCheck color={colors.accentPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 4,
  },
  clock: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
