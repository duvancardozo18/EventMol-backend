import { Router } from 'express';
import { getUsers, createUser, verifyEmail, loginUser } from '../controllers/userController.js';
import { requestPasswordReset, resetPassword } from '../controllers/newPasswordController.js';
import { deleteUser } from '../controllers/deleteUserController.js';
import { editUser } from '../controllers/editController.js';


const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);

//diego:
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.delete('/delete-user', deleteUser);
router.put('/edit-user', editUser);

export default router;
