import { z } from 'zod';

export const callTypeEnum = z.enum(['voice', 'video']);

export const callStatusEnum = z.enum(['ringing', 'ongoing', 'ended', 'missed', 'rejected', 'busy']);

export const callSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  callerId: z.string(),
  calleeId: z.string(),
  type: callTypeEnum,
  status: callStatusEnum,
  startedAt: z.string().datetime().nullable().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  duration: z.number().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const callHistorySchema = z.object({
  calls: z.array(callSchema),
  nextCursor: z.string().nullable().optional(),
});

export type CallResponse = z.infer<typeof callSchema>;
export type CallHistoryResponse = z.infer<typeof callHistorySchema>;
