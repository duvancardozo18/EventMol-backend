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
    `INSERT INTO users (name, last_name, email, password, id_role, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [name, last_name, email, password, id_role]
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

// Obtener usuario por email con todos los campos
export const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // Retorna el usuario encontrado o undefined
};

// Verificar si el email ya existe antes de editar
export const getUserByEmailEdit = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Actualizar datos del usuario 
export const updateUser = async (email, userData) => {
  // Filtrar campos `undefined` o `null`
  const validFields = Object.entries(userData).filter(([_, value]) => value !== undefined && value !== null);

  if (validFields.length === 0) {
    throw new Error('No se enviaron datos válidos para actualizar');
  }

  // Construcción dinámica de la consulta
  const fields = validFields.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = validFields.map(([_, value]) => value);

  const result = await pool.query(
    `UPDATE users SET ${fields} WHERE email = $${values.length + 1} RETURNING *`,
    [...values, email]
  );

  return result.rows[0];
};

// Actualizar rol de usuario
export const updateUserRole = async (id_user, newRoleId) => {
  const result = await pool.query(
    'UPDATE users SET id_role = $1 WHERE id_user = $2 RETURNING *',
    [newRoleId, id_user]
  );
  return result.rows[0]; // Retorna el usuario actualizado o undefined
};


// //buscar usuario por email para eliminarlo
// export const getUserByEmail = async (email) => {
//   const result = await pool.query(
//     'SELECT * FROM users WHERE email = $1',
//     [email]
//   );
//   return result.rows[0];
// };

//eliminar usuario por email
export const deleteUserByEmail = async (email) => {
  const result = await pool.query(
    'DELETE FROM users WHERE email = $1 RETURNING *',
    [email]
  );
  return result.rows[0]; // Retorna el usuario eliminado
};