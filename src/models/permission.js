import pool from '../config/bd.js';

// Obtener todos los permisos
export const getPermissions = async () => {
  const result = await pool.query('SELECT * FROM permissions ORDER BY id_permission ASC');
  return result.rows;
};

// Obtener permisos de un rol específico
export const getRolePermissions = async (role_id) => {
  const result = await pool.query(
    `SELECT p.* FROM permissions p
     JOIN role_permissions rp ON p.id_permission = rp.permission_id
     WHERE rp.role_id = $1`,
    [role_id]
  );
  return result.rows;
};

// Asignar permisos a un rol
export const assignPermissionsToRole = async (role_id, permissions) => {
  const values = permissions.map((perm_id) => `(${role_id}, ${perm_id})`).join(", ");
  await pool.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
};

// Eliminar todos los permisos de un rol
export const removePermissionsFromRole = async (role_id) => {
  await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [role_id]);
};
