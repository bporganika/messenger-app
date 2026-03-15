import { Server, Socket } from 'socket.io';
import { prisma } from '../../utils/prisma';
import { getOnlineUsers } from '../index';
import { sendCallNotification } from '../../services/push.service';

// ─── Types ───────────────────────────────────────────────────
interface ActiveCall {
  callId: string;
  callerId: string;
  calleeId: string;
  type: 'VOICE' | 'VIDEO';
  status: 'RINGING' | 'ONGOING';
}

type CallType = 'VOICE' | 'VIDEO';

// ─── In-memory call state (single-instance v1) ──────────────
// For horizontal scaling, replace with Redis pub/sub + hashes.
const activeCalls = new Map<string, ActiveCall>();
const userCallMap = new Map<string, string>(); // userId → callId
const ringingTimers = new Map<string, NodeJS.Timeout>();

const RINGING_TIMEOUT_MS = 30_000;

// ─── Helpers ─────────────────────────────────────────────────

function trackCall(call: ActiveCall): void {
  activeCalls.set(call.callId, call);
  userCallMap.set(call.callerId, call.callId);
  userCallMap.set(call.calleeId, call.callId);
}

function untrackCall(callId: string): void {
  const call = activeCalls.get(callId);
  if (!call) return;
  activeCalls.delete(callId);
  if (userCallMap.get(call.callerId) === callId) userCallMap.delete(call.callerId);
  if (userCallMap.get(call.calleeId) === callId) userCallMap.delete(call.calleeId);
  const timer = ringingTimers.get(callId);
  if (timer) {
    clearTimeout(timer);
    ringingTimers.delete(callId);
  }
}

function otherParty(call: ActiveCall, uid: string): string {
  return call.callerId === uid ? call.calleeId : call.callerId;
}

function isParticipant(call: ActiveCall, uid: string): boolean {
  return call.callerId === uid || call.calleeId === uid;
}

function emitToUser(
  io: Server,
  targetUserId: string,
  event: string,
  payload: Record<string, unknown>,
): void {
  const sid = getOnlineUsers().get(targetUserId);
  if (sid) io.to(sid).emit(event, payload);
}

// ─── Handler ─────────────────────────────────────────────────

