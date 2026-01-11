import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { UnauthorizedException } from '../lib/exceptions.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException("Token manquant");
    }

    const isBlacklisted = await prisma.blacklistedAccessToken.findUnique({
      where: { token }
    });

    if (isBlacklisted) {
      throw new UnauthorizedException("Token révoqué");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is disabled
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { disabledAt: true }
    });

    if (user?.disabledAt) {
      throw new UnauthorizedException("Compte désactivé");
    }

    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};
