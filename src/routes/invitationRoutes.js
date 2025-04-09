import { Router } from 'express';
import { sendInvitation, validateInvitation } from '../controllers/invitationController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/invitacion', verifyAuth, sendInvitation); // Generar y enviar invitación (Solo gestores)
router.get('/invitacion/:token', validateInvitation); // Validar la invitación cuando el usuario accede al enlace

export default router;
