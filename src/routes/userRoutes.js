import { Router } from 'express';
import { getUsers, createUser, verifyEmail, loginUser } from '../controllers/userController.js';

const router = Router();

router.get('/users', getUsers);



export default router;
