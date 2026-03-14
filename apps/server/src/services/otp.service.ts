import Twilio from 'twilio';
import { config } from '../config';
import { prisma } from '../utils/prisma';

const twilioEnabled =
  config.twilio.accountSid.length > 0 && config.twilio.authToken.length > 0;

const twilioClient = twilioEnabled
  ? Twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

function generateCode(): string {
  const min = Math.pow(10, config.otp.length - 1);
  const max = Math.pow(10, config.otp.length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function sendOtp(target: string): Promise<{ success: boolean; code?: string }> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + config.otp.ttlMinutes * 60 * 1000);

  // Invalidate any existing unexpired OTPs for this target
  await prisma.oTP.updateMany({
    where: { target, verified: false, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  await prisma.oTP.create({
    data: { target, code, expiresAt },
  });

  const isPhone = target.startsWith('+');

  if (isPhone && twilioClient) {
    await twilioClient.messages.create({
      body: `Your Pulse verification code is: ${code}`,
      from: config.twilio.fromPhone,
      to: target,
    });
    return { success: true };
  }

  // In dev mode or for email: log the code (email provider would go here)
  console.log(`[OTP] ${target} → ${code}`);
  return { success: true, code: twilioEnabled ? undefined : code };
}

export async function verifyOtp(
  target: string,
  code: string,
): Promise<{ valid: boolean }> {
  const otp = await prisma.oTP.findFirst({
    where: {
      target,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
      attempts: { lt: config.otp.maxAttempts },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    // Increment attempts on the latest unverified OTP
    await prisma.oTP.updateMany({
      where: { target, verified: false },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false };
  }

  await prisma.oTP.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  return { valid: true };
}
