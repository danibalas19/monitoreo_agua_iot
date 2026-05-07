// src/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
  port: process.env.DB_PORT || 38328,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'zTJTeoFZBQtULGknHuxJnSuhjPAaYyLw',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de conexión
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado a Railway');
    conn.release();
  } catch (err) {
    console.error('❌ Error DB:', err.message);
  }
})();
 
export default pool;