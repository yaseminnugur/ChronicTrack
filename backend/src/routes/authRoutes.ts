import express from 'express';
import { register, login, completeOnboarding } from '../controllers/authController.ts';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);
router.put('/complete-onboarding', completeOnboarding);

export default router;
