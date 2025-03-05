import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import locationRoutes from './src/routes/locationRoutes.js';

// 1. Cargar variables de entorno
dotenv.config();

// 2. Inicializaciones
const app = express();
const PORT = process.env.PORT || 7777;

// 3. Configuración de CORS (permite solo el frontend en http://localhost:5173)
const corsOptions = {
  origin: ['http://localhost:5173'], // Cambiar esto si el frontend está en otro puerto
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 4. Middlewares generales
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para datos del formulario
app.use(morgan('dev')); // Logger HTTP para desarrollo

// 5. Importar y usar rutas
app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', locationRoutes);

// 6. Ruta inicial para verificar el servidor
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

// 7. Manejo de errores para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada ❌' });
});

// 8. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en → http://localhost:${PORT}`);
});
