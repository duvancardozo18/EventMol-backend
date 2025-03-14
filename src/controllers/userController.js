import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/user.js';
import transporter from '../config/emailConfig.js';
import { mailOptions } from '../helpers/deleteMailHelper.js';

// Obtener usuarios con sus roles
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Crear usuario y asignar rol en `user_role`
export const createUser = async (req, res) => {
  try {
    const { email, password, id_role, ...restData } = req.body;

    // Validar si el usuario ya existe
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Generar token JWT con el email del usuario
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Construir el enlace de verificación con el token
    const verificationURL = `http://localhost:5173/verifyAccount/${token}`;

    // Configurar correo de verificación
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de Cuenta EventosIA ✔',
      html: `<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
             <a href="${verificationURL}">Verificar mi Cuenta</a>`,
    };

    // Enviar email de verificación antes de registrar usuario
    await transporter.sendMail(mailOptions);

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y asignarle rol en `user_role`
    const newUser = await UserModel.createUser({
      email,
      password: hashedPassword,
      id_role,
      ...restData,
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente. Se envió un correo de verificación.',
      usuario: newUser,
    });

  } catch (error) {
    console.error('Error en la función createUser:', error);
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

// Inicio de sesión con `user_role`
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await UserModel.getUserWithPassword(email);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Validar contraseña
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
        role: user.role_name, // Ahora incluye el nombre del rol
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

// Actualizar rol de usuario en `user_role`
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { newRoleId } = req.body;
  const { id_role } = req.user; // Se asume que este dato viene del token JWT

  try {
    // Solo los SuperAdmin (id_role = 1) pueden cambiar roles
    if (id_role !== 1) {
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

// Eliminar usuario y su relación en `user_role`
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body; 

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido para eliminar el usuario.' });
    }

    // Verificar si el usuario existe
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
    }

    // Eliminar el usuario y su rol en `user_role`
    const deletedUser = await UserModel.deleteUserByEmail(email);
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

// editar Usuarios 
export const editUser = async (req, res) => {
  try {
    const { email, name, last_name } = req.body;

    // Verificar si el usuario existe
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
    }

    // Verificar que el usuario tenga el email verificado
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Debes verificar tu email primero.' });
    }

    // Actualizar usuario
    const updatedUser = await UserModel.updateUser(email, { name, last_name });

    res.status(200).json({
      mensaje: 'Usuario actualizado exitosamente.',
      usuario: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la actualización del usuario.' });
  }
};
