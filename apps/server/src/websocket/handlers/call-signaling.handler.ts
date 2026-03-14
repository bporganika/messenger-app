import { Server, Socket } from 'socket.io';
import { prisma } from '../../utils/prisma';
import { getOnlineUsers } from '../index';

export function callSignalingHandler(io: Server, socket: Socket) {
  const userId = socket.data['userId'] as string;

  socket.on('call:initiate', async (data: {
    conversationId: string;
    calleeId: string;
    type: 'VOICE' | 'VIDEO';
  }) => {
    try {
      const call = await prisma.call.create({
        data: {
          conversationId: data.conversationId,
          callerId: userId,
          calleeId: data.calleeId,
          type: data.type,
          status: 'RINGING',
        },
      });

      const caller = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      });

      const calleeSocketId = getOnlineUsers().get(data.calleeId);
      if (calleeSocketId) {
        io.to(calleeSocketId).emit('call:incoming', {
          callId: call.id,
          callerId: userId,
          type: data.type,
          caller,
        });
      }
      // TODO: send VoIP push if callee is offline
    } catch {
      socket.emit('error', { message: 'Failed to initiate call' });
    }
  });

  socket.on('call:accept', async (data: { callId: string }) => {
    try {
      const call = await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'ONGOING', startedAt: new Date() },
      });

      const callerSocketId = getOnlineUsers().get(call.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:accepted', { callId: data.callId });
      }
    } catch {
      // ignore
    }
  });

  socket.on('call:reject', async (data: { callId: string }) => {
    try {
      const call = await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'REJECTED' },
      });

      const callerSocketId = getOnlineUsers().get(call.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected', { callId: data.callId });
      }
    } catch {
      // ignore
    }
  });

  socket.on('call:end', async (data: { callId: string }) => {
    try {
      const call = await prisma.call.findUnique({ where: { id: data.callId } });
      if (!call) return;

      const duration = call.startedAt
        ? Math.round((Date.now() - call.startedAt.getTime()) / 1000)
        : 0;

      await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'ENDED', endedAt: new Date(), duration },
      });

      const otherUserId = call.callerId === userId ? call.calleeId : call.callerId;
      const otherSocketId = getOnlineUsers().get(otherUserId);
      if (otherSocketId) {
        io.to(otherSocketId).emit('call:ended', { callId: data.callId, duration });
      }
    } catch {
      // ignore
    }
  });

  socket.on('call:busy', async (data: { callId: string }) => {
    try {
      const call = await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'BUSY' },
      });

      const callerSocketId = getOnlineUsers().get(call.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:busy', { callId: data.callId });
      }
    } catch {
      // ignore
    }
  });

  // WebRTC SDP forwarding
  socket.on('call:offer', async (data: { callId: string; sdp: unknown }) => {
    const call = await prisma.call.findUnique({ where: { id: data.callId } }).catch(() => null);
    if (!call) return;

    const targetId = call.callerId === userId ? call.calleeId : call.callerId;
    const targetSocketId = getOnlineUsers().get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:offer', { callId: data.callId, sdp: data.sdp });
    }
  });

  socket.on('call:answer', async (data: { callId: string; sdp: unknown }) => {
    const call = await prisma.call.findUnique({ where: { id: data.callId } }).catch(() => null);
    if (!call) return;

    const targetId = call.callerId === userId ? call.calleeId : call.callerId;
    const targetSocketId = getOnlineUsers().get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:answer', { callId: data.callId, sdp: data.sdp });
    }
  });

  socket.on('call:ice-candidate', async (data: { callId: string; candidate: unknown }) => {
    const call = await prisma.call.findUnique({ where: { id: data.callId } }).catch(() => null);
    if (!call) return;

    const targetId = call.callerId === userId ? call.calleeId : call.callerId;
    const targetSocketId = getOnlineUsers().get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ice-candidate', {
        callId: data.callId,
        candidate: data.candidate,
      });
    }
  });
}
