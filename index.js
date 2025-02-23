import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';

// 1. Cargar variables de entorno
dotenv.config();

// 2. Inicializaciones
const app = express();
const PORT = process.env.PORT || 7777;

// 3. Middlewares (funciones intermedias)
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para datos del formulario
app.use(cors()); // Para permitir solicitudes entre distintos dominios
app.use(morgan('dev')); // Logger HTTP para desarrollo

// 4. Importar y usar rutas
app.use('/api', userRoutes);

// 5. Ruta inicial para verificar el servidor
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

// 6. Manejo de errores (opcional pero recomendado)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada ❌' });
});

// 7. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en → http://localhost:${PORT}`);
});
