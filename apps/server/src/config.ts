import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env['PORT']) || 3000,
  host: process.env['HOST'] || '0.0.0.0',
  corsOrigin: process.env['CORS_ORIGIN'] || '',

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d',
  },

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  twilio: {
    accountSid: process.env['TWILIO_ACCOUNT_SID'] || '',
    authToken: process.env['TWILIO_AUTH_TOKEN'] || '',
    fromPhone: process.env['TWILIO_FROM_PHONE'] || '',
  },

  google: {
    clientId: process.env['GOOGLE_CLIENT_ID'] || '',
  },

  apple: {
    bundleId: process.env['APPLE_BUNDLE_ID'] || 'com.pulse.messenger',
  },

  s3: {
    bucket: process.env['S3_BUCKET'] || '',
    region: process.env['S3_REGION'] || 'eu-central-1',
    accessKeyId: process.env['S3_ACCESS_KEY_ID'] || '',
    secretAccessKey: process.env['S3_SECRET_ACCESS_KEY'] || '',
    endpoint: process.env['S3_ENDPOINT'] || '',
  },

  otp: {
    length: 6,
    ttlMinutes: 5,
    maxAttempts: 3,
  },

  session: {
    refreshTtlDays: 30,
  },
} as const;
