import prisma from '../lib/prisma.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class TwoFactorService {
 
  async generateSecret(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabledAt: true },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.twoFactorEnabledAt) {
      throw new Error('2FA déjà activé');
    }

    // Générer un nouveau 
    const secret = speakeasy.generateSecret({
      name: `AuthAPI (${user.email})`,
      issuer: 'AuthAPI',
    });

    // Stocker le secret temporairement (pas encore activé)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyAndEnable(userId, token) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabledAt: true },
    });

    if (!user?.twoFactorSecret) {
      throw new Error('2FA non configuré');
    }

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // 
    });

    if (!verified) {
      return false;
    }

    if (!user.twoFactorEnabledAt) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabledAt: new Date() },
      });
    }

    return true;
  }

  
  async verifyToken(userId, token) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabledAt: true },
    });

    if (!user?.twoFactorSecret || !user.twoFactorEnabledAt) {
      throw new Error('2FA non activé');
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

 
  async disable(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabledAt: true },
    });

    if (!user?.twoFactorEnabledAt) {
      throw new Error('2FA déjà désactivé');
    }

   
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
      },
    });

    return { message: '2FA désactivé avec succès' };
  }

  
  async getStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabledAt: true },
    });

    return {
      enabled: !!user?.twoFactorEnabledAt,
      enabledAt: user?.twoFactorEnabledAt,
    };
  }
}

export default new TwoFactorService();