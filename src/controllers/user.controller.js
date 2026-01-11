import prisma from '../lib/prisma.js';
import { NotFoundException } from '../lib/exceptions.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
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

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    // Basic validation
    if (firstName && (typeof firstName !== 'string' || firstName.length > 50)) {
      return res.status(400).json({ message: "Prénom invalide" });
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
      return res.status(400).json({ message: "Nom invalide" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.sub },
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

export const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.sub },
      data: {
        disabledAt: new Date()
      }
    });

    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.sub,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.blacklistedAccessToken.create({
        data: {
          token,
          userId: req.user.sub,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: req.user.sub,
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

export const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.refreshToken.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.sub) {
      throw new NotFoundException('Session non trouvée');
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

export const revokeOtherSessions = async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.sub,
        id: { not: req.user.sessionId },
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getLoginHistory = async (req, res, next) => {
  try {
    const history = await prisma.loginHistory.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        loginMethod: true,
        createdAt: true
      }
    });

    res.json(history);
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
