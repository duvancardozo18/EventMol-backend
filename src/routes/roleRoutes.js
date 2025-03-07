import { Router } from 'express';
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Protección con autenticación

const router = Router();

router.get('/roles', authMiddleware, getRoles); // Obtener todos los roles
router.get('/roles/:id', authMiddleware, getRoleById); // Obtener un rol con permisos
router.post('/roles', authMiddleware, createRole); // Crear un nuevo rol
router.put('/roles/:id', authMiddleware, updateRole); // Editar un rol
router.delete('/roles/:id', authMiddleware, deleteRole); // Eliminar un rol

export default router;
