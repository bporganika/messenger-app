import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.s3.region,
    };

    if (config.s3.accessKeyId && config.s3.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      };
    }

    if (config.s3.endpoint) {
      clientConfig.endpoint = config.s3.endpoint;
      clientConfig.forcePathStyle = true;
    }

    s3Client = new S3Client(clientConfig);
  }
  return s3Client;
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  if (!config.s3.bucket) {
    throw new Error('S3_BUCKET not configured');
  }

  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  if (config.s3.endpoint) {
    return `${config.s3.endpoint}/${config.s3.bucket}/${key}`;
  }

  return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
}
