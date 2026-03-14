import { Server, Socket } from 'socket.io';
import { prisma } from '../../utils/prisma';

export function presenceHandler(io: Server, socket: Socket) {
  const userId = socket.data['userId'] as string;

  socket.on('user:online', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    }).catch(() => {});

    socket.broadcast.emit('user:status', {
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    });
  });

  socket.on('user:offline', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen: new Date() },
    }).catch(() => {});

    socket.broadcast.emit('user:status', {
      userId,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    });
  });
}
