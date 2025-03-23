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

router.post('/users', createUser);
router.get('/users/:email', authMiddleware, getUserByEmail);
router.get('/users', getUsers);
router.put('/edit-user', editUser);
router.delete('/delete-user', deleteUser); 
//Actualizar rol de usuario
router.put('/users/:id/rol', authMiddleware, updateUserRole); 
// Rutas para verificar email y resetear contraseña
router.post('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
// Ruta para iniciar sesión
router.post('/login', loginUser);


export default router;
