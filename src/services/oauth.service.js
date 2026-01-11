import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class OAuthService {

  async generateTokens(userId, ipAddress, userAgent) {
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
        loginMethod: 'oauth',
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  generateTwoFactorToken(userId) {
    return jwt.sign(
      { userId, purpose: '2fa-pending' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
  }

  async unlinkProvider(userId, provider) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      throw new Error('Vous devez définir un mot de passe avant de déconnecter votre compte OAuth');
    }

    await prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    return { message: `Compte ${provider} déconnecté avec succès` };
  }
}

export default new OAuthService();