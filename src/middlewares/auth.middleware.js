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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new UnauthorizedException("Token expiré");
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException("Token invalide");
      }
      throw new UnauthorizedException("Erreur de vérification du token");
    }
    
    req.user = decoded;
    
    next();
  } catch (error) {
    next(error);
  }
};