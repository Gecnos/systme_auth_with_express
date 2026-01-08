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
    
    req.user = decoded;
    
    next();
  } catch (error) {
    next(error);
  }
};