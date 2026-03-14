import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { badRequest, notFound, forbidden, sendError } from '../utils/errors';

export async function messageRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Get messages for conversation (cursor-based pagination)
  fastify.get<{
    Params: { conversationId: string };
    Querystring: { cursor?: string; limit?: string };
  }>('/conversations/:conversationId/messages', async (request, reply) => {
    try {
      const { conversationId } = request.params;
      const limit = Math.min(Number(request.query.limit) || 50, 100);
      const cursor = request.query.cursor;

      // Verify user is member
      const member = await prisma.conversationMember.findFirst({
        where: { conversationId, userId: request.user.userId },
      });
      if (!member) throw notFound('Conversation not found');

      const messages = await prisma.message.findMany({
        where: { conversationId, isDeleted: false },
        include: {
          attachments: true,
          replyTo: {
            select: {
              id: true,
              content: true,
              type: true,
              senderId: true,
              sender: {
                select: { id: true, firstName: true },
              },
            },
          },
          sender: {
            select: { id: true, firstName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      return reply.send(messages);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Send message
  fastify.post<{
    Params: { conversationId: string };
    Body: {
      content?: string;
      type?: string;
      replyToId?: string;
      attachmentIds?: string[];
    };
  }>('/conversations/:conversationId/messages', async (request, reply) => {
    try {
      const { conversationId } = request.params;
      const { content, type = 'TEXT', replyToId, attachmentIds } = request.body;

      // Verify user is member
      const member = await prisma.conversationMember.findFirst({
        where: { conversationId, userId: request.user.userId },
      });
      if (!member) throw notFound('Conversation not found');

      if (!content && (!attachmentIds || attachmentIds.length === 0)) {
        throw badRequest('Message must have content or attachments');
      }

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: request.user.userId,
          content,
          type: type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'DOCUMENT' | 'SYSTEM',
          replyToId,
          ...(attachmentIds?.length
            ? {
                attachments: {
                  connect: attachmentIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
        include: {
          attachments: true,
          sender: {
            select: { id: true, firstName: true, avatarUrl: true },
          },
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return reply.status(201).send(message);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Soft-delete message
  fastify.delete<{ Params: { id: string } }>(
    '/messages/:id',
    async (request, reply) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: request.params.id },
        });

        if (!message) throw notFound('Message not found');
        if (message.senderId !== request.user.userId) throw forbidden('Not your message');

        await prisma.message.update({
          where: { id: message.id },
          data: { isDeleted: true, deletedAt: new Date() },
        });

        return reply.send({ success: true });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
