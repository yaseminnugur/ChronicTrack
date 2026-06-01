import express from 'express';
import { registerPushToken, removePushToken } from '../controllers/notificationController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.post('/push-token', authenticate, registerPushToken);
router.delete('/push-token', authenticate, removePushToken);

export default router;
