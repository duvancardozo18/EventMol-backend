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

 
