import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import { sign } from '../lib/jwt.js';
import { generateToken } from '../services/Token.service.js';
import { BadRequestException, UnauthorizedException } from '../lib/exceptions.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../services/Email.service.js';
import { verificationEmailTemplate } from '../utils/emailTemplate.js';

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérification des données requises
    if (!email || !password) {
      throw new BadRequestException('Email et mot de passe sont obligatoires');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Hash du mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    logger.info(`Nouvel utilisateur enregistré: ${user.email}`);

    // Créer un token de vérification
    const verificationToken = generateToken();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
      }
    });

    // Envoyer l'email de vérification
    try {
      await sendEmail(
        user.email,
        'Vérifiez votre adresse email',
        verificationEmailTemplate(verificationToken)
      );
      logger.info(`Email de vérification envoyé à: ${user.email}`);
    } catch (emailError) {
      logger.error(`Erreur lors de l'envoi de l'email à ${user.email}:`, emailError);
      // On continue quand même, l'utilisateur peut demander un nouveau mail
    }

    // Générer les tokens
    const accessToken = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = generateToken();

    // Créer un refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }
    });

    const tokens = { accessToken, refreshToken };

    res.status(201).json({
      success: true,
      message: 'Enregistrement réussi. Un email de vérification a été envoyé à votre adresse.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérification des données requises
    if (!email || !password) {
      throw new BadRequestException('Email et mot de passe sont obligatoires');
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    logger.info(`Connexion réussie: ${user.email}`);

    // Générer les tokens
    const accessToken = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = generateToken();

    // Créer un refresh token
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    const tokens = { accessToken, refreshToken };

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        tokens,
        tokenId: refreshTokenRecord.id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renouveler le token d'accès
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenValue } = req.body;

    if (!refreshTokenValue) {
      throw new BadRequestException('Refresh token manquant');
    }

    // Vérifier si le refresh token existe
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue }
    });

    if (!refreshTokenRecord || new Date() > refreshTokenRecord.expiresAt || refreshTokenRecord.revokedAt) {
      throw new UnauthorizedException('Refresh token expiré ou invalide');
    }

    // Récupérer l'email de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: refreshTokenRecord.userId },
      select: { email: true }
    });

    const newAccessToken = sign(
      { userId: refreshTokenRecord.userId, email: user?.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const tokens = { accessToken: newAccessToken, refreshToken: refreshTokenValue };

    res.json({
      success: true,
      message: 'Token renouvelé avec succès',
      data: { tokens }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnexion d'un utilisateur
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Ajouter le token à la blacklist
      await prisma.blacklistedAccessToken.create({
        data: {
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
        }
      });
    }

    logger.info(`Déconnexion utilisateur: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};
