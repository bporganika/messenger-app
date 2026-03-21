import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import type { MessageStatus as Status, MessageType } from '@pulse/shared';
import { Text } from '../ui/Text';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { MessageStatus } from './MessageStatus';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OnlineStatus = 'online' | 'offline' | 'away';

export interface ChatListItemProps {
  id: string;
  name: string;
  avatarUri?: string;
  onlineStatus?: OnlineStatus;
  lastMessage?: string;
  lastMessageType?: MessageType;
  lastMessageStatus?: Status;
  lastMessageIsSent?: boolean;
  timestamp?: string;
  unreadCount?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

function getMessagePreview(
  type: MessageType | undefined,
  text: string | undefined,
  t: (key: string) => string,
): string {
  if (type === 'image') return '📷 ' + t('chat.photo');
  if (type === 'video') return '🎬 ' + t('chat.videoType');
  if (type === 'voice') return '🎤 ' + t('chat.voiceMessage');
  if (type === 'file') return '📎 ' + t('chat.document');
  return text ?? '';
}

export const ChatListItem = React.memo(function ChatListItem({
  name,
  avatarUri,
  onlineStatus,
  lastMessage,
  lastMessageType,
  lastMessageStatus,
  lastMessageIsSent,
  timestamp,
  unreadCount = 0,
  onPress,
  onLongPress,
  style,
}: ChatListItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    haptics.buttonPress();
    onPress?.();
  }, [onPress]);

  const handleLongPress = useCallback(() => {
    haptics.longPress();
    onLongPress?.();
  }, [onLongPress]);

  const preview = getMessagePreview(lastMessageType, lastMessage, t);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style, animatedStyle]}>
      <Avatar
        uri={avatarUri}
        name={name}
        size="lg"
        status={onlineStatus}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text variant="bodyLg" numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          {timestamp && (
            <Text
              variant="caption"
              color={
                unreadCount > 0
                  ? colors.accentPrimary
                  : colors.textTertiary
              }>
              {timestamp}
            </Text>
          )}
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.previewRow}>
            {lastMessageIsSent && lastMessageStatus && (
              <MessageStatus status={lastMessageStatus} />
            )}
            <Text
              variant="bodySm"
              color={colors.textSecondary}
              numberOfLines={1}
              style={styles.preview}>
              {preview}
            </Text>
          </View>
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  content: {
    flex: 1,
    marginStart: spacing['12'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['4'],
  },
  name: {
    flex: 1,
    marginEnd: spacing['8'],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginEnd: spacing['8'],
  },
  preview: {
    flex: 1,
  },
});
