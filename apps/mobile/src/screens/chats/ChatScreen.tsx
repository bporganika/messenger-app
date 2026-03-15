import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs, timing } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { Text, Avatar, BottomSheet } from '../../components/ui';
import {
  ChatBubble,
  MessageInput,
  TypingIndicator,
  ReplyPreview,
  VoiceRecorder,
} from '../../components/chat';
import type { ChatBubbleProps } from '../../components/chat';
import type { ChatScreenProps } from '../../navigation/types';
import type { MessageType, MessageStatus } from '@pulse/shared';

// ─── Types ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  type: MessageType;
  isSent: boolean;
  text?: string;
  timestamp: string;
  status?: MessageStatus;
  replyToId?: string;
  replyToSender?: string;
  replyToText?: string;
  mediaUri?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaDuration?: string;
  fileName?: string;
  fileSize?: string;
  waveform?: number[];
}

// ─── Demo Data ──────────────────────────────────────────
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'text',
    isSent: false,
    text: 'Hey! How are you doing?',
    timestamp: '10:30',
  },
  {
    id: '2',
    type: 'text',
    isSent: true,
    text: "I'm great! Working on something exciting 🚀",
    timestamp: '10:32',
    status: 'read',
  },
  {
    id: '3',
    type: 'image',
    isSent: false,
    timestamp: '10:33',
    mediaUri: 'https://picsum.photos/400/300',
    mediaWidth: 400,
    mediaHeight: 300,
  },
  {
    id: '4',
    type: 'voice',
    isSent: false,
    timestamp: '10:35',
    mediaDuration: '0:15',
    waveform: [0.3, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.6, 0.3, 0.8, 0.9, 0.5, 0.7, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.6, 0.4, 0.9, 0.5, 0.3, 0.7, 0.6, 0.8],
  },
  {
    id: '5',
    type: 'file',
    isSent: true,
    timestamp: '10:37',
    status: 'delivered',
    fileName: 'report.pdf',
    fileSize: '2.4 MB',
  },
  {
    id: '6',
    type: 'text',
    isSent: true,
    text: 'Check out this report',
    timestamp: '10:37',
    status: 'delivered',
    replyToId: '1',
    replyToSender: 'John',
    replyToText: 'Hey! How are you doing?',
  },
  {
    id: '7',
    type: 'video',
    isSent: false,
    timestamp: '10:40',
    mediaUri: 'https://picsum.photos/320/240',
    mediaWidth: 320,
    mediaHeight: 240,
    mediaDuration: '1:24',
  },
  {
    id: '8',
    type: 'text',
    isSent: true,
    text: 'This looks amazing! Can you share more details about it?',
    timestamp: '10:42',
    status: 'sent',
  },
];

