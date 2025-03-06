import { Router } from 'express';
import { 
  getUsers, 
  createUser, 
  verifyEmail, 
  loginUser, 
  getUserByEmail, 
  updateUserRole, 
  editUser,
  deleteUser
} from '../controllers/userController.js';
import { requestPasswordReset, resetPassword } from '../controllers/newPasswordController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Middleware para validar autenticación

const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.post('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/users/:email', authMiddleware, getUserByEmail);
router.put('/users/:id/rol', authMiddleware, updateUserRole); 
router.put('/edit-user', editUser); 
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.delete('/delete-user', deleteUser);

export default router;
