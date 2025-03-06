import { Router } from 'express';
import { getPermissions, getRolePermissions, assignPermissionsToRole } from '../controllers/permissionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/permissions', authMiddleware, getPermissions); // Ver todos los permisos
router.get('/permissions/role/:id', authMiddleware, getRolePermissions); // Ver permisos de un rol
router.post('/permissions/assign', authMiddleware, assignPermissionsToRole); // Asignar permisos a un rol

export default router;
