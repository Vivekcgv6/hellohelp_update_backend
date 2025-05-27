const { Pool } = require('pg');
require('dotenv').config();

const isRender = process.env.DATABASE_URL.includes('.render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false, // Required for Render
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
