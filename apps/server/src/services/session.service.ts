import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '../utils/prisma';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { config } from '../config';

// Socket.IO instance reference — set by index.ts after server boots
let io: SocketIOServer | null = null;

export function setSocketIO(server: SocketIOServer) {
  io = server;
}

/**
 * Revoke all existing sessions for a user.
 * Emits 'session:revoked' to any connected socket before deleting DB rows.
 */
async function revokeExistingSessions(userId: string): Promise<void> {
  // Notify connected sockets
  if (io) {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      if (socket.data['userId'] === userId) {
        socket.emit('session:revoked', { reason: 'new_login' });
        socket.disconnect(true);
      }
    }
  }

  // Delete all DB sessions
  await prisma.session.deleteMany({ where: { userId } });
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a new session for a user.
 * Enforces single-device: kills all previous sessions first.
 */
export async function createSession(
  fastify: FastifyInstance,
  userId: string,
  meta: { ipAddress?: string; deviceInfo?: string },
): Promise<SessionTokens> {
  // Single-device enforcement
  await revokeExistingSessions(userId);

  const refreshTokenValue = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + config.session.refreshTtlDays * 24 * 60 * 60 * 1000,
  );

  const session = await prisma.session.create({
    data: {
      userId,
      refreshToken: refreshTokenValue,
      expiresAt,
      ipAddress: meta.ipAddress,
      deviceInfo: meta.deviceInfo,
    },
  });

  const accessToken = signAccessToken(fastify, { userId });
  const refreshToken = signRefreshToken(fastify, {
    userId,
    sessionId: session.id,
  });

  // Update last seen
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: true, lastSeen: new Date() },
  }).catch(() => {});

  return { accessToken, refreshToken };
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshSession(
  fastify: FastifyInstance,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const decoded = fastify.jwt.decode<{ userId: string; sessionId: string }>(refreshToken);
  if (!decoded?.sessionId || !decoded?.userId) {
    throw new Error('Invalid refresh token');
  }

  const session = await prisma.session.findUnique({
    where: { id: decoded.sessionId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new Error('Session expired');
  }

  // Rotate refresh token
  const newRefreshTokenValue = crypto.randomUUID();
  const newExpiresAt = new Date(
    Date.now() + config.session.refreshTtlDays * 24 * 60 * 60 * 1000,
  );

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshTokenValue,
      expiresAt: newExpiresAt,
    },
  });

  const newAccessToken = signAccessToken(fastify, { userId: decoded.userId });
  const newRefreshToken = signRefreshToken(fastify, {
    userId: decoded.userId,
    sessionId: session.id,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Destroy all sessions for a user (logout).
 */
export async function destroyAllSessions(userId: string): Promise<void> {
  await revokeExistingSessions(userId);
}
