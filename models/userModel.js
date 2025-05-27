// models/userModel.js
const db = require('../config/db'); // Make sure this path is correct

const createUser = async (username, email, phone, hashedPassword, is_agent = false) => {
  const result = await db.query(
    'INSERT INTO users (username, email, phone, password, is_agent) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [username, email, phone, hashedPassword, is_agent]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await db.query(
    'SELECT id, username, email, phone, is_agent FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const findUserByPhone = async (phone) => {
  const result = await db.query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone
};
