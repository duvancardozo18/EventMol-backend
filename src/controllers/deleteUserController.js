import { getUserByEmail, deleteUserByEmail } from '../models/deleteUser.js';
import transporter from '../config/emailConfig.js';

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

    // Enviar email de confirmación, lo mismo hacer esto aparte. no olvidar !!!!
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔴 Tu cuenta ha sido eliminada',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #fff; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); padding: 20px; text-align: center; border: 1px solid #ddd;">
            <div style="background: #ff4d4d; color: white; padding: 15px; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0;">🚨 Cuenta Eliminada 🚨</h2>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 18px; color: #333;"><b>Hola ${deletedUser.name} ${deletedUser.last_name},</b></p>
              <p style="color: #555;">Tu cuenta ha sido eliminada exitosamente de nuestra plataforma.</p>
              <hr style="border: 0; height: 1px; background: #ddd;">
              <h3 style="color: #ff4d4d;">Detalles de la eliminación</h3>
              <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>Nombre:</b></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${deletedUser.name} ${deletedUser.last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>Email:</b></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${deletedUser.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><b>Fecha de eliminación:</b></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
              <hr style="border: 0; height: 1px; background: #ddd;">
              <p style="color: #777;">Si esto fue un error o tienes alguna duda, por favor contáctanos.</p>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 0 0 10px 10px;">
              <p style="margin: 0; font-size: 14px; color: #555;">📩 EventosIA | Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      };
      

    await transporter.sendMail(mailOptions);

    res.status(200).json({ mensaje: 'Usuario eliminado y correo de confirmación enviado.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la eliminación del usuario.' });
  }
};
