import { FastifyInstance } from 'fastify';
import { Gender, PhoneVisibility, Visibility } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { notFound, sendError } from '../utils/errors';

export async function userRoutes(fastify: FastifyInstance) {
  // All user routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get own profile
  fastify.get('/me', async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          gender: true,
          avatarUrl: true,
          bio: true,
          phoneVisible: true,
          lastSeenVisible: true,
          avatarVisible: true,
          language: true,
          biometricEnabled: true,
          createdAt: true,
        },
      });
      if (!user) throw notFound('User not found');
      return reply.send(user);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Update own profile
  fastify.patch<{
    Body: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      gender?: Gender;
      language?: string;
    };
  }>('/me', async (request, reply) => {
    try {
      const { firstName, lastName, username, bio, gender, language } = request.body;
      const user = await prisma.user.update({
        where: { id: request.user.userId },
        data: { firstName, lastName, username, bio, gender, language },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          bio: true,
          gender: true,
          language: true,
        },
      });
      return reply.send(user);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Update privacy settings
  fastify.patch<{
    Body: {
      phoneVisible?: PhoneVisibility;
      lastSeenVisible?: Visibility;
      avatarVisible?: Visibility;
    };
  }>('/me/privacy', async (request, reply) => {
    try {
      const { phoneVisible, lastSeenVisible, avatarVisible } = request.body;
      const user = await prisma.user.update({
        where: { id: request.user.userId },
        data: { phoneVisible, lastSeenVisible, avatarVisible },
        select: {
          phoneVisible: true,
          lastSeenVisible: true,
          avatarVisible: true,
        },
      });
      return reply.send(user);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Search users by username or phone
  fastify.get<{ Querystring: { q: string } }>(
    '/search',
    async (request, reply) => {
      try {
        const { q } = request.query;
        if (!q || q.length < 2) return reply.send([]);

        const users = await prisma.user.findMany({
          where: {
            AND: [
              { id: { not: request.user.userId } },
              { deletedAt: null },
              {
                OR: [
                  { username: { contains: q, mode: 'insensitive' } },
                  { phone: q },
                ],
              },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
          take: 20,
        });

        return reply.send(users);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // Get user profile by id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
          bio: true,
          isOnline: true,
          lastSeen: true,
        },
      });
      if (!user) throw notFound('User not found');
      return reply.send(user);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  // Soft-delete account
  fastify.delete('/me', async (request, reply) => {
    try {
      await prisma.user.update({
        where: { id: request.user.userId },
        data: { deletedAt: new Date() },
      });
      await prisma.session.deleteMany({ where: { userId: request.user.userId } });
      return reply.send({ success: true });
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
