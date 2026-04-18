import express from 'express';
import { saveProfile, saveConditionsAndComplete } from '../controllers/onboardingController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.put('/step1', authenticate, saveProfile);

router.put('/step2', authenticate, saveConditionsAndComplete);

export default router;
