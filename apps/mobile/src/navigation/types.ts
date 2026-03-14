import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ─── Auth ────────────────────────────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  PhoneAuth: undefined;
  EmailAuth: undefined;
  OTP: { target: string };
  ProfileSetup: { target: string; tempToken: string };
};

// ─── Chats ───────────────────────────────────────────────
export type ChatStackParamList = {
  ChatList: undefined;
  Chat: { conversationId: string; name: string; avatarUrl?: string };
  MediaViewer: { uri: string; type: 'image' | 'video' };
};

// ─── Calls ───────────────────────────────────────────────
export type CallStackParamList = {
  CallHistory: undefined;
};

// ─── Contacts ────────────────────────────────────────────
export type ContactStackParamList = {
  Contacts: undefined;
  UserProfile: { userId: string; name: string; avatarUrl?: string };
  Invite: undefined;
};

// ─── Settings ────────────────────────────────────────────
export type SettingsStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Privacy: undefined;
  Language: undefined;
  Appearance: undefined;
  Storage: undefined;
  AppLock: undefined;
  DeleteAccount: undefined;
};

// ─── Tabs ────────────────────────────────────────────────
export type MainTabParamList = {
  ChatsTab: NavigatorScreenParams<ChatStackParamList>;
  CallsTab: NavigatorScreenParams<CallStackParamList>;
  ContactsTab: NavigatorScreenParams<ContactStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// ─── Root ────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  VoiceCall: {
    callId: string;
    userId: string;
    name: string;
    avatarUrl?: string;
  };
  VideoCall: {
    callId: string;
    userId: string;
    name: string;
    avatarUrl?: string;
  };
};

// ─── Screen props helpers ────────────────────────────────
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ChatScreenProps<T extends keyof ChatStackParamList> =
  NativeStackScreenProps<ChatStackParamList, T>;

export type ContactScreenProps<T extends keyof ContactStackParamList> =
  NativeStackScreenProps<ContactStackParamList, T>;

export type SettingsScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Global type augmentation for useNavigation()
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
