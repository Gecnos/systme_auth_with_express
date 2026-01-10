import { sendEmail } from '../services/Email.service.js';
import { generateToken } from '../services/Token.service.js';
import { verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/emailTemplate.js';
import prisma from '../lib/prisma.js';

export async function sendVerificationEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const token = generateToken();

    // ✅ Utiliser seulement les champs qui existent dans le schéma
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

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const token = generateToken();

    // ✅ Utiliser passwordResetToken au lieu de verificationToken
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