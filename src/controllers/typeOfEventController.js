import * as TypeOfEventModel from '../models/typeOfEvent.js';

// Obtener todos los tipos de eventos
export const getTypesOfEvent = async (req, res) => {
  try {
    const types = await TypeOfEventModel.getAllTypesOfEvent();
    res.status(200).json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los tipos de eventos' });
  }
};

// Obtener un tipo de evento por ID
export const getTypeOfEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await TypeOfEventModel.getTypeOfEventById(id);
    if (!type) {
      return res.status(404).json({ error: 'Tipo de evento no encontrado' });
    }
    res.status(200).json(type);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el tipo de evento' });
  }
};

// Crear un nuevo tipo de evento
export const createTypeOfEvent = async (req, res) => {
  try {
    const { event_type, description, start_time, end_time, max_participants, video_conference_link, price } = req.body;
    const newType = await TypeOfEventModel.createTypeOfEvent(event_type, description, start_time, end_time, max_participants, video_conference_link, price);
    res.status(201).json(newType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el tipo de evento' });
  }
};

// Actualizar un tipo de evento
export const updateTypeOfEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_type, description, start_time, end_time, max_participants, video_conference_link, price } = req.body;

    const updatedType = await TypeOfEventModel.updateTypeOfEvent(id, event_type, description, start_time, end_time, max_participants, video_conference_link, price);

    if (!updatedType) {
      return res.status(404).json({ error: 'Tipo de evento no encontrado' });
    }

    res.status(200).json(updatedType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el tipo de evento' });
  }
};

// Eliminar un tipo de evento
export const deleteTypeOfEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedType = await TypeOfEventModel.deleteTypeOfEvent(id);

    if (!deletedType) {
      return res.status(404).json({ error: 'Tipo de evento no encontrado' });
    }

    res.status(200).json({ mensaje: 'Tipo de evento eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el tipo de evento' });
  }
};
