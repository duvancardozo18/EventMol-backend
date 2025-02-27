import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/user.js';
import transporter from '../config/emailConfig.js';

// Obtener users
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener users' });
  }
};

//Crear usuarios
export const createUser = async (req, res) => {
  try {
    const { email, password, ...restData } = req.body;

    // Validar si el usuario ya existe
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Generar token JWT con el email del usuario
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Expira en 1 día
    );

    // Construir el enlace de verificación con el token
    const verificationURL = `http://localhost:3000/verify-account/${token}`;

    // Configurar correo de verificación
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de Cuenta EventosIA ✔',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
          <div style="max-width: 500px; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: auto;">
            
            <h2 style="color: #333;">🎉 ¡Bienvenido a nuestro sistema EventosIA! 🎉</h2>
            
            <p style="color: #555; font-size: 16px;">Estamos emocionados de tenerte con nosotros. Antes de comenzar, necesitamos verificar tu dirección de correo electrónico. 📨</p>
            
            <p style="color: #444; font-size: 16px; font-weight: bold;">Haz clic en el siguiente botón para verificar tu cuenta:</p>

            <a href="${verificationURL}" 
              style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; 
              font-size: 18px; border-radius: 5px; font-weight: bold; margin-top: 10px;">
              ✅ Verificar mi Cuenta
            </a>
            
            <p style="color: #555; font-size: 14px; margin-top: 20px;">Si no creaste esta cuenta, puedes ignorar este mensaje. 🚀</p>

            <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #777;">⚠️ Este enlace expirará en 24 horas. Asegúrate de verificar tu cuenta lo antes posible.</p>

            <p style="font-size: 12px; color: #777;">📩 Si tienes algún problema, contáctanos en <strong>eventosia854@gmail.com</strong></p>
          </div>
        </div>
      `,

    };

    // Intentar enviar el email antes de crear el usuario en la base de datos
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ error: 'Error al enviar el email de verificación. No se registró el usuario.' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con contraseña encriptada (solo si el email se envió correctamente)
    const newUser = await UserModel.createUser({
      email,
      password: hashedPassword,
      ...restData,
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente. Se envió un correo de verificación.',
      usuario: newUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario.' });
  }
};


// Verificar email del usuario mediante token JWT
export const verifyEmail = async (req, res) => {
    const { token } = req.params;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;
  
      await UserModel.verifyEmail(email);
  
      res.status(200).json({ mensaje: 'Email verificado exitosamente.' });
    } catch (error) {
      res.status(400).json({ error: 'Token inválido o expirado.' });
    }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await UserModel.getUserWithPassword(email);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Verificar email verificado
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Debes verificar tu email primero.' });
    }

    // Validar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Generar token JWT para sesión
    const token = jwt.sign(
      { id_user: user.id_user, email: user.email, id_role: user.id_role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id_user: user.id_user,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

// Obtener usuario por email
export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const usuario = await UserModel.getUserByEmail(email);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
};

export const updatedRolUser = async (req, res) => {
  const { id } = req.params;
  const { newRoleId } = req.body;
  const { id_role } = req.user; // Se asume que este dato viene del token JWT

  try {
    // Solo los usuarios con id_role = 4 (SuperAdmin) pueden cambiar roles
    if (id_role !== 4) {
      return res.status(403).json({ error: 'No tienes permisos para cambiar roles.' });
    }

    const usuarioActualizado = await UserModel.updateUserRole(id, newRoleId);

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      mensaje: 'Rol actualizado exitosamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario.' });
  }
};
