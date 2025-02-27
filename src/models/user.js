import pool from '../config/bd.js';

// Obtener todos los usuarios
export const getUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id_user ASC');
  return result.rows;
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const {
    name,
    last_name,
    email,
    email_verified = false,
    password,
    id_role,
  } = userData;

  const result = await pool.query(
    `INSERT INTO users (name, last_name, email, email_verified, password, id_role, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [name, last_name, email, email_verified, password, id_role]
  );

  return result.rows[0];
};

// Marcar email como verificado
export const verifyEmail = async (email) => {
    const result = await pool.query(
      'UPDATE users SET email_verified = true WHERE email = $1 RETURNING *',
      [email]
    );
    return result.rows[0];
};

// Verificar si el email ya existe (para validaciones o login)
export const getUserWithPassword = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id_user, name, last_name, email, id_role FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // Retorna el usuario encontrado o undefined
};

// Actualizar rol de usuario
export const updateUserRole = async (id_user, newRoleId) => {
  const result = await pool.query(
    'UPDATE users SET id_role = $1 WHERE id_user = $2 RETURNING *',
    [newRoleId, id_user]
  );
  return result.rows[0]; // Retorna el usuario actualizado o undefined
};