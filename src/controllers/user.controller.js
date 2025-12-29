const prisma = require('../lib/prisma');
const { NotFoundError, ForbiddenError } = require('../lib/errors');

// Consulter son profil
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        twoFactorEnabledAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour son profil
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerifiedAt: true,
        twoFactorEnabledAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Supprimer son compte
const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        disabledAt: new Date()
      }
    });

    // Invalider tous les refresh tokens
    await prisma.refreshToken.updateMany({
      where: { 
        userId: req.user.id,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    // Ajouter le token d'accès actuel à la blacklist
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.blacklistedAccessToken.create({
        data: {
          token,
          userId: req.user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Lister les sessions actives
const listSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: req.user.id,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// Révoquer une session spécifique
const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.refreshToken.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      throw new NotFoundError('Session non trouvée');
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Révoquer toutes les autres sessions
const revokeOtherSessions = async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { 
        userId: req.user.id,
        id: { not: req.user.sessionId }, // Ne pas révoquer la session actuelle
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  listSessions,
  revokeSession,
  revokeOtherSessions
};