import express from 'express';
import { 
  sendVerificationEmail, 
  resendVerificationEmail
} from '../controllers/EmailController.js';
import { verifyEmail } from '../controllers/VerificationController.js';

const router = express.Router();

router.post('/send-verification', sendVerificationEmail);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);  

export default router;