export function callSignalingHandler(io: Server, socket: Socket) {
  const userId = socket.data['userId'] as string;

  // ── call:initiate ──────────────────────────────────────────
  socket.on(
    'call:initiate',
    async (
      data: { conversationId: string; calleeId: string; type: CallType },
      ack?: (res: { callId: string } | { error: string }) => void,
    ) => {
      try {
        // Validate
        if (!data.conversationId || !data.calleeId) {
          return ack?.({ error: 'Missing required fields' });
        }
        if (data.type !== 'VOICE' && data.type !== 'VIDEO') {
          return ack?.({ error: 'Invalid call type' });
        }
        if (data.calleeId === userId) {
          return ack?.({ error: 'Cannot call yourself' });
        }
        if (userCallMap.has(userId)) {
          return ack?.({ error: 'Already in a call' });
        }

        // Both users must be conversation members
        const memberCount = await prisma.conversationMember.count({
          where: {
            conversationId: data.conversationId,
            userId: { in: [userId, data.calleeId] },
          },
        });
        if (memberCount < 2) {
          return ack?.({ error: 'Invalid conversation' });
        }

        // Block check — callee blocked caller?
        const blocked = await prisma.block.findUnique({
          where: {
            blockedById_blockedUserId: {
              blockedById: data.calleeId,
              blockedUserId: userId,
            },
          },
        });
        if (blocked) {
          return ack?.({ error: 'Cannot reach this user' });
        }

        // Callee already in a call → instant BUSY
        if (userCallMap.has(data.calleeId)) {
          const call = await prisma.call.create({
            data: {
              conversationId: data.conversationId,
              callerId: userId,
              calleeId: data.calleeId,
              type: data.type,
              status: 'BUSY',
            },
          });
          socket.emit('call:busy', { callId: call.id });
          return ack?.({ callId: call.id });
        }

        // Create DB record
        const call = await prisma.call.create({
          data: {
            conversationId: data.conversationId,
            callerId: userId,
            calleeId: data.calleeId,
            type: data.type,
            status: 'RINGING',
          },
        });

        // Track in memory
        trackCall({
          callId: call.id,
          callerId: userId,
          calleeId: data.calleeId,
          type: data.type,
          status: 'RINGING',
        });

        // Ringing timeout → auto MISSED after 30 s
        ringingTimers.set(
          call.id,
          setTimeout(async () => {
            const tracked = activeCalls.get(call.id);
            if (!tracked || tracked.status !== 'RINGING') return;

            await prisma.call
              .update({ where: { id: call.id }, data: { status: 'MISSED' } })
              .catch(() => {});

            untrackCall(call.id);
            emitToUser(io, userId, 'call:ended', { callId: call.id, duration: 0 });
            emitToUser(io, data.calleeId, 'call:ended', {
              callId: call.id,
              duration: 0,
            });
          }, RINGING_TIMEOUT_MS),
        );

        // Notify callee
        const caller = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        });

        if (getOnlineUsers().has(data.calleeId)) {
          emitToUser(io, data.calleeId, 'call:incoming', {
            callId: call.id,
            callerId: userId,
            type: data.type,
            caller: caller as Record<string, unknown>,
          });
        } else {
          // Callee offline → VoIP push (iOS) / high-priority FCM (Android)
          sendCallNotification(data.calleeId, {
            type: 'call',
            callId: call.id,
            callerId: userId,
            callerName: caller
              ? `${caller.firstName} ${caller.lastName}`
              : 'Unknown',
            callerAvatar: (caller?.avatarUrl as string) ?? undefined,
            callType: data.type === 'VIDEO' ? 'video' : 'voice',
          }).catch(() => {});
        }

        ack?.({ callId: call.id });
      } catch {
        socket.emit('error', { message: 'Failed to initiate call' });
        ack?.({ error: 'Failed to initiate call' });
      }
    },
  );

  // ── call:accept ────────────────────────────────────────────
  socket.on('call:accept', async (data: { callId: string }) => {
    try {
      const tracked = activeCalls.get(data.callId);
      if (!tracked || tracked.calleeId !== userId || tracked.status !== 'RINGING') return;

      // Clear ringing timer
      const timer = ringingTimers.get(data.callId);
      if (timer) {
        clearTimeout(timer);
        ringingTimers.delete(data.callId);
      }

      tracked.status = 'ONGOING';

      await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'ONGOING', startedAt: new Date() },
      });

      emitToUser(io, tracked.callerId, 'call:accepted', { callId: data.callId });
    } catch {
      socket.emit('error', { message: 'Failed to accept call' });
    }
  });

  // ── call:reject ────────────────────────────────────────────
  socket.on('call:reject', async (data: { callId: string }) => {
    try {
      const tracked = activeCalls.get(data.callId);
      if (!tracked || tracked.calleeId !== userId || tracked.status !== 'RINGING') return;

      await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'REJECTED' },
      });

      const callerId = tracked.callerId;
      untrackCall(data.callId);
      emitToUser(io, callerId, 'call:rejected', { callId: data.callId });
    } catch {
      // silent
    }
  });

  // ── call:end ───────────────────────────────────────────────
  socket.on('call:end', async (data: { callId: string }) => {
    try {
      const tracked = activeCalls.get(data.callId);
      if (!tracked || !isParticipant(tracked, userId)) return;

      const dbCall = await prisma.call.findUnique({ where: { id: data.callId } });
      if (!dbCall) return;

      const duration = dbCall.startedAt
        ? Math.round((Date.now() - dbCall.startedAt.getTime()) / 1000)
        : 0;

      await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'ENDED', endedAt: new Date(), duration },
      });

      const other = otherParty(tracked, userId);
      untrackCall(data.callId);
      emitToUser(io, other, 'call:ended', { callId: data.callId, duration });
    } catch {
      // silent
    }
  });

  // ── call:busy ──────────────────────────────────────────────
  socket.on('call:busy', async (data: { callId: string }) => {
    try {
      const tracked = activeCalls.get(data.callId);
      if (!tracked || tracked.calleeId !== userId || tracked.status !== 'RINGING') return;

      await prisma.call.update({
        where: { id: data.callId },
        data: { status: 'BUSY' },
      });

      const callerId = tracked.callerId;
      untrackCall(data.callId);
      emitToUser(io, callerId, 'call:busy', { callId: data.callId });
    } catch {
      // silent
    }
  });

  // ── WebRTC signaling (from in-memory cache, no DB queries) ─

  socket.on('call:offer', (data: { callId: string; sdp: unknown }) => {
    const tracked = activeCalls.get(data.callId);
    if (!tracked || !isParticipant(tracked, userId)) return;
    emitToUser(io, otherParty(tracked, userId), 'call:offer', {
      callId: data.callId,
      sdp: data.sdp,
    } as Record<string, unknown>);
  });

  socket.on('call:answer', (data: { callId: string; sdp: unknown }) => {
    const tracked = activeCalls.get(data.callId);
    if (!tracked || !isParticipant(tracked, userId)) return;
    emitToUser(io, otherParty(tracked, userId), 'call:answer', {
      callId: data.callId,
      sdp: data.sdp,
    } as Record<string, unknown>);
  });

  socket.on(
    'call:ice-candidate',
    (data: { callId: string; candidate: unknown }) => {
      const tracked = activeCalls.get(data.callId);
      if (!tracked || !isParticipant(tracked, userId)) return;
      emitToUser(io, otherParty(tracked, userId), 'call:ice-candidate', {
        callId: data.callId,
        candidate: data.candidate,
      } as Record<string, unknown>);
    },
  );

  // ── Disconnect cleanup ─────────────────────────────────────
  socket.on('disconnect', async () => {
    const callId = userCallMap.get(userId);
    if (!callId) return;
    const call = activeCalls.get(callId);
    if (!call) return;

    const other = otherParty(call, userId);

    if (call.status === 'RINGING') {
      // Disconnect while ringing → MISSED
      await prisma.call
        .update({ where: { id: callId }, data: { status: 'MISSED' } })
        .catch(() => {});
      untrackCall(callId);
      emitToUser(io, other, 'call:ended', { callId, duration: 0 });
    } else if (call.status === 'ONGOING') {
      // Disconnect during active call → END with duration
      const dbCall = await prisma.call
        .findUnique({ where: { id: callId } })
        .catch(() => null);
      const duration = dbCall?.startedAt
        ? Math.round((Date.now() - dbCall.startedAt.getTime()) / 1000)
        : 0;
      await prisma.call
        .update({
          where: { id: callId },
          data: { status: 'ENDED', endedAt: new Date(), duration },
        })
        .catch(() => {});
      untrackCall(callId);
      emitToUser(io, other, 'call:ended', { callId, duration });
    }
  });
}
