import * as EventModel from '../models/event.js';
import multer from 'multer';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'; // Asegúrate de importar GetObjectCommand
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // Importar getSignedUrl
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

// Configuración de multer para almacenar el archivo temporalmente en la memoria del servidor
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración del cliente S3 para interactuar con Wasabi
const s3 = new S3({
  endpoint: 'https://s3.wasabisys.com',
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY,  // Usar variable de entorno para la clave de acceso
    secretAccessKey: process.env.WASABI_SECRET_KEY,  // Usar variable de entorno para la clave secreta
  },
  region: 'us-east-1',  // Región de Wasabi
});

// Subir archivo a Wasabi
const uploadToWasabi = async (file) => {
  const params = {
    Bucket: 'eventsia',  // Nombre de tu bucket en Wasabi
    Key: `event_images/${file.originalname}`,  // Nombre del archivo en el bucket
    Body: file.buffer,  // Contenido del archivo
    ContentType: file.mimetype,  // Tipo de contenido
    ACL: 'public-read',  // Hace la imagen accesible públicamente
  };

  console.log("Intentando subir el archivo a Wasabi con estos parámetros:", params); // Log para depuración

  try {
    // Subir el archivo a Wasabi
    await s3.putObject(params);  // Usamos putObject para subir archivos
    console.log('Archivo subido exitosamente');

    // Generar la URL firmada con un tiempo máximo de expiración (7 días)
    const signedUrlParams = {
      Bucket: params.Bucket,
      Key: params.Key,
      Expires: 604800,  // 7 días en segundos (604800 segundos)
    };

    // Crear el comando para obtener el objeto
    const command = new GetObjectCommand(signedUrlParams);

    // Generar la URL firmada
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 604800 });

    console.log('URL firmada:', signedUrl);
    return signedUrl;  // Retornar la URL firmada
  } catch (error) {
    console.error('Error al subir la imagen a Wasabi:', error); // Log de error
    throw new Error('Error al subir la imagen a Wasabi');
  }
};

// Middleware para manejar la subida de imagen
export const uploadImage = upload.single('image');  // Definir middleware para subida de imagen

// Crear un nuevo evento
export const createEvent = async (req, res) => {
  try {
    // Usar el middleware para manejar la subida de la imagen
    uploadImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Error al subir la imagen' });
      }

      const { name, event_state_id, type_of_event_id, location_id, user_id_created_by } = req.body;

      // Verificar que `user_id_created_by` está presente
      if (!user_id_created_by) {
        return res.status(400).json({ error: 'El campo user_id_created_by es obligatorio' });
      }

      // Subir la imagen a Wasabi y obtener la URL firmada
      const image_url = req.file ? await uploadToWasabi(req.file) : null;

      // Si estás usando un array, asegúrate de pasar la URL como un array
      const image_url_array = image_url ? `{${image_url}}` : null;

      // Crear el evento, incluyendo la URL de la imagen
      const newEvent = await EventModel.createEvent(name, event_state_id, type_of_event_id, location_id, user_id_created_by, image_url_array);
      res.status(201).json(newEvent);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el evento' });
  }
};

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

// Actualizar un evento
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, event_state_id, type_of_event_id, location_id } = req.body;

    let image_url = null;

    // Si el usuario sube una nueva imagen, la subimos a Wasabi
    if (req.file) {
      image_url = await uploadToWasabi(req.file);
    }

    // Actualizar el evento, incluyendo la URL de la imagen si fue proporcionada
    const updatedEvent = await EventModel.updateEvent(id, name, event_state_id, type_of_event_id, location_id, image_url);

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
