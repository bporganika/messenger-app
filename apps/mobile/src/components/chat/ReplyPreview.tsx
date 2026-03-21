import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { Text } from '../ui/Text';

export interface ReplyPreviewProps {
  senderName: string;
  messageText: string;
  onDismiss?: () => void;
}

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReplyPreview({
  senderName,
  messageText,
  onDismiss,
}: ReplyPreviewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceDefault,
          borderStartColor: colors.accentPrimary,
        },
      ]}>
      <View style={styles.content}>
        <Text
          variant="caption"
          color={colors.accentPrimary}
          numberOfLines={1}>
          {senderName}
        </Text>
        <Text
          variant="bodySm"
          color={colors.textSecondary}
          numberOfLines={1}>
          {messageText}
        </Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.close}>
          <CloseIcon color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderStartWidth: 3,
    borderRadius: radius.sm,
    paddingVertical: spacing['6'],
    paddingHorizontal: spacing['12'],
    marginHorizontal: spacing['12'],
    marginBottom: spacing['6'],
  },
  content: {
    flex: 1,
  },
  close: {
    marginStart: spacing['12'],
    padding: spacing['4'],
  },
});
