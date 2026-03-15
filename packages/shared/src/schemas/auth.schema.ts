import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.phone || data.email, {
  message: 'Either phone or email is required',
});

export const verifyOtpSchema = z.object({
  target: z.string().min(1),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const appleAuthSchema = z.object({
  identityToken: z.string().min(1),
  fullName: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
  }).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  isNewUser: z.boolean().optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type AppleAuthInput = z.infer<typeof appleAuthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
