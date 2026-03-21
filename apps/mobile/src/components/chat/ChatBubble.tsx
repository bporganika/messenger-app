import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { radius, spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import type { MessageType, MessageStatus as Status } from '@pulse/shared';
import { Text } from '../ui/Text';
import { MessageStatus } from './MessageStatus';
import { PhotoBubble } from './PhotoBubble';
import { VideoBubble } from './VideoBubble';
import { DocumentBubble } from './DocumentBubble';
import { VoicePlayer } from './VoicePlayer';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChatBubbleProps {
  id: string;
  type: MessageType;
  isSent: boolean;
  text?: string;
  timestamp: string;
  status?: Status;
  // reply
  replyToSender?: string;
  replyToText?: string;
  // media
  mediaUri?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaDuration?: string;
  // file
  fileName?: string;
  fileSize?: string;
  // voice
  waveform?: number[];
  voicePlaying?: boolean;
  voiceProgress?: number;
  voiceCurrentTime?: string;
  // callbacks
  onPress?: () => void;
  onLongPress?: () => void;
  onMediaPress?: () => void;
  onPlayPause?: () => void;
}

export const ChatBubble = React.memo(function ChatBubble({
  type,
  isSent,
  text,
  timestamp,
  status,
  replyToSender,
  replyToText,
  mediaUri,
  mediaWidth,
  mediaHeight,
  mediaDuration,
  fileName,
  fileSize,
  waveform,
  voicePlaying,
  voiceProgress,
  voiceCurrentTime,
  onPress,
  onLongPress,
  onMediaPress,
  onPlayPause,
}: ChatBubbleProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const bubbleRadius = isSent ? radius.bubbleSent : radius.bubbleReceived;
  const bgColor = isSent ? colors.bubbleSentBg : colors.bubbleReceivedBg;
  const borderColor = isSent
    ? colors.bubbleSentBorder
    : colors.bubbleReceivedBorder;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  const handleLongPress = useCallback(() => {
    haptics.longPress();
    onLongPress?.();
  }, [onLongPress]);

  const renderContent = () => {
    switch (type) {
      case 'image':
        return mediaUri ? (
          <PhotoBubble
            uri={mediaUri}
            width={mediaWidth}
            height={mediaHeight}
            onPress={onMediaPress}
            onLongPress={onLongPress}
          />
        ) : null;

      case 'video':
        return mediaUri ? (
          <VideoBubble
            thumbnailUri={mediaUri}
            duration={mediaDuration}
            width={mediaWidth}
            height={mediaHeight}
            onPress={onMediaPress}
            onLongPress={onLongPress}
          />
        ) : null;

      case 'voice':
        return (
          <VoicePlayer
            duration={mediaDuration ?? '0:00'}
            currentTime={voiceCurrentTime}
            waveform={waveform}
            playing={voicePlaying}
            progress={voiceProgress}
            onPlayPause={onPlayPause}
            onLongPress={onLongPress}
          />
        );

      case 'file':
        return (
          <DocumentBubble
            fileName={fileName ?? 'File'}
            fileSize={fileSize ?? ''}
            onPress={onMediaPress}
            onLongPress={onLongPress}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200).withInitialValues({
        opacity: 0,
        transform: [{ translateY: 10 }, { scale: 0.97 }],
      })}
      style={[
        styles.wrapper,
        isSent ? styles.wrapperSent : styles.wrapperReceived,
      ]}>
      <AnimatedPressable
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.bubble,
          {
            backgroundColor: bgColor,
            borderColor,
            borderTopLeftRadius: bubbleRadius.topLeft,
            borderTopRightRadius: bubbleRadius.topRight,
            borderBottomLeftRadius: bubbleRadius.bottomLeft,
            borderBottomRightRadius: bubbleRadius.bottomRight,
          },
          animatedStyle,
        ]}>
        {replyToSender && replyToText && (
          <View
            style={[
              styles.reply,
              { borderStartColor: colors.accentPrimary, backgroundColor: colors.surfaceDefault },
            ]}>
            <Text
              variant="caption"
              color={colors.accentPrimary}
              numberOfLines={1}>
              {replyToSender}
            </Text>
            <Text
              variant="bodySm"
              color={colors.textSecondary}
              numberOfLines={1}>
              {replyToText}
            </Text>
          </View>
        )}

        {renderContent()}

        {type === 'text' && text && (
          <Text variant="body">{text}</Text>
        )}

        <View style={styles.meta}>
          <Text variant="mono" color={colors.textTertiary}>
            {timestamp}
          </Text>
          {isSent && status && <MessageStatus status={status} />}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing['12'],
    marginVertical: spacing['2'],
  },
  wrapperSent: {
    alignItems: 'flex-end',
  },
  wrapperReceived: {
    alignItems: 'flex-start',
  },
  bubble: {
    borderWidth: 1,
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
    maxWidth: '80%',
  },
  reply: {
    borderStartWidth: 2,
    borderRadius: radius.xs,
    paddingHorizontal: spacing['8'],
    paddingVertical: spacing['4'],
    marginBottom: spacing['6'],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing['4'],
  },
});
