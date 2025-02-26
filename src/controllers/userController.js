import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/user.js';

// Obtener users
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener users' });
  }
};

// Crear usuario
export const createUser = async (req, res) => {
  try {
    const { email, password, ...restData } = req.body;

    // Validar si ya existe el usuario
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con contraseña encriptada
    const newUser = await UserModel.createUser({
      email,
      password: hashedPassword,
      ...restData,
    });

    // Genera token JWT usando email del nuevo usuario
    const token = jwt.sign(
        { email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Expira en 1 día
    );

    // Por ahora, imprime el token en la consola
    console.log(`🔑 Token de verificación: ${token}`);

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al crear usuario' });
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
    const user = await UserModel.getUserByEmail(email);
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
