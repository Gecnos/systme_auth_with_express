import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Vérification email
export async function verifyEmail(req, res) {
  const { token } = req.params;
  try {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) return res.status(404).json({ error: 'Token invalide' });

    // ici tu peux activer l'utilisateur ou marquer l'email comme vérifié
    await prisma.verificationToken.delete({ where: { token } });

    res.json({ message: 'Email vérifié !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
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
