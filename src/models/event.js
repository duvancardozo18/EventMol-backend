import pool from '../config/bd.js';

// Obtener todos los eventos
export const getAllEvents = async () => {
  const result = await pool.query(`
    SELECT 
      e.id_event, 
      e.name, 
      es.state_name AS state, 
      t.event_type, 
      t.id_type_of_event AS type_of_event_id,
      t.start_time,
      t.end_time,
      t.max_participants,
      t.video_conference_link,
      l.name AS location, 
      e.user_id_created_by, 
      e.image_url
    FROM events e
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
  `);
  return result.rows;
};

// Obtener un evento por ID con detalles completos del tipo de evento
export const getEventById = async (id_event) => {
  const result = await pool.query(`
    SELECT 
      e.id_event,
      e.name AS event_name,
      e.image_url,

      -- Estado del evento
      es.id_event_state,
      es.state_name AS state,

      -- Datos del tipo de evento
      t.id_type_of_event,
      t.event_type,
      t.description AS event_type_description,
      t.start_time,
      t.end_time,
      t.max_participants,
      t.video_conference_link,
      t.price AS event_price,

      -- Datos de la categoría
      c.id_category,
      c.name AS category_name,

      -- Datos de la ubicación
      l.id_location,
      l.name AS location_name,
      l.description AS location_description,
      l.price AS location_price,
      l.address AS location_address,

      -- Datos del usuario creador
      u.id_user AS user_id_created_by,
      u.name AS user_name,
      u.last_name AS user_last_name

    FROM events e
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
    LEFT JOIN users u ON e.user_id_created_by = u.id_user
    LEFT JOIN categories c ON t.category_id = c.id_category
    WHERE e.id_event = $1
  `, [id_event]);

  return result.rows[0];
};





// Crear un nuevo evento
export const createEvent = async (name, event_state_id, user_id_created_by, image_url, location_id,type_of_event_id) => {
  const result = await pool.query(`
    INSERT INTO events (name, event_state_id, user_id_created_by, image_url, location_id, type_of_event_id)
    VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *
  `, [name, event_state_id, user_id_created_by, image_url,location_id,type_of_event_id]);
  return result.rows[0];
};

// Actualizar un evento (No se debe modificar user_id_created_by)
export const updateEvent = async (id_event, name, event_state_id, type_of_event_id, location_id, image_url) => {
  const result = await pool.query(`
    UPDATE events 
    SET name = $1, event_state_id = $2, type_of_event_id = $3, location_id = $4, image_url = $5
    WHERE id_event = $6 RETURNING *
  `, [name, event_state_id, type_of_event_id, location_id, image_url, id_event]);

  return result.rows[0];
};


// Actualizar solo el estado del evento (event_state_id)
export const updateEventStatus = async (id_event, event_state_id) => {
  const result = await pool.query(`
    UPDATE events
    SET event_state_id = $1
    WHERE id_event = $2
    RETURNING *
  `, [event_state_id, id_event]);

  return result.rows[0];
};


// Eliminar un evento
export const deleteEvent = async (id_event) => {
  const result = await pool.query(`DELETE FROM events WHERE id_event = $1 RETURNING *`, [id_event]);
  return result.rows[0];
};
