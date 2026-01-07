import twoFactorService from '../services/2fa.service.js';
import authService from '../services/oauth.service.js';
import asyncHandler from '../lib/async-handler.js';
import * as jwtLib from '../lib/jwt.js';

class TwoFactorController {
 
  getStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const status = await twoFactorService.getStatus(userId);
    res.json(status);
  });

 
  enable = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { secret, qrCode } = await twoFactorService.generateSecret(userId);

    res.json({
      message: 'Scannez ce QR code avec votre application d\'authentification',
      secret,
      qrCode,
    });
  });

 
  verify = asyncHandler(async (req, res) => {
    const userId = req.user.id;
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

    // Décoder le token temporaire
    let decoded;
    try {
      decoded = jwtLib.verify(twoFactorToken, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token expiré ou invalide' });
    }

    if (decoded.purpose !== '2fa-pending') {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Vérifier le code 2FA
    const verified = await twoFactorService.verifyToken(decoded.userId, token);

    if (!verified) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    // Générer les tokens finaux
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    
    const tokens = await authService.generateTokens(decoded.userId, ipAddress, userAgent);

    res.json({
      message: 'Connexion réussie avec 2FA',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  });

 
  disable = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }


    await authService.verifyPassword(userId, password);

    const result = await twoFactorService.disable(userId);
    res.json(result);
  });
}

export default new TwoFactorController();