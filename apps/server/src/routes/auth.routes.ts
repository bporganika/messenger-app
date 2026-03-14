import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import { badRequest, unauthorized, sendError } from '../utils/errors';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { verifyGoogleToken } from '../services/google.service';
import { verifyAppleToken } from '../services/apple.service';
import {
  createSession,
  refreshSession,
  destroyAllSessions,
} from '../services/session.service';

export async function authRoutes(fastify: FastifyInstance) {
  // ─── POST /otp/send ───────────────────────────────────
  // Sends a 6-digit OTP via Twilio SMS (phone) or logs it (email/dev)
  fastify.post<{
    Body: { phone?: string; email?: string };
  }>('/otp/send', async (request, reply) => {
    try {
      const { phone, email } = request.body;
      const target = phone || email;

      if (!target) {
        throw badRequest('Phone or email is required');
      }

      // Phone must be E.164 format
      if (phone && !/^\+[1-9]\d{6,14}$/.test(phone)) {
        throw badRequest('Phone must be in E.164 format (e.g. +905551234567)');
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw badRequest('Invalid email address');
      }

      const result = await sendOtp(target);

      // In dev mode (no Twilio configured), return code for testing
      return reply.send({
        success: result.success,
        ...(result.code ? { code: result.code } : {}),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // ─── POST /otp/verify ─────────────────────────────────
  // Verifies OTP → returns tokens for existing users, isNewUser flag for new ones
  fastify.post<{
    Body: { target: string; code: string; deviceInfo?: string };
  }>('/otp/verify', async (request, reply) => {
    try {
      const { target, code, deviceInfo } = request.body;

      if (!target || !code) {
        throw badRequest('Target and code are required');
      }

      const { valid } = await verifyOtp(target, code);
      if (!valid) {
        throw unauthorized('Invalid or expired code');
      }

      // Look up existing user
      const isPhone = target.startsWith('+');
      const user = await prisma.user.findFirst({
        where: isPhone
          ? { phone: target, deletedAt: null }
          : { email: target, deletedAt: null },
      });

      if (!user) {
        // Issue a short-lived temp token so client can call PATCH /users/me
        // to complete profile setup (use raw jsonwebtoken to avoid payload type restriction)
        const tempToken = jwt.sign(
          { target, isNewUser: true },
          config.jwt.secret,
          { expiresIn: '30m' },
        );
        return reply.send({ isNewUser: true, target, tempToken });
      }

      // Single-device enforcement happens inside createSession
      const tokens = await createSession(fastify, user.id, {
        ipAddress: request.ip,
        deviceInfo,
      });

      return reply.send({
        isNewUser: false,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // ─── POST /google ─────────────────────────────────────
  // Verify Google ID token → find or create user → issue session
  fastify.post<{
    Body: { idToken: string; deviceInfo?: string };
  }>('/google', async (request, reply) => {
    try {
      const { idToken, deviceInfo } = request.body;
      if (!idToken) throw badRequest('idToken is required');

      const googleUser = await verifyGoogleToken(idToken);

      // Find existing user by googleId or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: googleUser.googleId },
            { email: googleUser.email },
          ],
          deletedAt: null,
        },
      });

      const isNewUser = !user;

      if (!user) {
        // Auto-create user from Google profile
        const baseUsername = (
          googleUser.firstName.toLowerCase() +
          googleUser.lastName.toLowerCase()
        ).replace(/[^a-z0-9]/g, '');

        // Ensure unique username
        let username = baseUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        user = await prisma.user.create({
          data: {
            googleId: googleUser.googleId,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            username,
            gender: 'PREFER_NOT_TO_SAY',
            avatarUrl: googleUser.avatarUrl,
          },
        });
      } else if (!user.googleId) {
        // Link Google account to existing email user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            avatarUrl: user.avatarUrl || googleUser.avatarUrl,
          },
        });
      }

      const tokens = await createSession(fastify, user.id, {
        ipAddress: request.ip,
        deviceInfo,
      });

      return reply.send({
        isNewUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // ─── POST /apple ──────────────────────────────────────
  // Verify Apple identity token → find or create user → issue session
  fastify.post<{
    Body: {
      identityToken: string;
      fullName?: { firstName?: string; lastName?: string };
      deviceInfo?: string;
    };
  }>('/apple', async (request, reply) => {
    try {
      const { identityToken, fullName, deviceInfo } = request.body;
      if (!identityToken) throw badRequest('identityToken is required');

      const appleUser = await verifyAppleToken(identityToken, fullName);

      // Find existing user by appleId or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { appleId: appleUser.appleId },
            ...(appleUser.email ? [{ email: appleUser.email }] : []),
          ],
          deletedAt: null,
        },
      });

      const isNewUser = !user;

      if (!user) {
        // Apple only sends fullName on first auth, so we must capture it
        const firstName = appleUser.firstName || 'User';
        const lastName = appleUser.lastName || '';

        const baseUsername = (
          firstName.toLowerCase() + lastName.toLowerCase()
        ).replace(/[^a-z0-9]/g, '') || 'user';

        let username = baseUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        user = await prisma.user.create({
          data: {
            appleId: appleUser.appleId,
            email: appleUser.email,
            firstName,
            lastName,
            username,
            gender: 'PREFER_NOT_TO_SAY',
          },
        });
      } else if (!user.appleId) {
        // Link Apple account to existing email user
        await prisma.user.update({
          where: { id: user.id },
          data: { appleId: appleUser.appleId },
        });
      }

      const tokens = await createSession(fastify, user.id, {
        ipAddress: request.ip,
        deviceInfo,
      });

      return reply.send({
        isNewUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // ─── POST /refresh ────────────────────────────────────
  // Rotate access + refresh tokens
  fastify.post<{
    Body: { refreshToken: string };
  }>('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body;
      if (!refreshToken) throw badRequest('refreshToken is required');

      const tokens = await refreshSession(fastify, refreshToken);

      return reply.send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('expired')) {
        return sendError(reply, unauthorized('Session expired'));
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return sendError(reply, unauthorized('Invalid session'));
      }
      return sendError(reply, error);
    }
  });

  // ─── POST /logout ─────────────────────────────────────
  // Kill all sessions + disconnect socket
  fastify.post(
    '/logout',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        await destroyAllSessions(request.user.userId);

        return reply.send({ success: true });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
