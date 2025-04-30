import express from 'express';
import db from '../config/bd.js'; // Asegúrate que tu conexión a la base de datos esté correcta
import { sendBillingEmail } from '../helpers/billingMailHelper.js';

const router = express.Router();

// Ruta GET /billing/:eventId
router.get('/billing/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const eventData = await db.query(`
      SELECT 
        e.id_event,
        u.name AS user_name,
        u.last_name,
        u.email,
        toe.price AS logistics_price,
        l.price AS location_price,
        b.state
      FROM events e
      JOIN users u ON u.id_user = e.user_id_created_by
      LEFT JOIN type_of_event toe ON toe.id_type_of_event = e.type_of_event_id
      LEFT JOIN location l ON l.id_location = e.location_id
      LEFT JOIN billing b ON b.event_id = e.id_event
      WHERE e.id_event = $1
    `, [eventId]);

    if (eventData.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const event = eventData.rows[0];

    // Calcular alimentación (multiplicando por cantidad disponible)
    const foodRes = await db.query(`
      SELECT f.price, f.quantity_available
      FROM food f
      JOIN event_food ef ON ef.id_food = f.id_food
      WHERE ef.id_event = $1
    `, [eventId]);

    const foodTotal = foodRes.rows.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity_available), 0);

    // Calcular recursos (multiplicando por cantidad disponible)
    const resourceRes = await db.query(`
      SELECT r.price, r.quantity_available
      FROM resources r
      JOIN event_resources er ON er.id_resource = r.id_resource
      WHERE er.id_event = $1
    `, [eventId]);

    const resourcesTotal = resourceRes.rows.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity_available), 0);

    // Calcular totales
    const logistics = Number(event.logistics_price || 0);
    const location = Number(event.location_price || 0);
    const food = Number(foodTotal);
    const resources = Number(resourcesTotal);
    const total = logistics + location + food + resources;

    return res.json({
      cliente: {
        nombre: `${event.user_name} ${event.last_name}`,
        correo: event.email
      },
      estado: event.state || 'Sin cotización',
      costos: {
        logistica: logistics,
        alquiler_sitio: location,
        alimentacion: food,
        recursos: resources,
        total
      }
    });

  } catch (error) {
    console.error('Error al obtener la cotización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta POST /billing
router.post('/billing', async (req, res) => {
  const { event_id, payment_method } = req.body;

  try {
    // Obtener datos del evento y usuario
    const eventQuery = await db.query(`
      SELECT 
        e.user_id_created_by AS user_id,
        u.name,
        u.last_name,
        u.email,
        toe.price AS logistics_price,
        l.price AS location_price
      FROM events e
      JOIN users u ON u.id_user = e.user_id_created_by
      LEFT JOIN type_of_event toe ON toe.id_type_of_event = e.type_of_event_id
      LEFT JOIN location l ON l.id_location = e.location_id
      WHERE e.id_event = $1
    `, [event_id]);

    if (eventQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const event = eventQuery.rows[0];

    // Calcular alimentación (multiplicando por cantidad disponible)
    const foodQuery = await db.query(`
      SELECT f.price, f.quantity_available
      FROM food f
      JOIN event_food ef ON ef.id_food = f.id_food
      WHERE ef.id_event = $1
    `, [event_id]);

    const foodTotal = foodQuery.rows.reduce((sum, f) => sum + Number(f.price) * Number(f.quantity_available), 0);

    // Calcular recursos (multiplicando por cantidad disponible)
    const resourcesQuery = await db.query(`
      SELECT r.price, r.quantity_available
      FROM resources r
      JOIN event_resources er ON er.id_resource = r.id_resource
      WHERE er.id_event = $1
    `, [event_id]);

    const resourcesTotal = resourcesQuery.rows.reduce((sum, r) => sum + Number(r.price) * Number(r.quantity_available), 0);

    // Calcular totales
    const logistics = Number(event.logistics_price || 0);
    const location = Number(event.location_price || 0);
    const food = foodTotal;
    const resources = resourcesTotal;
    const total = logistics + location + food + resources;

    // Insertar en la tabla billing y obtener el billingId
    const insert = await db.query(`
      INSERT INTO billing (user_id, event_id, price, state, payment_method)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_billing, user_id, event_id, price, state, payment_method
    `, [event.user_id, event_id, total, 'Enviado', payment_method]);

    // Obtener el billingId de la respuesta de la consulta
    const billingId = insert.rows[0].id_billing;

    if (!billingId) {
      return res.status(500).json({ message: 'Error al obtener el billingId' });
    }

    // Enviar correo al cliente con la cotización y el billingId
    await sendBillingEmail(event.email, `${event.name} ${event.last_name}`, {
      logistica: logistics,
      alquiler_sitio: location,
      alimentacion: food,
      recursos: resources,
      total
    }, billingId);  // Pasar el billingId al correo

    return res.status(201).json({
      message: 'Factura creada y correo enviado',
      billing: insert.rows[0]
    });

  } catch (err) {
    console.error('Error al crear factura:', err);
    res.status(500).json({ message: 'Error al crear la factura' });
  }
});


// Ruta para aceptar la cotización
router.get('/billing/accept/:billingId', async (req, res) => {
  const { billingId } = req.params;

  if (!billingId) {
    return res.status(400).json({ message: 'ID de la factura no proporcionado' });
  }

  try {
    const result = await db.query(`
      UPDATE billing
      SET state = 'Aceptado'
      WHERE id_billing = $1
      RETURNING *
    `, [billingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    return res.json({
      message: 'Cotización aceptada',
      billing: result.rows[0]
    });

  } catch (error) {
    console.error('Error al aceptar la cotización:', error);
    res.status(500).json({ message: 'Error al aceptar la cotización' });
  }
});

// Ruta para rechazar la cotización
router.get('/billing/reject/:billingId', async (req, res) => {
  const { billingId } = req.params;

  if (!billingId) {
    return res.status(400).json({ message: 'ID de la factura no proporcionado' });
  }

  try {
    const result = await db.query(`
      UPDATE billing
      SET state = 'Rechazado'
      WHERE id_billing = $1
      RETURNING *
    `, [billingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    return res.json({
      message: 'Cotización rechazada',
      billing: result.rows[0]
    });

  } catch (error) {
    console.error('Error al rechazar la cotización:', error);
    res.status(500).json({ message: 'Error al rechazar la cotización' });
  }
});

export default router;
