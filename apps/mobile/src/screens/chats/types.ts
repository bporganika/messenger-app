import type { MessageType, MessageStatus as MsgStatus } from '@pulse/shared';

export type OnlineStatus = 'online' | 'offline' | 'away';

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  onlineStatus: OnlineStatus;
  lastMessage?: string;
  lastMessageType: MessageType;
  lastMessageStatus?: MsgStatus;
  lastMessageIsSent: boolean;
  timestamp: string;
  unreadCount: number;
  isArchived: boolean;
}

export interface DeleteTarget {
  id: string;
  name: string;
}
