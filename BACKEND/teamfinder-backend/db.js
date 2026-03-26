const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

pool.on('error', (err, client) => {
  console.error('CRITICAL: Database pool error:', err.message);
});

const connectDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (err) {
    console.error('FATAL: Database connection failed on startup:', err.message);
  }
};

connectDb();

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  }
};
