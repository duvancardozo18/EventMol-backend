import pool from '../config/bd.js';

// Obtener todos los usuarios
export const getUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id_user ASC');
  return result.rows;
};

