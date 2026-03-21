import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { api } from '../../services/api';
import { formatMessageTime } from '../../utils/dateFormatter';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { Text, EmptyState } from '../../components/ui';
import {
  ChatBubble,
  ChatHeader,
  MessageInput,
  TypingIndicator,
  ReplyPreview,
  VoiceRecorder,
  DateSeparator,
  SwipeToReply,
  AttachmentPicker,
  EmptyChatPlaceholder,
} from '../../components/chat';
import type { ChatScreenProps } from '../../navigation/types';
import type { ChatMessage, ListItem } from './chatTypes';
import { getPreviewForType } from './chatTypes';

// ─── Screen ─────────────────────────────────────────────
export function ChatScreen({ navigation, route }: ChatScreenProps<'Chat'>) {
  const { conversationId, name, avatarUrl } = route.params;
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState('0:00');
  const [attachVisible, setAttachVisible] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Send message ──
  const handleSend = useCallback(() => {
    const text = messageText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'text',
      isSent: true,
      text,
      timestamp: formatMessageTime(new Date()),
      status: 'sending',
      replyToId: replyTo?.id,
      replyToSender: replyTo ? (replyTo.isSent ? t('chat.you') : name) : undefined,
      replyToText: replyTo?.text ?? getPreviewForType(replyTo?.type, t),
    };

    setMessages((prev) => [newMsg, ...prev]);
    setMessageText('');
    setReplyTo(null);
    haptics.sendMessage();
  }, [messageText, replyTo, name, t]);

  // ── Reply ──
  const handleReply = useCallback((msg: ChatMessage) => {
    setReplyTo(msg);
  }, []);

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
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setRecordElapsed('0:00');
  }, []);

  const handleVoiceSend = useCallback(() => {
    stopRecording();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'voice',
      isSent: true,
      timestamp: formatMessageTime(new Date()),
      status: 'sending',
      mediaDuration: recordElapsed,
    };
    setMessages((prev) => [newMsg, ...prev]);
  }, [recordElapsed, stopRecording]);

  const handleVoiceCancel = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // ── Cursor pagination (load older) ──
  const handleLoadOlder = useCallback(async () => {
    if (loadingOlder || !hasOlderMessages) return;
    setLoadingOlder(true);
    try {
      const oldestId = messages[messages.length - 1]?.id;
      const data = await api.get<{ messages: ChatMessage[]; hasMore: boolean }>(
        `/conversations/${conversationId}/messages`,
        { params: { ...(oldestId ? { cursor: oldestId } : {}), limit: '50' } },
      );
      setMessages((prev) => [...prev, ...data.messages]);
      setHasOlderMessages(data.hasMore);
    } catch {
      if (messages.length === 0) setLoadError(true);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasOlderMessages, messages, conversationId]);

  // ── Load initial messages ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleLoadOlder();
  }, []);

  // ── Attachments ──
  const handleAttachCamera = useCallback(() => {
    setAttachVisible(false);
  }, []);

  const handleAttachGallery = useCallback(() => {
    setAttachVisible(false);
  }, []);

  const handleAttachDocument = useCallback(() => {
    setAttachVisible(false);
  }, []);

  // ── Media press -> viewer ──
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
  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    if (isTyping) {
      items.push({ type: 'typing' });
    }

    for (const msg of messages) {
      items.push({ type: 'message', data: msg });
    }

    if (messages.length > 0) {
      items.push({ type: 'date', label: t('chat.today') });
    }

    return items;
  }, [messages, isTyping, t]);

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
        <SwipeToReply onReply={() => handleReply(msg)} enabled>
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
            onLongPress={() => {}}
          />
        </SwipeToReply>
      );
    },
    [handleReply, handleMediaPress],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* ── Header ── */}
      <ChatHeader
        name={name}
        avatarUrl={avatarUrl}
        isTyping={isTyping}
        paddingTop={insets.top + spacing['4']}
        onBack={() => navigation.goBack()}
        onProfilePress={() => {}}
        onVoiceCall={() => {}}
        onVideoCall={() => {}}
      />

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
          loadError ? (
            <EmptyState
              title={t('common.error')}
              actionTitle={t('common.retry')}
              onAction={() => { setLoadError(false); handleLoadOlder(); }}
            />
          ) : (
            <EmptyChatPlaceholder />
          )
        }
      />

      {/* ── Reply preview ── */}
      {replyTo && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
          <ReplyPreview
            senderName={replyTo.isSent ? t('chat.you') : name}
            messageText={replyTo.text ?? getPreviewForType(replyTo.type, t)}
            onDismiss={dismissReply}
          />
        </Animated.View>
      )}

      {/* ── Voice recorder overlay ── */}
      {isRecording && (
        <View
          style={[
            styles.recorderWrap,
            { backgroundColor: colors.surfaceElevated, borderTopColor: colors.separator },
          ]}>
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
      <AttachmentPicker
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onCamera={handleAttachCamera}
        onGallery={handleAttachGallery}
        onDocument={handleAttachDocument}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: spacing['8'],
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingOlder: {
    paddingVertical: spacing['12'],
    alignItems: 'center',
  },
  recorderWrap: {
    borderTopWidth: 1,
    paddingHorizontal: spacing['12'],
    paddingVertical: spacing['8'],
  },
});
