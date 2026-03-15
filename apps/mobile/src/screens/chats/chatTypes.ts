import type { MessageType, MessageStatus } from '@pulse/shared';

export interface ChatMessage {
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

export type ListItem =
  | { type: 'message'; data: ChatMessage }
  | { type: 'date'; label: string }
  | { type: 'typing' };

export function getPreviewForType(
  type?: MessageType,
  t?: (key: string) => string,
): string {
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
