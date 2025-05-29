const db = require('../config/db');

// Create a new agent
const createAgent = async (userid, username, email, phone, hashedPassword) => {
  const result = await db.query(
    'INSERT INTO agents (user_id, username, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userid, username, email, phone, hashedPassword]
  );
  return result.rows[0];
};

// Find agent by email
const findAgentByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM agents WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Find agent by ID
const findAgentById = async (id) => {
  const result = await db.query(
    'SELECT id, user_id, username, email, phone FROM agents WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const findAgentByUserId = async (userId) => {
  const result = await db.query(
    'SELECT * FROM agents WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
};

const getAllAgents = async () => {
  const result = await db.query(
    'SELECT id, user_id, username, email, phone FROM agents'
  );
  return result.rows;
};

module.exports = {
  createAgent,
  findAgentByEmail,
  findAgentById,
  findAgentByUserId,
  getAllAgents
};
