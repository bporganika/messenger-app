import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { badRequest, sendError } from '../utils/errors';

export async function blockRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Block user
  fastify.post<{ Body: { userId: string } }>(
    '/',
    async (request, reply) => {
      try {
        const { userId: blockedUserId } = request.body;
        if (!blockedUserId) throw badRequest('userId is required');
        if (blockedUserId === request.user.userId) throw badRequest('Cannot block yourself');

        const block = await prisma.block.upsert({
          where: {
            blockedById_blockedUserId: {
              blockedById: request.user.userId,
              blockedUserId,
            },
          },
          create: {
            blockedById: request.user.userId,
            blockedUserId,
          },
          update: {},
        });

        return reply.status(201).send(block);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // Unblock user
  fastify.delete<{ Params: { userId: string } }>(
    '/:userId',
    async (request, reply) => {
      try {
        await prisma.block.deleteMany({
          where: {
            blockedById: request.user.userId,
            blockedUserId: request.params.userId,
          },
        });
        return reply.send({ success: true });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // List blocked users
  fastify.get('/', async (request, reply) => {
    try {
      const blocks = await prisma.block.findMany({
        where: { blockedById: request.user.userId },
        include: {
          blockedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      return reply.send(blocks.map((b) => b.blockedUser));
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
