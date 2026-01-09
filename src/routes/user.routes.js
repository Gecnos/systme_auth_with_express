import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Toutes les routes ci-dessous nécessitent une authentification
router.use(authMiddleware);

// Gestion du profil
router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Gestion des sessions
router.get('/sessions', userController.listSessions);
router.delete('/sessions/:sessionId', userController.revokeSession);
router.delete('/sessions', userController.revokeOtherSessions);

// Historique de connexion
router.get('/history', userController.getLoginHistory);

export default router;