import admin from 'firebase-admin';
import { prisma } from '../utils/prisma';
import { getOnlineUsers } from '../websocket';

// ─── Firebase Admin init ─────────────────────────────────

let initialized = false;

function ensureInit(): void {
  if (initialized) return;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  initialized = true;
}

// ─── Payload types ───────────────────────────────────────

interface MessagePushPayload {
  type: 'message';
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: string;
}

interface CallPushPayload {
  type: 'call';
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
}

// ─── Send message notification ───────────────────────────

export async function sendMessageNotification(
  recipientId: string,
  payload: MessagePushPayload,
): Promise<void> {
  ensureInit();

  // Don't push if user is online (they get socket events)
  if (getOnlineUsers().has(recipientId)) return;

  const tokens = await prisma.pushToken.findMany({
    where: { userId: recipientId, isVoIP: false },
  });

  if (tokens.length === 0) return;

  const contentPreview = formatPreview(payload.content, payload.messageType);

  const messages = tokens.map((t) => ({
    token: t.token,
    notification: {
      title: payload.senderName,
      body: contentPreview,
    },
    data: {
      type: payload.type,
      conversationId: payload.conversationId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar ?? '',
      content: payload.content ?? '',
      messageType: payload.messageType,
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'pulse_messages',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: 'default',
        },
      },
    },
  }));

  const response = await admin.messaging().sendEach(messages);
  await cleanupInvalidTokens(tokens, response);
}

// ─── Send call notification ──────────────────────────────

export async function sendCallNotification(
  recipientId: string,
  payload: CallPushPayload,
): Promise<void> {
  ensureInit();

  // iOS: send via VoIP push token for CallKit
  const voipTokens = await prisma.pushToken.findMany({
    where: { userId: recipientId, isVoIP: true, platform: 'IOS' },
  });

  // Android + iOS fallback: send high-priority FCM
  const fcmTokens = await prisma.pushToken.findMany({
    where: { userId: recipientId, isVoIP: false },
  });

  const data = {
    type: payload.type,
    callId: payload.callId,
    callerId: payload.callerId,
    callerName: payload.callerName,
    callerAvatar: payload.callerAvatar ?? '',
    callType: payload.callType,
  };

  // VoIP push for iOS (triggers CallKit even when app is killed)
  if (voipTokens.length > 0) {
    const voipMessages = voipTokens.map((t) => ({
      token: t.token,
      data,
      apns: {
        headers: {
          'apns-push-type': 'voip',
          'apns-priority': '10',
          'apns-topic': `${process.env['APPLE_BUNDLE_ID'] ?? 'com.pulse.messenger'}.voip`,
        },
        payload: { aps: {} },
      },
    }));

    const response = await admin.messaging().sendEach(voipMessages);
    await cleanupInvalidTokens(voipTokens, response);
  }

  // FCM for Android (full-screen intent via ConnectionService)
  const androidTokens = fcmTokens.filter((t) => t.platform === 'ANDROID');
  if (androidTokens.length > 0) {
    const androidMessages = androidTokens.map((t) => ({
      token: t.token,
      data,
      android: {
        priority: 'high' as const,
        ttl: 30000,
      },
    }));

    const response = await admin.messaging().sendEach(androidMessages);
    await cleanupInvalidTokens(androidTokens, response);
  }
}

// ─── Helpers ─────────────────────────────────────────────

function formatPreview(content: string, messageType: string): string {
  switch (messageType) {
    case 'IMAGE':
      return '\u{1F4F7} Photo';
    case 'VIDEO':
      return '\u{1F3AC} Video';
    case 'VOICE':
      return '\u{1F3A4} Voice message';
    case 'DOCUMENT':
      return '\u{1F4CE} Document';
    default:
      return content.length > 100 ? content.slice(0, 100) + '...' : content;
  }
}

async function cleanupInvalidTokens(
  tokens: Array<{ id: string; token: string }>,
  response: admin.messaging.BatchResponse,
): Promise<void> {
  const invalidIds: string[] = [];

  response.responses.forEach((res, i) => {
    if (
      res.error &&
      (res.error.code === 'messaging/invalid-registration-token' ||
        res.error.code === 'messaging/registration-token-not-registered')
    ) {
      invalidIds.push(tokens[i]!.id);
    }
  });

  if (invalidIds.length > 0) {
    await prisma.pushToken.deleteMany({
      where: { id: { in: invalidIds } },
    });
  }
}
