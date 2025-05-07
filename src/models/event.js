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


// Obtener un evento por ID, validando que pertenece al usuario autenticado
export const getEventByIdForUser = async (user_id) => {
  const result = await pool.query(`
    -- Eventos donde el usuario es creador
    SELECT 
      e.id_event,
      e.name AS name,
      e.image_url,
      'gestor' AS user_role,
      es.id_event_state,
      es.state_name AS state,
      t.id_type_of_event,
      t.event_type,
      t.description AS event_type_description,
      t.start_time,
      t.end_time,
      t.max_participants::text, -- Convertir a texto para el UNION
      t.video_conference_link,
      t.price AS event_price,
      c.id_category,
      c.name AS category_name,
      l.id_location,
      l.name AS location,
      l.description AS location_description,
      l.price AS location_price,
      l.address AS location_address,
      u.id_user AS user_id_created_by,
      u.name AS user_name,
      u.last_name AS user_last_name,
      NULL::integer AS participant_status_id, -- Especificar tipo explícito
      NULL::integer AS billing_id -- Especificar tipo explícito
    FROM events e
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
    LEFT JOIN users u ON e.user_id_created_by = u.id_user
    LEFT JOIN categories c ON t.category_id = c.id_category
    WHERE e.user_id_created_by = $1
    
    UNION
    
    -- Eventos donde el usuario es participante
    SELECT 
      e.id_event,
      e.name AS event_name,
      e.image_url,
      'participante' AS user_role,
      es.id_event_state,
      es.state_name AS state,
      t.id_type_of_event,
      t.event_type,
      t.description AS event_type_description,
      t.start_time,
      t.end_time,
      t.max_participants::text, -- Convertir a texto para el UNION
      t.video_conference_link,
      t.price AS event_price,
      c.id_category,
      c.name AS category_name,
      l.id_location,
      l.name AS location_name,
      l.description AS location_description,
      l.price AS location_price,
      l.address AS location_address,
      u.id_user AS user_id_created_by,
      u.name AS user_name,
      u.last_name AS user_last_name,
      p.participant_status_id,
      NULL::integer AS billing_id -- Especificar tipo explícito
    FROM participants p
    JOIN events e ON p.event_id = e.id_event
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
    LEFT JOIN users u ON e.user_id_created_by = u.id_user
    LEFT JOIN categories c ON t.category_id = c.id_category
    WHERE p.user_id = $1
    
    UNION
    
    -- Eventos donde el usuario es cliente (en tabla billing)
    SELECT 
      e.id_event,
      e.name AS event_name,
      e.image_url,
      'cliente' AS user_role,
      es.id_event_state,
      es.state_name AS state,
      t.id_type_of_event,
      t.event_type,
      t.description AS event_type_description,
      t.start_time,
      t.end_time,
      t.max_participants::text, -- Convertir a texto para el UNION
      t.video_conference_link,
      t.price AS event_price,
      c.id_category,
      c.name AS category_name,
      l.id_location,
      l.name AS location_name,
      l.description AS location_description,
      l.price AS location_price,
      l.address AS location_address,
      u.id_user AS user_id_created_by,
      u.name AS user_name,
      u.last_name AS user_last_name,
      NULL::integer AS participant_status_id, -- Especificar tipo explícito
      b.id_billing
    FROM billing b
    JOIN events e ON b.event_id = e.id_event
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
    LEFT JOIN users u ON e.user_id_created_by = u.id_user
    LEFT JOIN categories c ON t.category_id = c.id_category
    WHERE b.user_id = $1
    
    ORDER BY id_event DESC
  `, [user_id]);

  return result.rows;
};


// Obtener un evento por ID con detalles completos del tipo de evento y precios
export const getPriceEventById = async (id_event) => {
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
     

      -- Datos de la categoría
      c.id_category,
      c.name AS category_name,

      -- Datos de la ubicación
      l.id_location,
      l.name AS location_name,
      l.description AS location_description,
      l.address AS location_address,

      -- Datos del usuario creador
      u.id_user AS user_id_created_by,
      u.name AS user_name,
      u.last_name AS user_last_name,

      -- Datos de la logística
       t.price AS logistics_price,

      -- Datos de alquiler
       l.price AS location_rent,

      -- Total alimentos (price * quantity_available)
      COALESCE(SUM(DISTINCT f.price * f.quantity_available), 0) AS food_total,

      -- Total recursos (price * quantity_available)
      COALESCE(SUM(DISTINCT r.price * r.quantity_available), 0) AS resources_total,

      -- Valor total (logística + alquiler + comida + recursos)
      (
        COALESCE(t.price, 0) +
        COALESCE(l.price, 0) +
        COALESCE(SUM(DISTINCT f.price * f.quantity_available), 0) +
        COALESCE(SUM(DISTINCT r.price * r.quantity_available), 0)
      ) AS total_value

    FROM events e
    JOIN event_state es ON e.event_state_id = es.id_event_state
    LEFT JOIN type_of_event t ON e.type_of_event_id = t.id_type_of_event
    LEFT JOIN location l ON e.location_id = l.id_location
    LEFT JOIN users u ON e.user_id_created_by = u.id_user
    LEFT JOIN categories c ON t.category_id = c.id_category

    -- Alimentos
    LEFT JOIN event_food ef ON ef.id_event = e.id_event
    LEFT JOIN food f ON f.id_food = ef.id_food

    -- Recursos
    LEFT JOIN event_resources er ON er.id_event = e.id_event
    LEFT JOIN resources r ON r.id_resource = er.id_resource

    WHERE e.id_event = $1

    GROUP BY 
      e.id_event, es.id_event_state, t.id_type_of_event, 
      c.id_category, l.id_location, u.id_user
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

//contador
export const updateEventState = async () => {
  const currentDate = new Date(); // Se obtiene la fecha y hora actual

  const result = await pool.query(`
    -- Actualiza el estado de los eventos según la fecha actual y las fechas del tipo de evento
    UPDATE events
    SET event_state_id = 
      CASE
        -- Si la fecha de inicio del tipo de evento es posterior a la actual, el evento está planeado
        WHEN toe.start_time > $1 THEN (
          SELECT id_event_state FROM event_state WHERE state_name = 'Planeado'
        )
        
        -- Si la fecha actual está entre la fecha de inicio y final del tipo de evento, el evento está en curso
        WHEN toe.start_time <= $1 AND toe.end_time >= $1 THEN (
          SELECT id_event_state FROM event_state WHERE state_name = 'En curso'
        )

        -- Si la fecha de finalización del tipo de evento ya pasó, el evento está completado
        WHEN toe.end_time < $1 THEN (
          SELECT id_event_state FROM event_state WHERE state_name = 'Completado'
        )
      END
    -- Se hace JOIN con la tabla type_of_event para acceder a start_time y end_time
    FROM type_of_event toe
    WHERE events.type_of_event_id = toe.id_type_of_event
      -- Se actualizan todos los eventos (con estado nulo o no), puedes ajustar esta condición si lo deseas
      AND (event_state_id IS NULL OR event_state_id IS NOT NULL);
  `, [currentDate]);

  return result.rowCount; // Devuelve la cantidad de filas afectadas
};

