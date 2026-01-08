import twoFactorService from '../services/2fa.service.js';
import tokenService from '../services/token.service.js';
import asyncHandler from '../lib/async-handler.js';
import jwt from 'jsonwebtoken';

class TwoFactorController {
 
  getStatus = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const status = await twoFactorService.getStatus(userId);
    res.json(status);
  });

 
  enable = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { secret, qrCode } = await twoFactorService.generateSecret(userId);

    res.json({
      message: 'Scannez ce QR code avec votre application d\'authentification',
      secret,
      qrCode,
    });
  });

 
  verify = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { token } = req.body;

    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'Code invalide (6 chiffres requis)' });
    }

    const verified = await twoFactorService.verifyAndEnable(userId, token);

    if (!verified) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    res.json({
      message: '2FA activé avec succès',
      enabled: true,
    });
  });

 
  verifyLogin = asyncHandler(async (req, res) => {
    const { token, twoFactorToken } = req.body;

    if (!token || !twoFactorToken) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    let decoded;
    try {
      decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token expiré ou invalide' });
    }

    if (decoded.purpose !== '2fa-pending') {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const verified = await twoFactorService.verifyToken(decoded.userId, token);

    if (!verified) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    
    // TODO Ferdinande: Créer tokenService.generateTokens(userId, ipAddress, userAgent)
    // Doit retourner { accessToken, refreshToken }
    const tokens = await tokenService.generateTokens(decoded.userId, ipAddress, userAgent);

    res.json({
      message: 'Connexion réussie avec 2FA',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  });

 
  disable = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    // Ferdinande: Créer authService.verifyPassword(userId, password)
    // une exception si le mot de passe est incorrect
    await authService.verifyPassword(userId, password);

    const result = await twoFactorService.disable(userId);
    res.json(result);
  });
}

export default new TwoFactorController();