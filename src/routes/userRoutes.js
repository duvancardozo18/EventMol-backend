import { Router } from 'express';
import { 
  getUsers, 
  createUser, 
  verifyEmail, 
  loginUser,
  logoutUser, 
  getUserByEmail, 
  updateUserRole, 
  editUser,
  deleteUser
} from '../controllers/userController.js';
import { requestPasswordReset, resetPassword } from '../controllers/newPasswordController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware.js'; 

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/users', createUser);
router.post('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword); 
router.post('/login', loginUser);
router.post('/logout', logoutUser); // Nueva ruta para cerrar sesión
router.put('/edit-user', editUser);

// Rutas protegidas (requieren autenticación)
router.get('/users/:email', verifyAuth, getUserByEmail);
router.get('/users', verifyAuth, getUsers); // Considera añadir verifyRole([1]) si solo admins deberían ver todos los usuarios
router.delete('/delete-user', verifyAuth, verifyRole([1]), deleteUser); // Solo admin puede eliminar usuarios
// Actualizar rol de usuario - solo para admins (role 1)
router.put('/users/:id/rol', verifyAuth, verifyRole([1]), updateUserRole);

export default router;