import oauthService from '../services/oauth.service.js';
import twoFactorService from '../services/2fa.service.js';
import asyncHandler from '../lib/async-handler.js';

class OAuthController {
 
  googleCallback = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }

    const requires2FA = await twoFactorService.getStatus(user.id);

    if (requires2FA.enabled) {
      const tempToken = oauthService.generateTwoFactorToken(user.id);
      return res.redirect(
        `${process.env.FRONTEND_URL}/verify-2fa?token=${tempToken}`
      );
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const tokens = await oauthService.generateTokens(user.id, ipAddress, userAgent);

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`
    );
  });

  
  unlinkProvider = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { provider } = req.params;

    const result = await oauthService.unlinkProvider(userId, provider);

    res.json(result);
  });
}

export default new OAuthController();
