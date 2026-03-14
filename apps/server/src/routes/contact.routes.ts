import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth';
import { sendError } from '../utils/errors';

export async function contactRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  // Sync contacts from phone book
  fastify.post<{ Body: { phones: string[] } }>(
    '/sync',
    async (request, reply) => {
      try {
        const { phones } = request.body;
        if (!phones?.length) return reply.send({ matched: [] });

        // Find users matching these phone numbers
        const matchedUsers = await prisma.user.findMany({
          where: {
            phone: { in: phones },
            deletedAt: null,
            id: { not: request.user.userId },
          },
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        });

        // Upsert contacts
        const upserts = phones.map((phone) => {
          const matched = matchedUsers.find((u) => u.phone === phone);
          return prisma.contact.upsert({
            where: {
              ownerId_phone: { ownerId: request.user.userId, phone },
            },
            create: {
              ownerId: request.user.userId,
              phone,
              matchedUserId: matched?.id ?? null,
            },
            update: {
              matchedUserId: matched?.id ?? null,
            },
          });
        });

        await prisma.$transaction(upserts);

        return reply.send({ matched: matchedUsers });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  // List contacts on Pulse
  fastify.get('/', async (request, reply) => {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          ownerId: request.user.userId,
          matchedUserId: { not: null },
        },
        select: {
          id: true,
          phone: true,
          name: true,
          matchedUserId: true,
        },
      });

      // Fetch matched user profiles
      const userIds = contacts
        .map((c) => c.matchedUserId)
        .filter((id): id is string => id !== null);

      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
          isOnline: true,
        },
      });

      return reply.send(users);
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
