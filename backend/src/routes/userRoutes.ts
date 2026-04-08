import express from 'express';
import { createUser, getUsers } from '../controllers/userController.ts';

const router = express.Router();

// Route: /api/users
router.post('/', createUser); // Veri eklemek için POST
router.get('/', getUsers);    // Tüm verileri görmek için GET

export default router;
