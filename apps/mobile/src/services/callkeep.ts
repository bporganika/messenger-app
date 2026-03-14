import RNCallKeep from 'react-native-callkeep';
import { Platform } from 'react-native';

// ─── Setup ───────────────────────────────────────────────

const CALLKEEP_OPTIONS = {
  ios: {
    appName: 'Pulse',
    supportsVideo: true,
    maximumCallGroups: 1,
    maximumCallsPerCallGroup: 1,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'Pulse needs access to make and manage calls',
    cancelButton: 'Cancel',
    okButton: 'OK',
    selfManaged: true,
    additionalPermissions: [] as string[],
    foregroundService: {
      channelId: 'pulse_calls',
      channelName: 'Pulse Calls',
      notificationTitle: 'Call in progress',
    },
  },
};

let initialized = false;

export async function setup(): Promise<void> {
  if (initialized) return;
  try {
    await RNCallKeep.setup(CALLKEEP_OPTIONS);
    if (Platform.OS === 'android') {
      RNCallKeep.setAvailable(true);
    }
    initialized = true;
  } catch (e) {
    console.warn('[CallKeep] setup failed:', e);
  }
}

// ─── Call lifecycle ──────────────────────────────────────

export function displayIncomingCall(
  callId: string,
  callerName: string,
  hasVideo = false,
): void {
  RNCallKeep.displayIncomingCall(
    callId,
    callerName,
    callerName,
    'generic',
    hasVideo,
  );
}

export function startOutgoingCall(
  callId: string,
  contactName: string,
  hasVideo = false,
): void {
  RNCallKeep.startCall(
    callId,
    contactName,
    contactName,
    'generic',
    hasVideo,
  );
}

export function reportConnecting(callId: string): void {
  RNCallKeep.reportConnectingOutgoingCallWithUUID(callId);
}

export function reportConnected(callId: string): void {
  RNCallKeep.reportConnectedOutgoingCallWithUUID(callId);
}

export function endCall(callId: string): void {
  RNCallKeep.endCall(callId);
}

export function endAllCalls(): void {
  RNCallKeep.endAllCalls();
}

export function setMuted(callId: string, muted: boolean): void {
  RNCallKeep.setMutedCall(callId, muted);
}

// ─── Event listeners ─────────────────────────────────────

type Unsubscribe = () => void;

export function onAnswerCall(
  handler: (callId: string) => void,
): Unsubscribe {
  const cb = (data: { callUUID: string }) => handler(data.callUUID);
  RNCallKeep.addEventListener('answerCall', cb);
  return () => RNCallKeep.removeEventListener('answerCall');
}

export function onEndCall(
  handler: (callId: string) => void,
): Unsubscribe {
  const cb = (data: { callUUID: string }) => handler(data.callUUID);
  RNCallKeep.addEventListener('endCall', cb);
  return () => RNCallKeep.removeEventListener('endCall');
}

export function onMuteToggle(
  handler: (callId: string, muted: boolean) => void,
): Unsubscribe {
  const cb = (data: { callUUID: string; muted: boolean }) =>
    handler(data.callUUID, data.muted);
  RNCallKeep.addEventListener('didPerformSetMutedCallAction', cb);
  return () => RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
}

export function onAudioSessionActivated(
  handler: () => void,
): Unsubscribe {
  RNCallKeep.addEventListener('didActivateAudioSession', handler);
  return () => RNCallKeep.removeEventListener('didActivateAudioSession');
}
