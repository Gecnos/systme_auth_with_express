import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh-tokens', authController.refreshTokens);
router.post('/logout', authMiddleware, authController.logout);

export default router;
