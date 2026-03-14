import 'dotenv/config';

export const config = {
  port: Number(process.env['PORT']) || 3000,
  host: process.env['HOST'] || '0.0.0.0',
  corsOrigin: process.env['CORS_ORIGIN'] || '*',

  jwt: {
    secret: process.env['JWT_SECRET'] || 'dev-secret',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'dev-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d',
  },

  database: {
    url: process.env['DATABASE_URL'] || '',
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

  otp: {
    length: 6,
    ttlMinutes: 5,
    maxAttempts: 3,
  },

  session: {
    refreshTtlDays: 30,
  },
} as const;
