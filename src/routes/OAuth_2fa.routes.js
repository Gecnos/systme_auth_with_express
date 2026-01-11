import express from 'express';
import passport from '../config/passport.js';
import oauthController from '../controllers/oauth.controller.js';
import twoFactorController from '../controllers/2fa.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// OAuth Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  oauthController.googleCallback
);

router.delete(
  '/oauth/:provider',
  authMiddleware,
  oauthController.unlinkProvider
);

// 2FA
router.get('/2fa/status', authMiddleware, twoFactorController.getStatus);
router.post('/2fa/enable', authMiddleware, twoFactorController.enable);
router.post('/2fa/verify', authMiddleware, twoFactorController.verify);
router.post('/2fa/verify-login', twoFactorController.verifyLogin);
router.post('/2fa/disable', authMiddleware, twoFactorController.disable);

export default router;