// ─── Date separator ─────────────────────────────────────
function DateSeparator({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.dateSeparator}>
      <View
        style={[
          styles.datePill,
          { backgroundColor: colors.surfaceDefault },
        ]}>
        <Text variant="caption" color={colors.textTertiary}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ─── Swipe-to-reply wrapper ─────────────────────────────
const REPLY_THRESHOLD = 60;

function SwipeToReply({
  children,
  onReply,
  enabled,
}: {
  children: React.ReactNode;
  onReply: () => void;
  enabled: boolean;
}) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const replyIconScale = useSharedValue(0);
  const didTrigger = useRef(false);

  const triggerReply = useCallback(() => {
    haptics.toggleSwitch();
    onReply();
  }, [onReply]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([15, 999])
    .failOffsetY([-10, 10])
    .enabled(enabled)
    .onUpdate((e) => {
      const tx = Math.max(0, e.translationX);
      translateX.value = tx > REPLY_THRESHOLD ? REPLY_THRESHOLD + (tx - REPLY_THRESHOLD) * 0.3 : tx;
      replyIconScale.value = Math.min(tx / REPLY_THRESHOLD, 1);

      if (tx >= REPLY_THRESHOLD && !didTrigger.current) {
        didTrigger.current = true;
        runOnJS(triggerReply)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, springs.snappy);
      replyIconScale.value = withTiming(0, timing.fast);
      didTrigger.current = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: replyIconScale.value }],
    opacity: replyIconScale.value,
  }));

  return (
    <View>
      <Animated.View style={[styles.replyIconWrap, iconStyle]}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 14L4 9l5-5"
            stroke={colors.accentPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M20 20v-7a4 4 0 00-4-4H4"
            stroke={colors.accentPrimary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── Attach sheet option ────────────────────────────────
function AttachOption({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={[styles.attachOption, { borderBottomColor: colors.separator }]}>
      {icon}
      <Text variant="bodyLg" style={styles.attachLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Screen ─────────────────────────────────────────────
export function ChatScreen({ navigation, route }: ChatScreenProps<'Chat'>) {
  const { conversationId, name, avatarUrl } = route.params;
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [messageText, setMessageText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState('0:00');
  const [attachVisible, setAttachVisible] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate typing indicator disappearing
  useEffect(() => {
    const timeout = setTimeout(() => setIsTyping(false), 4000);
    return () => clearTimeout(timeout);
  }, []);

  // ── Send message ──
  const handleSend = useCallback(() => {
    const text = messageText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'text',
      isSent: true,
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      status: 'sending',
      replyToId: replyTo?.id,
      replyToSender: replyTo ? (replyTo.isSent ? t('chat.you') : name) : undefined,
      replyToText: replyTo?.text ?? getPreviewForType(replyTo?.type, t),
    };

    setMessages((prev) => [newMsg, ...prev]);
    setMessageText('');
    setReplyTo(null);
    haptics.sendMessage();

    // TODO: emit message:send via socket
    // Simulate status progression
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'sent' as MessageStatus } : m,
        ),
      );
    }, 500);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id
            ? { ...m, status: 'delivered' as MessageStatus }
            : m,
        ),
      );
    }, 1500);
  }, [messageText, replyTo, name]);

  // ── Reply ──
  const handleReply = useCallback(
    (msg: ChatMessage) => {
      setReplyTo(msg);
    },
    [],
  );

  const dismissReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  // ── Voice recording ──
  const startRecording = useCallback(() => {
    setIsRecording(true);
    haptics.longPress();
    let seconds = 0;
    recordTimerRef.current = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setRecordElapsed(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    // TODO: start actual audio recording
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setRecordElapsed('0:00');
  }, []);

  const handleVoiceSend = useCallback(() => {
    stopRecording();
    // TODO: upload voice + send message
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'voice',
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      status: 'sending',
      mediaDuration: recordElapsed,
    };
    setMessages((prev) => [newMsg, ...prev]);
  }, [recordElapsed, stopRecording]);

  const handleVoiceCancel = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // ── Cursor pagination (load older) ──
  const handleLoadOlder = useCallback(() => {
    if (loadingOlder || !hasOlderMessages) return;
    setLoadingOlder(true);
    // TODO: call GET /conversations/:id/messages?cursor=oldest_id&limit=50
    setTimeout(() => {
      setLoadingOlder(false);
      // Simulate: no more messages
      setHasOlderMessages(false);
    }, 800);
  }, [loadingOlder, hasOlderMessages]);

  // ── Attachments ──
  const handleAttachCamera = useCallback(() => {
    setAttachVisible(false);
    // TODO: launchCamera, create image message
  }, []);

  const handleAttachGallery = useCallback(() => {
    setAttachVisible(false);
    // TODO: launchImageLibrary, create image/video message
  }, []);

  const handleAttachDocument = useCallback(() => {
    setAttachVisible(false);
    // TODO: DocumentPicker, create file message
  }, []);

  // ── Media press → viewer ──
  const handleMediaPress = useCallback(
    (msg: ChatMessage) => {
      if (msg.type === 'image' && msg.mediaUri) {
        navigation.navigate('MediaViewer', {
          uri: msg.mediaUri,
          type: 'image',
        });
      } else if (msg.type === 'video' && msg.mediaUri) {
        navigation.navigate('MediaViewer', {
          uri: msg.mediaUri,
          type: 'video',
        });
      }
    },
    [navigation],
  );

  // ── FlatList data: with date separators ──
  type ListItem =
    | { type: 'message'; data: ChatMessage }
    | { type: 'date'; label: string }
    | { type: 'typing' };

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // Typing indicator at index 0 (bottom, since inverted)
    if (isTyping) {
      items.push({ type: 'typing' });
    }

    // Messages
    let lastDate = '';
    for (const msg of messages) {
      items.push({ type: 'message', data: msg });

      // Insert date separator after last message in a group (remember: inverted)
      // For demo, just add one at the boundary
    }

    // Add date separator at the end (top of list)
    if (messages.length > 0) {
      items.push({ type: 'date', label: t('chat.today') });
    }

    return items;
  }, [messages, isTyping]);

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === 'message') return item.data.id;
    if (item.type === 'typing') return 'typing';
    return `date-${index}`;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'typing') {
        return <TypingIndicator visible />;
      }

      if (item.type === 'date') {
        return <DateSeparator label={item.label} />;
      }

      const msg = item.data;

      return (
        <SwipeToReply
          onReply={() => handleReply(msg)}
          enabled>
          <ChatBubble
            id={msg.id}
            type={msg.type}
            isSent={msg.isSent}
            text={msg.text}
            timestamp={msg.timestamp}
            status={msg.status}
            replyToSender={msg.replyToSender}
            replyToText={msg.replyToText}
            mediaUri={msg.mediaUri}
            mediaWidth={msg.mediaWidth}
            mediaHeight={msg.mediaHeight}
            mediaDuration={msg.mediaDuration}
            fileName={msg.fileName}
            fileSize={msg.fileSize}
            waveform={msg.waveform}
            onMediaPress={() => handleMediaPress(msg)}
            onLongPress={() => {
              // TODO: message context menu (copy, forward, delete, etc.)
            }}
          />
        </SwipeToReply>
      );
    },
    [handleReply, handleMediaPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing['4'],
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.separator,
          },
        ]}>
        <Pressable
          onPress={() => {
            haptics.buttonPress();
            navigation.goBack();
          }}
          hitSlop={12}
          style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        <Pressable
          style={styles.headerInfo}
          onPress={() => {
            haptics.buttonPress();
            // TODO: navigate to UserProfileScreen
          }}>
          <Avatar uri={avatarUrl} name={name} size="sm" status="online" />
          <View style={styles.headerText}>
            <Text variant="title" numberOfLines={1}>
              {name}
            </Text>
            {isTyping ? (
              <Text variant="caption" color={colors.accentPrimary}>
                {t('chat.typing')}
              </Text>
            ) : (
              <Text variant="caption" color={colors.accentSuccess}>
                {t('chat.online')}
              </Text>
            )}
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              // TODO: initiate voice call
            }}
            hitSlop={8}
            style={styles.headerActionBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke={colors.textPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Pressable
            onPress={() => {
              haptics.buttonPress();
              // TODO: initiate video call
            }}
            hitSlop={8}
            style={styles.headerActionBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
                stroke={colors.textPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* ── Messages (inverted FlatList) ── */}
      <FlatList
        ref={flatListRef}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        inverted
        contentContainerStyle={
          listData.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadOlder}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingOlder ? (
            <View style={styles.loadingOlder}>
              <Text variant="caption" color={colors.textTertiary}>
                {t('common.loading')}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke={colors.textTertiary}
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text
              variant="bodySm"
              color={colors.textTertiary}
              align="center"
              style={styles.emptyText}>
              {t('chat.noMessages')}
            </Text>
          </View>
        }
      />

      {/* ── Reply preview ── */}
      {replyTo && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
          <ReplyPreview
            senderName={replyTo.isSent ? t('chat.you') : name}
            messageText={
              replyTo.text ?? getPreviewForType(replyTo.type, t)
            }
            onDismiss={dismissReply}
          />
        </Animated.View>
      )}

      {/* ── Voice recorder overlay ── */}
      {isRecording && (
        <View style={[styles.recorderWrap, { backgroundColor: colors.surfaceElevated, borderTopColor: colors.separator }]}>
          <VoiceRecorder
            recording={isRecording}
            elapsed={recordElapsed}
            onSend={handleVoiceSend}
            onCancel={handleVoiceCancel}
          />
        </View>
      )}

      {/* ── Message input ── */}
      {!isRecording && (
        <MessageInput
          value={messageText}
          onChangeText={setMessageText}
          onSend={handleSend}
          onAttach={() => setAttachVisible((v) => !v)}
          onMicPressIn={startRecording}
          attachOpen={attachVisible}
          placeholder={t('chat.messagePlaceholder')}
        />
      )}

      {/* ── Attachment picker ── */}
      <BottomSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        snapPoint={0.3}>
        <Text variant="title" style={styles.attachTitle}>
          {t('chat.attach')}
        </Text>

        <AttachOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx={12}
                cy={13}
                r={4}
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
              />
            </Svg>
          }
          label={t('chat.camera')}
          onPress={handleAttachCamera}
        />

        <AttachOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                fill={colors.accentPrimary}
              />
              <Path
                d="M21 15l-5-5L5 21"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('chat.gallery')}
          onPress={handleAttachGallery}
        />

        <AttachOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M14 2v6h6"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('chat.document')}
          onPress={handleAttachDocument}
        />
      </BottomSheet>
    </View>
  );
}

