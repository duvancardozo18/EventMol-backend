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

