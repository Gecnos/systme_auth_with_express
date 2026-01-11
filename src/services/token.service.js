import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function generateTokens(userId, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const accessToken = jwt.sign(
    { userId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshTokenString = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  await prisma.loginHistory.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      success: true,
      loginMethod: '2fa',
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenString,
  };
}

export default {
  generateToken,
  generateTokens,
};
