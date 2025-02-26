import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from '../config/bd.js';
import bcrypt from 'bcryptjs';
import * as PasswordModel from '../models/newPassword.js';
import * as UserModel from '../models/user.js';
import transporter from '../config/emailConfig.js';

// se solicita la recuperación de contraseña, se deve enviar un email. 
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
    }


    //verificar que el usuario este email_verified
    

    // Generar un token temporal
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Guarda el token temporalmente en la base de datos
    await PasswordModel.savePasswordResetToken(email, resetToken);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    //endpoint de recuperacion
    const resetURL = `http://localhost:7777/reset-password/${resetToken}`;
    

    //despues crear esta funcion en un archivo aparte, acordarme !!!!!!
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔒 Recuperación de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2 style="color: #333;">🔒 Recuperación de Contraseña</h2>
            <p>Hola, has solicitado restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente botón para continuar:</p>
            <a href="${resetURL}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              🔗 Restablecer Contraseña
            </a>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            <br>
            <p style="font-size: 12px; color: #777;">Este enlace expirará en 15 minutos.</p>
          </div>
        `,
      };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ mensaje: 'Correo de recuperación enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al solicitar recuperación de contraseña.' });
  }
};

const getUserByToken = async (token) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE password = $1', // Asumiendo que el token está en la columna "password"
      [token]
    );
    return result.rows[0];
  };
  

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuario con el token de recuperación (en este caso lo almacenamos en "password")
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, user.email]
    );

    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
};

