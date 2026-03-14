import type { FastifyInstance } from 'fastify';
import { config } from '../config';

export function signAccessToken(fastify: FastifyInstance, payload: { userId: string }) {
  return fastify.jwt.sign(payload, { expiresIn: config.jwt.accessExpiresIn });
}

export function signRefreshToken(fastify: FastifyInstance, payload: { userId: string; sessionId: string }) {
  return fastify.jwt.sign(payload, { expiresIn: config.jwt.refreshExpiresIn });
}
