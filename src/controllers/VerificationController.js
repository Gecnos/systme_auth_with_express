import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Vérification email
export async function verifyEmail(req, res) {
  const { token } = req.params;
  try {
    const record = await prisma.verificationToken.findUnique({ 
      where: { token },
      include: { user: true }
    });
    
    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: 'Token invalide ou expiré' 
      });
    }

    // Vérifier si le token n'est pas expiré
    if (new Date() > record.expiresAt) {
      await prisma.verificationToken.delete({ where: { token } });
      return res.status(400).json({ 
        success: false,
        message: 'Token expiré' 
      });
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({ where: { token } });

    res.json({ 
      success: true,
      message: 'Email vérifié avec succès !' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur' 
    });
  }
}

// Vérification token de reset mot de passe
export async function verifyResetToken(req, res) {
  const { token } = req.params;
  try {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) return res.status(404).json({ error: 'Token invalide' });

    res.json({ message: 'Token valide', email: record.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
