import { buildApp } from './app';
import { setupWebSocket } from './websocket';
import { setSocketIO } from './services/session.service';
import { config } from './config';
import { prisma } from './utils/prisma';

async function start() {
  const app = await buildApp();

  await app.listen({ port: config.port, host: config.host });

  // Attach Socket.IO to the underlying HTTP server
  const io = setupWebSocket(app.server);

  // Give session service access to Socket.IO for session:revoked events
  setSocketIO(io);

  app.log.info(`Server running on http://${config.host}:${config.port}`);
  app.log.info('WebSocket server attached');
}

start().catch(async (err) => {
  console.error('Failed to start server:', err);
  await prisma.$disconnect();
  process.exit(1);
});
