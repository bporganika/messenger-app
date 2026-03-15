import { z } from 'zod';
import { messageSchema } from './message.schema';

export const conversationSchema = z.object({
  id: z.string(),
  members: z.array(z.object({
    userId: z.string(),
    lastReadAt: z.string().datetime().optional(),
    isMuted: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  })),
  lastMessage: messageSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createConversationSchema = z.object({
  userId: z.string().min(1),
});

export const updateConversationSchema = z.object({
  isMuted: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const conversationsListSchema = z.object({
  conversations: z.array(conversationSchema),
  nextCursor: z.string().nullable().optional(),
});

export type ConversationResponse = z.infer<typeof conversationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
