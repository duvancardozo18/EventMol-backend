import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.js';
import transporter from '../config/emailConfig.js';
import { storeInvitationToken, getInvitationByToken, deleteInvitationToken } from '../models/invitation.js';

// Generar y enviar una invitación a un usuario
export const sendInvitation = async (req, res) => {
    try {
        const { id_event, id_user } = req.body;
        const { id_role } = req.user; // Obtiene el rol del usuario autenticado

        // Solo los Gestores de Eventos pueden enviar invitaciones
        if (id_role !== 2) {
            return res.status(403).json({ error: 'No tienes permisos para generar invitaciones.' });
        }

        // Verificar si el usuario existe
        const user = await UserModel.getUserById(id_user);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Generar token único con JWT
        const token = jwt.sign(
            { id_event, id_user },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Expira en 7 días
        );

        // Guardar la invitación en memoria
        storeInvitationToken(token, id_event, id_user);

        // Enlace de invitación
        const invitationLink = `http://localhost:7777/api/invitacion/${token}`;

        // Configurar el email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Invitación a un evento',
            html: `
                <h3>Has sido invitado a un evento</h3>
                <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
                <a href="${invitationLink}">${invitationLink}</a>
                <p>Este enlace expirará en 7 días.</p>
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            mensaje: 'Invitación enviada con éxito.',
            invitationLink
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar la invitación.' });
    }
};

//  Validar la invitación cuando el usuario accede al enlace
export const validateInvitation = async (req, res) => {
    try {
        const { token } = req.params;

        // Buscar la invitación en memoria
        const invitation = getInvitationByToken(token);
        if (!invitation) {
            return res.status(404).json({ error: 'Invitación no válida o expirada.' });
        }

        // Simulamos que se guarda la asistencia en la BD (porque no podemos modificarla)
        console.log(`✅ Usuario ${invitation.id_user} aceptó la invitación al evento ${invitation.id_event}`);

        // Eliminar la invitación de memoria
        deleteInvitationToken(token);

        res.status(200).json({ mensaje: 'Invitación aceptada con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al validar la invitación.' });
    }
};
