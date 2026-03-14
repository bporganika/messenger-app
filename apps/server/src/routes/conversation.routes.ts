import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { badRequest, notFound, sendError } from '../utils/errors';

export async function conversationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // List conversations
  fastify.get<{ Querystring: { cursor?: string; limit?: string } }>(
    '/',
    async (request, reply) => {
      try {
        const limit = Math.min(Number(request.query.limit) || 20, 50);
        const cursor = request.query.cursor;

        const conversations = await prisma.conversation.findMany({
          where: {
            members: { some: { userId: request.user.userId } },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                    isOnline: true,
                    lastSeen: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                type: true,
                senderId: true,
                createdAt: true,
                deliveredAt: true,
                readAt: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        return reply.send(conversations);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // Find or create private conversation
  fastify.post<{ Body: { userId: string } }>(
    '/',
    async (request, reply) => {
      try {
        const { userId: otherUserId } = request.body;
        if (!otherUserId) throw badRequest('userId is required');
        if (otherUserId === request.user.userId) throw badRequest('Cannot chat with yourself');

        // Check if conversation already exists between these two users
        const existing = await prisma.conversation.findFirst({
          where: {
            AND: [
              { members: { some: { userId: request.user.userId } } },
              { members: { some: { userId: otherUserId } } },
            ],
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                    isOnline: true,
                  },
                },
              },
            },
          },
        });

        if (existing) return reply.send(existing);

        const conversation = await prisma.conversation.create({
          data: {
            members: {
              create: [
                { userId: request.user.userId },
                { userId: otherUserId },
              ],
            },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                    isOnline: true,
                  },
                },
              },
            },
          },
        });

        return reply.status(201).send(conversation);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // Get single conversation
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: request.params.id,
          members: { some: { userId: request.user.userId } },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatarUrl: true,
                  isOnline: true,
                  lastSeen: true,
                },
              },
            },
          },
        },
      });

      if (!conversation) throw notFound('Conversation not found');
      return reply.send(conversation);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Update conversation settings (mute/archive)
  fastify.patch<{ Params: { id: string }; Body: { isMuted?: boolean; isArchived?: boolean } }>(
    '/:id',
    async (request, reply) => {
      try {
        const member = await prisma.conversationMember.findFirst({
          where: {
            conversationId: request.params.id,
            userId: request.user.userId,
          },
        });

        if (!member) throw notFound('Conversation not found');

        const updated = await prisma.conversationMember.update({
          where: { id: member.id },
          data: request.body,
        });

        return reply.send(updated);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
