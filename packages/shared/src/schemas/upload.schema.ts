import { z } from 'zod';
import { MAX_FILE_SIZE_BYTES } from '../constants';

export const uploadResponseSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  type: z.enum(['image', 'video', 'audio', 'document']),
  fileSize: z.number().max(MAX_FILE_SIZE_BYTES),
  mimeType: z.string(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
});

export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const;

export const allowedMimeTypeSchema = z.enum(allowedMimeTypes);

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
