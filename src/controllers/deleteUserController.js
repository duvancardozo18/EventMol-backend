import { getUserByEmail, deleteUserByEmail } from '../models/deleteUser.js';
import transporter from '../config/emailConfig.js';
import { mailOptions } from '../helpers/deleteMailHelper.js';

export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
    }

    // Eliminar el usuario
    const deletedUser = await deleteUserByEmail(email);
    if (!deletedUser) {
      return res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }

    await transporter.sendMail(mailOptions(deletedUser));

    res.status(200).json({ mensaje: 'Usuario eliminado y correo de confirmación enviado.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la eliminación del usuario.' });
  }
};
