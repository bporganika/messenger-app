import { z } from 'zod';

export const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

export const visibilityEnum = z.enum(['everyone', 'contacts', 'nobody']);

export const userSchema = z.object({
  id: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  gender: genderEnum,
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  isOnline: z.boolean().optional(),
  lastSeen: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const profileSetupSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  gender: genderEnum,
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(150).optional(),
  gender: genderEnum.optional(),
  language: z.string().optional(),
});

export const privacySettingsSchema = z.object({
  phoneVisible: visibilityEnum.optional(),
  lastSeenVisible: visibilityEnum.optional(),
  avatarVisible: visibilityEnum.optional(),
});

export const checkUsernameSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100),
});

export type UserProfile = z.infer<typeof userSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
