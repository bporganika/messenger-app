import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { badRequest, sendError } from '../utils/errors';
import { uploadToS3 } from '../utils/s3';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'application/pdf', 'application/msword'];

function getAttachmentType(mime: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
}

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/', async (request, reply) => {
    try {
      const file = await request.file();
      if (!file) throw badRequest('No file provided');

      const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) =>
        file.mimetype.startsWith(prefix),
      );
      if (!isAllowed) throw badRequest('File type not allowed');

      // Consume file to buffer to check size
      const chunks: Buffer[] = [];
      let totalSize = 0;

      for await (const chunk of file.file) {
        totalSize += chunk.length;
        if (totalSize > MAX_FILE_SIZE) {
          throw badRequest('File exceeds 100 MB limit');
        }
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const key = `uploads/${Date.now()}-${file.filename}`;

      const url = await uploadToS3(buffer, key, file.mimetype);

      return reply.status(201).send({
        url,
        type: getAttachmentType(file.mimetype),
        size: totalSize,
        mimeType: file.mimetype,
        fileName: file.filename,
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });
}
