import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config';

const APPLE_JWKS_URI = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

const client = jwksClient({
  jwksUri: APPLE_JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      if (!key) return reject(new Error('No signing key found'));
      resolve(key.getPublicKey());
    });
  });
}

export interface AppleUserInfo {
  appleId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AppleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  iss: string;
  aud: string;
}

export async function verifyAppleToken(
  identityToken: string,
  fullName?: { firstName?: string; lastName?: string },
): Promise<AppleUserInfo> {
  // Decode header to get key ID
  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid Apple identity token');
  }

  const publicKey = await getSigningKey(decoded.header.kid);

  const payload = jwt.verify(identityToken, publicKey, {
    issuer: APPLE_ISSUER,
    audience: config.apple.bundleId,
    algorithms: ['RS256'],
  }) as AppleTokenPayload;

  if (!payload.sub) {
    throw new Error('Apple token missing subject');
  }

  return {
    appleId: payload.sub,
    email: payload.email,
    firstName: fullName?.firstName,
    lastName: fullName?.lastName,
  };
}
