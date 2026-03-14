import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { sendError } from '../utils/errors';

export async function callRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Call history
  fastify.get<{ Querystring: { cursor?: string; limit?: string } }>(
    '/history',
    async (request, reply) => {
      try {
        const limit = Math.min(Number(request.query.limit) || 20, 50);
        const cursor = request.query.cursor;
        const userId = request.user.userId;

        const calls = await prisma.call.findMany({
          where: {
            OR: [{ callerId: userId }, { calleeId: userId }],
          },
          include: {
            caller: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
            callee: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        return reply.send(calls);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
