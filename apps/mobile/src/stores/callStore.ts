import { create } from 'zustand';

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
type CallType = 'voice' | 'video';

interface CallState {
  activeCallId: string | null;
  status: CallStatus;
  callType: CallType;
  isMuted: boolean;
  isSpeaker: boolean;
  connectedAt: number | null;

  remoteUserId: string | null;
  remoteName: string | null;
  remoteAvatarUrl: string | null;

  initCall: (params: {
    callId: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    type: CallType;
  }) => void;
  setRinging: () => void;
  setConnecting: () => void;
  setConnected: () => void;
  setEnded: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeCallId: null,
  status: 'idle',
  callType: 'voice',
  isMuted: false,
  isSpeaker: false,
  connectedAt: null,
  remoteUserId: null,
  remoteName: null,
  remoteAvatarUrl: null,

  initCall: ({ callId, userId, name, avatarUrl, type }) =>
    set({
      activeCallId: callId,
      status: 'ringing',
      callType: type,
      isMuted: false,
      isSpeaker: false,
      connectedAt: null,
      remoteUserId: userId,
      remoteName: name,
      remoteAvatarUrl: avatarUrl ?? null,
    }),

  setRinging: () => set({ status: 'ringing' }),
  setConnecting: () => set({ status: 'connecting' }),
  setConnected: () => set({ status: 'connected', connectedAt: Date.now() }),
  setEnded: () => set({ status: 'ended' }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleSpeaker: () => set((s) => ({ isSpeaker: !s.isSpeaker })),

  reset: () =>
    set({
      activeCallId: null,
      status: 'idle',
      callType: 'voice',
      isMuted: false,
      isSpeaker: false,
      connectedAt: null,
      remoteUserId: null,
      remoteName: null,
      remoteAvatarUrl: null,
    }),
}));
