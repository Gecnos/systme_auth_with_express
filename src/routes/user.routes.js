import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.post('/register', userController.register);

router.get('/me', authMiddleware, userController.getProfile);

export default router;