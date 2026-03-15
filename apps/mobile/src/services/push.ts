import { Platform } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import * as CallKeepService from './callkeep';
import { navigate } from './navigationRef';
import { api } from './api';

// ─── Notification payload types ──────────────────────────

interface MessagePayload {
  type: 'message';
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: string;
}

interface CallPayload {
  type: 'call';
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
}

type NotificationPayload = MessagePayload | CallPayload;

// ─── Setup ───────────────────────────────────────────────

let initialized = false;

export async function setup(): Promise<void> {
  if (initialized) return;

  const status = await messaging().requestPermission();
  const authorized =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;

  if (!authorized) {
    console.warn('[Push] notification permission denied');
    return;
  }

  await registerFCMToken();
  setupForegroundHandler();
  setupNotificationOpenHandlers();

  if (Platform.OS === 'ios') {
    setupVoIPPush();
  }

  initialized = true;
}

// ─── FCM Token ───────────────────────────────────────────

async function registerFCMToken(): Promise<void> {
  try {
    const token = await messaging().getToken();
    await sendTokenToServer(token, false);
  } catch (e) {
    console.warn('[Push] failed to get FCM token:', e);
  }

  messaging().onTokenRefresh(async (newToken) => {
    await sendTokenToServer(newToken, false);
  });
}

async function sendTokenToServer(
  token: string,
  isVoIP: boolean,
): Promise<void> {
  const platform = Platform.OS as 'ios' | 'android';
  await api.post('/push/register', { token, platform, isVoIP });
}

// ─── Unregister (on logout) ──────────────────────────────

export async function unregister(): Promise<void> {
  try {
    const token = await messaging().getToken();
    await api.delete('/push/unregister', { data: { token } });
    await messaging().deleteToken();
  } catch (e) {
    console.warn('[Push] unregister failed:', e);
  }
}

// ─── VoIP Push (iOS) ─────────────────────────────────────

function setupVoIPPush(): void {
  let VoipPushNotification: typeof import('react-native-voip-push-notification').default;
  try {
    VoipPushNotification = require('react-native-voip-push-notification').default;
  } catch {
    console.warn('[Push] VoIP push module not available');
    return;
  }

  VoipPushNotification.addEventListener('register', async (token) => {
    await sendTokenToServer(token, true);
  });

  VoipPushNotification.addEventListener('notification', (notification) => {
    const data = notification as unknown as CallPayload;
    if (data.type === 'call') {
      CallKeepService.displayIncomingCall(
        data.callId,
        data.callerName,
        data.callType === 'video',
      );
    }
  });

  // Handle events that fired before JS loaded
  VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
    for (const event of events) {
      if (event.name === 'RNVoipPushRemoteNotificationsRegisteredEvent') {
        const token = event.data as string;
        sendTokenToServer(token, true);
      }
      if (event.name === 'RNVoipPushRemoteNotificationReceivedEvent') {
        const data = event.data as unknown as CallPayload;
        if (data.type === 'call') {
          CallKeepService.displayIncomingCall(
            data.callId,
            data.callerName,
            data.callType === 'video',
          );
        }
      }
    }
  });

  VoipPushNotification.registerVoipToken();
}

// ─── Foreground message handler ──────────────────────────

function setupForegroundHandler(): void {
  messaging().onMessage((remoteMessage) => {
    const data = parsePayload(remoteMessage.data);
    if (!data) return;

    if (data.type === 'call') {
      CallKeepService.displayIncomingCall(
        data.callId,
        data.callerName,
        data.callType === 'video',
      );
    }
  });
}

// ─── Notification tap handlers ───────────────────────────

function setupNotificationOpenHandlers(): void {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    handleNotificationNavigation(remoteMessage.data);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage.data);
        }, 800);
      }
    });
}

// ─── Background message handler (called from index.js) ──

export async function handleBackgroundMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const data = parsePayload(remoteMessage.data);
  if (!data) return;

  if (data.type === 'call' && Platform.OS === 'android') {
    await CallKeepService.setup();
    CallKeepService.displayIncomingCall(
      data.callId,
      data.callerName,
      data.callType === 'video',
    );
  }
}

// ─── Deep link navigation ────────────────────────────────

function handleNotificationNavigation(
  data?: Record<string, string>,
): void {
  const payload = parsePayload(data);
  if (!payload) return;

  if (payload.type === 'message') {
    navigate('Main', {
      screen: 'ChatsTab',
      params: {
        screen: 'Chat',
        params: {
          conversationId: payload.conversationId,
          name: payload.senderName,
          avatarUrl: payload.senderAvatar,
        },
      },
    });
  } else if (payload.type === 'call') {
    const screen = payload.callType === 'video' ? 'VideoCall' : 'VoiceCall';
    navigate(screen, {
      callId: payload.callId,
      userId: payload.callerId,
      name: payload.callerName,
      avatarUrl: payload.callerAvatar,
    });
  }
}

// ─── Parse FCM data payload ──────────────────────────────

function parsePayload(
  data?: Record<string, string>,
): NotificationPayload | null {
  if (!data?.type) return null;

  if (data.type === 'message') {
    if (!data.conversationId || !data.senderName) return null;
    return {
      type: 'message',
      conversationId: data.conversationId,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      content: data.content ?? '',
      messageType: data.messageType ?? 'TEXT',
    };
  }

  if (data.type === 'call') {
    if (!data.callId || !data.callerId || !data.callerName) return null;
    return {
      type: 'call',
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar,
      callType: (data.callType as 'voice' | 'video') ?? 'voice',
    };
  }

  return null;
}