// ─── Helper ─────────────────────────────────────────────
function getPreviewForType(type?: MessageType, t?: (key: string) => string): string {
  switch (type) {
    case 'image':
      return '📷 ' + (t ? t('chat.photo') : 'Photo');
    case 'video':
      return '🎬 ' + (t ? t('chat.videoType') : 'Video');
    case 'voice':
      return '🎤 ' + (t ? t('chat.voiceMessage') : 'Voice message');
    case 'file':
      return '📎 ' + (t ? t('chat.document') : 'Document');
    default:
      return '';
  }
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing['8'],
    paddingHorizontal: spacing['8'],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['8'],
    marginLeft: spacing['4'],
  },
  headerText: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing['4'],
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  list: {
    paddingVertical: spacing['8'],
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    transform: [{ scaleY: -1 }],
    alignItems: 'center',
    padding: spacing['32'],
    gap: spacing['12'],
  },
  emptyText: {
    marginTop: spacing['4'],
  },
  loadingOlder: {
    paddingVertical: spacing['12'],
    alignItems: 'center',
  },

  // Date separator
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    transform: [{ scaleY: -1 }],
  },
  datePill: {
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['4'],
    borderRadius: radius.full,
  },

  // Swipe to reply
  replyIconWrap: {
    position: 'absolute',
    left: spacing['4'],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: 36,
    alignItems: 'center',
  },

  // Recorder
  recorderWrap: {
    borderTopWidth: 1,
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
  },

  // Attach sheet
  attachTitle: {
    marginBottom: spacing['12'],
  },
  attachOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['12'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing['12'],
  },
  attachLabel: {
    flex: 1,
  },
});
