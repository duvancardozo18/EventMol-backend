import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const sslRequired = process.env.SSL_REQUIRED === 'true'; // control por .env si quieres

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslRequired ? { rejectUnauthorized: false } : false,
});

// verificar conexión
async function verifyConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión exitosa con PostgreSQL.');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
  }
}

verifyConnection();

export default pool;
