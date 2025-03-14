import pool from '../config/bd.js';
import bcrypt from 'bcryptjs';

// Generar y guardar token
export const savePasswordResetToken = async (email, token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`password_reset_${email}`, token);
  } else {
    console.warn("⚠️ No se puede acceder a localStorage en este entorno.");
  }
};

// Verificar si el email existe
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.id_user, u.name, u.last_name, u.email, u.email_verified, u.created_at,
            r.id_role, r.name AS role_name
     FROM users u
     LEFT JOIN user_role ur ON u.id_user = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id_role
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
};

// Validar token de recuperación desde localStorage
export const validatePasswordResetToken = (email, token) => {
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(`password_reset_${email}`);
    return storedToken === token;
  }
  console.warn("⚠️ No se puede acceder a localStorage en este entorno.");
  return false;
};

// Actualizar contraseña después de verificación
export const updatePassword = async (email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2 RETURNING *`,
    [hashedPassword, email]
  );

  // Eliminar token de localStorage después de cambiar la contraseña
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`password_reset_${email}`);
  }

  return result.rows[0];
};
