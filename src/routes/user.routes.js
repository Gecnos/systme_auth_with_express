import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  getLoginHistory
} from '../controllers/user.controller.js';

const router = Router();

// Toutes ces routes nécessitent une authentification
router.use(authMiddleware);

// Profil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteAccount);

// Sessions
router.get('/sessions', listSessions);
router.delete('/sessions/:sessionId', revokeSession);
router.delete('/sessions', revokeOtherSessions);

// Historique
router.get('/login-history', getLoginHistory);

export default router;