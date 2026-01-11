import prisma from '../lib/prisma.js';
import argon2 from 'argon2';

class AuthService {
  async verifyPassword(userId, password) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      throw new Error('Utilisateur ou mot de passe invalide');
    }

    const isValid = await argon2.verify(user.password, password);
    
    if (!isValid) {
      throw new Error('Mot de passe incorrect');
    }

    return true;
  }
}

export default new AuthService();
