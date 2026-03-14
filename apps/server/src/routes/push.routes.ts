import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { badRequest, sendError } from '../utils/errors';

export async function pushRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Register push token
  fastify.post<{
    Body: { token: string; platform: 'IOS' | 'ANDROID'; isVoIP?: boolean };
  }>('/register', async (request, reply) => {
    try {
      const { token, platform, isVoIP = false } = request.body;
      if (!token || !platform) throw badRequest('token and platform are required');

      const pushToken = await prisma.pushToken.upsert({
        where: { token },
        create: {
          userId: request.user.userId,
          token,
          platform,
          isVoIP,
        },
        update: {
          userId: request.user.userId,
          platform,
          isVoIP,
        },
      });

      return reply.status(201).send(pushToken);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Unregister push token
  fastify.delete<{ Body: { token: string } }>(
    '/unregister',
    async (request, reply) => {
      try {
        const { token } = request.body;
        if (!token) throw badRequest('token is required');

        await prisma.pushToken.deleteMany({
          where: { token, userId: request.user.userId },
        });

        return reply.send({ success: true });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
