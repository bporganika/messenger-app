import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { messageHandler } from './handlers/message.handler';
import { typingHandler } from './handlers/typing.handler';
import { presenceHandler } from './handlers/presence.handler';
import { callSignalingHandler } from './handlers/call-signaling.handler';

// userId → socketId mapping
const onlineUsers = new Map<string, string>();

export function getOnlineUsers() {
  return onlineUsers;
}

export function setupWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Auth middleware — verify JWT from handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      if (!decoded.userId) {
        return next(new Error('Invalid token'));
      }
      socket.data['userId'] = decoded.userId;
      next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data['userId'] as string;

    // Single device: disconnect previous socket for this user
    const existingSocketId = onlineUsers.get(userId);
    if (existingSocketId) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.emit('session:revoked', { reason: 'new_login' });
        existingSocket.disconnect(true);
      }
    }

    onlineUsers.set(userId, socket.id);

    // Mark user online
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    }).catch(() => {});

    // Join user's conversation rooms
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    for (const m of memberships) {
      socket.join(`conversation:${m.conversationId}`);
    }

    // Broadcast online status
    socket.broadcast.emit('user:status', {
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    });

    // Register handlers
    messageHandler(io, socket);
    typingHandler(io, socket);
    presenceHandler(io, socket);
    callSignalingHandler(io, socket);

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);

      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      }).catch(() => {});

      socket.broadcast.emit('user:status', {
        userId,
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });
    });
  });

  return io;
}
