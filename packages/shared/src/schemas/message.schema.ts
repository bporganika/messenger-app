import { z } from 'zod';

export const messageTypeEnum = z.enum(['text', 'image', 'video', 'voice', 'file', 'system']);

export const messageStatusEnum = z.enum(['sending', 'sent', 'delivered', 'read']);

export const sendMessageSchema = z.object({
  content: z.string().max(5000).optional(),
  type: messageTypeEnum.default('text'),
  replyToId: z.string().optional(),
  attachmentIds: z.array(z.string()).optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string().nullable().optional(),
  type: messageTypeEnum,
  replyToId: z.string().nullable().optional(),
  status: messageStatusEnum.optional(),
  deliveredAt: z.string().datetime().nullable().optional(),
  readAt: z.string().datetime().nullable().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  attachments: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    type: z.enum(['image', 'video', 'audio', 'document']),
    fileName: z.string().nullable().optional(),
    fileSize: z.number(),
    mimeType: z.string(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
    thumbnailUrl: z.string().url().nullable().optional(),
  })).optional(),
});

export const messagesListSchema = z.object({
  messages: z.array(messageSchema),
  nextCursor: z.string().nullable().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageResponse = z.infer<typeof messageSchema>;
export type MessagesListResponse = z.infer<typeof messagesListSchema>;
