const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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
    
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename  = 'users'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('Database already initialized');
    } else {
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schema);
      console.log('Schema created successfully');
    }
    
    client.release();
  } catch (err) {
    console.error('FATAL: Database connection failed on startup:', err.message);
    process.exit(1);
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
