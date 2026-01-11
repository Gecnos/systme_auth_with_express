import { sendEmail } from '../services/Email.service.js';
import { generateToken } from '../services/Token.service.js';
import { verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/emailTemplate.js';
import prisma from '../lib/prisma.js';

export async function sendVerificationEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: 'Email déjà vérifié' });
    }

    const token = generateToken();

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendEmail(email, 'Vérification Email', verificationEmailTemplate(token));

    res.json({ message: 'Email de vérification envoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function sendResetPasswordEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const token = generateToken();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendEmail(email, 'Réinitialisation mot de passe', resetPasswordEmailTemplate(token));

    res.json({ message: 'Email de réinitialisation envoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ✅ NOUVEAU : Vérifier l'email avec le token
export async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken) {
      return res.status(404).json({ error: 'Token invalide' });
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      });
      return res.status(400).json({ error: 'Token expiré' });
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    res.json({ message: 'Email vérifié avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ✅ NOUVEAU : Renvoyer l'email de vérification
export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: 'Email déjà vérifié' });
    }

    // Supprimer les anciens tokens non utilisés
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    });

    // Créer un nouveau token
    const token = generateToken();

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendEmail(email, 'Vérification Email', verificationEmailTemplate(token));

    res.json({ message: 'Email de vérification renvoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}



// ✅ NOUVEAU : Valider le token de reset
export async function validateResetToken(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return res.status(404).json({ error: 'Token invalide' });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      return res.status(400).json({ error: 'Token expiré' });
    }

    res.json({ message: 'Token valide', valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ✅ NOUVEAU : Réinitialiser le mot de passe
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return res.status(404).json({ error: 'Token invalide' });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      return res.status(400).json({ error: 'Token expiré' });
    }

   
    // Pour l'instant on stocke en clair (temporaire)
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: newPassword }
    });

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    // Supprimer tous les refresh tokens de l'utilisateur (déconnexion partout)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}