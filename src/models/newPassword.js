import pool from '../config/bd.js';
import bcrypt from 'bcryptjs';

// se guarda token de recuperación de contraseña usando bycript 
export const savePasswordResetToken = async (email, token) => {
  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2 RETURNING *`,
    [token, email]
  );
  return result.rows[0];
};

// Actualizar contraseña después de verificación
export const updatePassword = async (email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2 RETURNING *`,
    [hashedPassword, email]
  );
  return result.rows[0];
};
