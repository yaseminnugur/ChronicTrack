import express from 'express';
import { addBloodSugar, addBloodPressure, getDashboardData, getBloodSugars, getBloodPressures } from '../controllers/healthController.ts';
import {
  getBloodSugarAnalysis,
  getBloodPressureAnalysis,
  refreshBloodSugarAnalysis,
  refreshBloodPressureAnalysis,
} from '../controllers/aiAnalysisController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.post('/blood-sugar', authenticate, addBloodSugar);
router.post('/blood-pressure', authenticate, addBloodPressure);
router.get('/dashboard', authenticate, getDashboardData);
router.get('/blood-sugar', authenticate, getBloodSugars);
router.get('/blood-pressure', authenticate, getBloodPressures);

// AI analiz endpoint'leri
router.get('/analysis/blood-sugar', authenticate, getBloodSugarAnalysis);
router.get('/analysis/blood-pressure', authenticate, getBloodPressureAnalysis);
router.post('/analysis/blood-sugar/refresh', authenticate, refreshBloodSugarAnalysis);
router.post('/analysis/blood-pressure/refresh', authenticate, refreshBloodPressureAnalysis);

export default router;
