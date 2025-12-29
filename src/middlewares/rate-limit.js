import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // On va limiter à 100 requetes chaque adresse IP
  message: { message: "Trop de requêtes, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 tentative de connexion par heures
  message: { message: "Trop de tentatives de connexion, compte bloqué temporairement." }
});