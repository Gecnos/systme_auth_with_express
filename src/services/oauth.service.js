import prisma from '../lib/prisma.js';
import * as jwtLib from '../lib/jwt.js';
import crypto from 'crypto';

class OAuthService {
  

  async generateTokensForOAuthUser(user, ipAddress, userAgent) {
    const accessToken = jwtLib.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
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

  
   
  async requiresTwoFactor(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabledAt: true },
    });

    return !!(user?.twoFactorSecret && user?.twoFactorEnabledAt);
  }

  generateTwoFactorToken(userId) {
    return jwtLib.sign(
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