import express from 'express';
import { addBloodSugar, addBloodPressure, getDashboardData, getBloodSugars, getBloodPressures } from '../controllers/healthController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.post('/blood-sugar', authenticate, addBloodSugar);
router.post('/blood-pressure', authenticate, addBloodPressure);
router.get('/dashboard', authenticate, getDashboardData);
router.get('/blood-sugar', authenticate, getBloodSugars);
router.get('/blood-pressure', authenticate, getBloodPressures);

export default router;
