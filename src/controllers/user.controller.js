import prisma from '../lib/prisma.js';
import { NotFoundException } from '../lib/exceptions.js';

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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
      throw new NotFoundException('Utilisateur non trouvé');
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le profil
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Si email changé, vérifier unicité et réinitialiser vérification
    if (email !== undefined && email !== req.user. email) {
      const existingUser = await prisma.user. findUnique({
        where:  { email }
      });

      if (existingUser && existingUser.id !== req. user.userId) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      updateData.email = email;
      updateData.emailVerifiedAt = null; // Nécessite re-vérification
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName:  true,
        emailVerifiedAt: true,
        twoFactorEnabledAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver/Supprimer le compte
 */
export const deleteAccount = async (req, res, next) => {
  try {
    // Soft delete
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        disabledAt: new Date()
      }
    });

    // Révoquer tous les refresh tokens
    await prisma.refreshToken.updateMany({
      where: { 
        userId: req.user. userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    // Blacklister le token actuel
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.blacklistedAccessToken.create({
        data: {
          token,
          userId: req.user.userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Compte désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lister les sessions actives
 */
export const listSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: req. user.userId,
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

    // Marquer la session actuelle
    const currentToken = req.headers.authorization?.split(' ')[1];
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.token === currentToken
    }));

    res.json({
      success: true,
      data: { sessions: sessionsWithCurrent }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Révoquer une session spécifique
 */
export const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.refreshToken.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user. userId) {
      throw new NotFoundException('Session non trouvée');
    }

    if (session.revokedAt) {
      return res.status(400).json({
        success: false,
        message: 'Cette session est déjà révoquée'
      });
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Session révoquée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Révoquer toutes les autres sessions
 */
export const revokeOtherSessions = async (req, res, next) => {
  try {
    // Trouver le refresh token actuel depuis le body
    const { currentRefreshToken } = req.body;

    if (!currentRefreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Le refresh token actuel est requis'
      });
    }

    const currentSession = await prisma.refreshToken. findUnique({
      where:  { token: currentRefreshToken }
    });

    if (!currentSession || currentSession.userId !== req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token invalide'
      });
    }

    // Révoquer toutes les autres sessions
    const result = await prisma.refreshToken. updateMany({
      where: { 
        userId: req.user. userId,
        id: { not: currentSession.id },
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.json({
      success: true,
      message: `${result.count} session(s) révoquée(s) avec succès`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer l'historique de connexion
 */
export const getLoginHistory = async (req, res, next) => {
  try {
    const history = await prisma.loginHistory.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        loginMethod: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Dernières 50 connexions
    });

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  deleteAccount,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  getLoginHistory
};