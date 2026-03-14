import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { badRequest, sendError } from '../utils/errors';

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post<{
    Body: { userId: string; reason: string; description?: string };
  }>('/', async (request, reply) => {
    try {
      const { userId: reportedUserId, reason, description } = request.body;
      if (!reportedUserId || !reason) throw badRequest('userId and reason are required');

      const report = await prisma.report.create({
        data: {
          reporterId: request.user.userId,
          reportedUserId,
          reason: reason as 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'FAKE_ACCOUNT' | 'OTHER',
          description,
        },
      });

      return reply.status(201).send(report);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
