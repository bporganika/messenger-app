import { Server, Socket } from 'socket.io';

export function typingHandler(io: Server, socket: Socket) {
  const userId = socket.data['userId'] as string;

  socket.on('typing:start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId,
      isTyping: false,
    });
  });
}
