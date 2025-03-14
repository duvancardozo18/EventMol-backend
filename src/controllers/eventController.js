import * as EventModel from '../models/event.js';

// Obtener todos los eventos
export const getEvents = async (req, res) => {
  try {
    const events = await EventModel.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los eventos' });
  }
};

// Obtener un evento por ID
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await EventModel.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el evento' });
  }
};

// Crear un nuevo evento
export const createEvent = async (req, res) => {
  try {
    const { name, event_state_id, type_of_event_id, location_id, user_id_created_by } = req.body;

    // Verificar que `user_id_created_by` está presente
    if (!user_id_created_by) {
      return res.status(400).json({ error: 'El campo user_id_created_by es obligatorio' });
    }

    const newEvent = await EventModel.createEvent(name, event_state_id, type_of_event_id, location_id, user_id_created_by);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el evento' });
  }
};

// Actualizar un evento
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, event_state_id, type_of_event_id, location_id } = req.body;

    const updatedEvent = await EventModel.updateEvent(id, name, event_state_id, type_of_event_id, location_id);

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
};

// Eliminar un evento
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await EventModel.deleteEvent(id);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.status(200).json({ mensaje: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el evento' });
  }
};
