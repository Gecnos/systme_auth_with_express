import express from 'express';
import { 
  sendVerificationEmail, 
  sendResetPasswordEmail,
  verifyEmail,
  resendVerificationEmail,
  validateResetToken,
  resetPassword
} from '../controllers/EmailController.js';

const router = express.Router();

router.post('/send-verification', sendVerificationEmail);
router.post('/send-reset-password', sendResetPasswordEmail);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/validate-reset-token', validateResetToken);  
router.post('/reset-password', resetPassword);  

export default router;