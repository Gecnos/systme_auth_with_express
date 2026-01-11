import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/refresh', refreshToken); // Alias pour refresh-token

// Routes protégées
router.post('/logout', authMiddleware, logout);

export default router;
