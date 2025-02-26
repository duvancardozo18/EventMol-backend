import { getUserByEmail, updateUser } from '../models/edit.js';

// 🔹 Función para editar los datos del usuario
export const editUser = async (req, res) => {
  try {
    const { email, name, last_name, id_role } = req.body;

    // Verificar si el usuario existe
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No se encontró un usuario con ese email.' });
    }

    // Actualizar los datos del usuario
    const updatedUser = await updateUser(email, { name, last_name, id_role });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Error al actualizar los datos del usuario.' });
    }

    res.status(200).json({
      mensaje: 'Usuario actualizado exitosamente.',
      usuario: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la actualización del usuario.' });
  }
};
