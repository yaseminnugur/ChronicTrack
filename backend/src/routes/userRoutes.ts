import express from 'express';
import { getProfile, updateProfile, getUsers } from '../controllers/userController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

router.get('/', getUsers);

export default router;
