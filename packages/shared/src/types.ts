export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  type: MessageType;
  replyToId?: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'file';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Chat {
  id: string;
  participantIds: [string, string];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'ongoing' | 'ended' | 'missed' | 'declined';
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}
