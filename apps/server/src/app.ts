import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';

// Routes
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { conversationRoutes } from './routes/conversation.routes';
import { messageRoutes } from './routes/message.routes';
import { contactRoutes } from './routes/contact.routes';
import { blockRoutes } from './routes/block.routes';
import { reportRoutes } from './routes/report.routes';
import { callRoutes } from './routes/call.routes';
import { uploadRoutes } from './routes/upload.routes';
import { pushRoutes } from './routes/push.routes';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Plugins
  await app.register(cors, { origin: config.corsOrigin });
  await app.register(jwt, { secret: config.jwt.secret });
  await app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // API routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(conversationRoutes, { prefix: '/api/v1/conversations' });
  await app.register(messageRoutes, { prefix: '/api/v1' });
  await app.register(contactRoutes, { prefix: '/api/v1/contacts' });
  await app.register(blockRoutes, { prefix: '/api/v1/blocks' });
  await app.register(reportRoutes, { prefix: '/api/v1/reports' });
  await app.register(callRoutes, { prefix: '/api/v1/calls' });
  await app.register(uploadRoutes, { prefix: '/api/v1/upload' });
  await app.register(pushRoutes, { prefix: '/api/v1/push' });

  return app;
}
