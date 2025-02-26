import pool from '../config/bd.js';

//buscar usuario por email para eliminarlo
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

//eliminar usuario por email
export const deleteUserByEmail = async (email) => {
  const result = await pool.query(
    'DELETE FROM users WHERE email = $1 RETURNING *',
    [email]
  );
  return result.rows[0]; // Retorna el usuario eliminado
};
