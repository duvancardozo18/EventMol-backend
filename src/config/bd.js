import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';


dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// verificar conexión para no ponernos nerviosos
async function verifyConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión exitosa con PostgreSQL.');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
  }
}

verifyConnection(); // Llamada inmediata para testear la conexión

export default pool;

