import { FastifyRequest, FastifyReply } from 'fastify';

type Schema = {
  parse: (data: unknown) => unknown;
};

export function validateBody(schema: Schema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid input',
      });
    }
  };
}
