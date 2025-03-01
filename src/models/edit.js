import pool from '../config/bd.js';

//Función para buscar usuario por email antes de editarlo
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

//Actualizar datos del usuario sin sobrescribir con `null`
export const updateUser = async (email, userData) => {
  // Filtrar campos `undefined` o `null`
  const validFields = Object.entries(userData).filter(([_, value]) => value !== undefined && value !== null);

  if (validFields.length === 0) {
    throw new Error('No se enviaron datos válidos para actualizar');
  }

  //Construcción dinámica de la consulta
  const fields = validFields.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = validFields.map(([_, value]) => value);

  const result = await pool.query(
    `UPDATE users SET ${fields} WHERE email = $${values.length + 1} RETURNING *`,
    [...values, email]
  );

  return result.rows[0];
};
