import express from 'express';
import { sendVerificationEmail, sendResetPasswordEmail } from '../controllers/EmailController.js';

const router = express.Router();

router.post('/send-verification', sendVerificationEmail);
router.post('/send-reset-password', sendResetPasswordEmail);

export default router;
