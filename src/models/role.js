import pool from '../config/bd.js';

// Obtener todos los roles
export const getRoles = async () => {
  const result = await pool.query('SELECT * FROM roles ORDER BY id_role ASC');
  return result.rows;
};

// Obtener un rol por ID
export const getRoleById = async (id_role) => {
  const result = await pool.query('SELECT * FROM roles WHERE id_role = $1', [id_role]);
  return result.rows[0];
};

// Crear un nuevo rol
export const createRole = async (role_name, description) => {
  const result = await pool.query(
    'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
    [role_name, description]
  );
  return result.rows[0];
};

// Editar un rol
export const updateRole = async (id_role, role_name, description) => {
  const result = await pool.query(
    'UPDATE roles SET name = $1, description = $2 WHERE id_role = $3 RETURNING *',
    [role_name, description, id_role]
  );
  return result.rows[0];
};

// Eliminar un rol
export const deleteRole = async (id_role) => {
  const result = await pool.query('DELETE FROM roles WHERE id_role = $1 RETURNING *', [id_role]);
  return result.rows[0];
};

// Obtener permisos de un rol
export const getRolePermissions = async (id_role) => {
  const result = await pool.query(
    `SELECT p.* FROM permissions p
     JOIN role_permissions rp ON p.id_permission = rp.permission_id
     WHERE rp.role_id = $1`,
    [id_role]
  );
  return result.rows;
};

// Asignar permisos a un rol
export const assignPermissionsToRole = async (id_role, permissions) => {
  const values = permissions.map((perm_id) => `(${id_role}, ${perm_id})`).join(", ");
  await pool.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
};

// Eliminar permisos de un rol
export const removePermissionsFromRole = async (id_role) => {
  await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id_role]);
};
