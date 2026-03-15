import { Server, Socket } from 'socket.io';
import { prisma } from '../../utils/prisma';
import { sendMessageNotification } from '../../services/push.service';

export function messageHandler(io: Server, socket: Socket) {
  const userId = socket.data['userId'] as string;

  // Send message via socket (real-time)
  socket.on('message:send', async (data: {
    conversationId: string;
    content?: string;
    type?: string;
    replyToId?: string;
    attachmentIds?: string[];
  }) => {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          type: (data.type as 'TEXT') || 'TEXT',
          replyToId: data.replyToId,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, avatarUrl: true },
          },
          attachments: true,
        },
      });

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      io.to(`conversation:${data.conversationId}`).emit('message:new', message);

      // Send push notification to offline conversation members
      const members = await prisma.conversationMember.findMany({
        where: { conversationId: data.conversationId, userId: { not: userId } },
        select: { userId: true },
      });

      for (const member of members) {
        sendMessageNotification(member.userId, {
          type: 'message',
          conversationId: data.conversationId,
          senderName: message.sender.firstName,
          senderAvatar: message.sender.avatarUrl ?? undefined,
          content: data.content ?? '',
          messageType: message.type,
        }).catch(() => {});
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark message as delivered
  socket.on('message:delivered', async (data: { messageId: string }) => {
    try {
      const message = await prisma.message.update({
        where: { id: data.messageId },
        data: { deliveredAt: new Date() },
      });

      io.to(`conversation:${message.conversationId}`).emit('message:delivered', {
        messageId: message.id,
        deliveredAt: message.deliveredAt?.toISOString(),
      });
    } catch {
      // ignore
    }
  });

  // Mark messages as read
  socket.on('message:read', async (data: { conversationId: string; messageId: string }) => {
    try {
      const now = new Date();

      await prisma.message.update({
        where: { id: data.messageId },
        data: { readAt: now },
      });

      await prisma.conversationMember.updateMany({
        where: { conversationId: data.conversationId, userId },
        data: { lastReadAt: now },
      });

      io.to(`conversation:${data.conversationId}`).emit('message:read', {
        messageId: data.messageId,
        readAt: now.toISOString(),
      });
    } catch {
      // ignore
    }
  });

  // Delete message
  socket.on('message:delete', async (data: { messageId: string }) => {
    try {
      const message = await prisma.message.findUnique({
        where: { id: data.messageId },
      });

      if (!message || message.senderId !== userId) return;

      await prisma.message.update({
        where: { id: data.messageId },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      io.to(`conversation:${message.conversationId}`).emit('message:deleted', {
        messageId: data.messageId,
      });
    } catch {
      // ignore
    }
  });
}
