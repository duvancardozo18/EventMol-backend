import express from 'express';
import db from '../config/bd.js';

const router = express.Router();

// Crear notificación
router.post('/notifications', async (req, res) => {
  const { user_id, message } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO notifications (user_id, message)
      VALUES ($1, $2)
      RETURNING *
    `, [user_id, message]);

    return res.status(201).json({
      message: 'Notificación creada',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error al crear la notificación' });
  }
});

// Obtener notificaciones de un usuario
router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron notificaciones' });
    }

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

// Actualizar estado de lectura de una notificación
router.put('/notifications/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const result = await db.query(`
      UPDATE notifications
      SET read_status = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id_notification = $1
      RETURNING *
    `, [notificationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    return res.json({
      message: 'Notificación actualizada',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar la notificación:', error);
    res.status(500).json({ message: 'Error al actualizar la notificación' });
  }
});

// Eliminar notificación
router.delete('/notifications/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const result = await db.query(`
      DELETE FROM notifications
      WHERE id_notification = $1
      RETURNING *
    `, [notificationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    return res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar la notificación:', error);
    res.status(500).json({ message: 'Error al eliminar la notificación' });
  }
});

export default router;
