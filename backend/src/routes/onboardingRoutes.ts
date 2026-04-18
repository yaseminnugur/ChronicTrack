import express from 'express';
import { saveProfile, saveConditionsAndComplete, saveOnboardingData } from '../controllers/onboardingController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.put('/step1', authenticate, saveProfile);

router.put('/step2', authenticate, saveConditionsAndComplete);

router.post('/data', authenticate, saveOnboardingData);

export default router;
