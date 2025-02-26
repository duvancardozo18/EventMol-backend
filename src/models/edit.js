import pool from '../config/bd.js';

// 🔹 Función para buscar usuario por email antes de editarlo
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

//actualizar los datos del usuario
export const updateUser = async (email, userData) => {
    if (Object.keys(userData).length === 0) {
      throw new Error('No se enviaron datos para actualizar');
    }
  
    const fields = Object.keys(userData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(userData);
  
    const result = await pool.query(
      `UPDATE users SET ${fields} WHERE email = $${values.length + 1} RETURNING *`,
      [...values, email]
    );
  
    return result.rows[0];
  };
  