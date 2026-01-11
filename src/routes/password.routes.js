import express from 'express';
import {
  sendResetPasswordEmail,
  validateResetToken,
  resetPassword
} from '../controllers/EmailController.js';

const router = express.Router();

// Routes publiques pour la réinitialisation de mot de passe
router.post('/forgot', sendResetPasswordEmail);
router.post('/validate-token', validateResetToken);
router.post('/reset', resetPassword);

export default router;
