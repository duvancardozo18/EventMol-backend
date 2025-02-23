import { Router } from 'express';
import { getUsers, createUser, verifyEmail, loginUser } from '../controllers/userController.js';

const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/verify-email/:token', verifyEmail);



export default router;
