const db = require('../config/db');


// Create a new customer
const createCustomer = async (userid, username, email, phone, hashedPassword) => {
  const result = await db.query(
    'INSERT INTO customers (user_id, username, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userid, username, email, phone, hashedPassword]
  );
  return result.rows[0];
};

// Find customer by email
const findCustomerByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM customers WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Find customer by ID
const findCustomerById = async (id) => {
  const result = await db.query(
    'SELECT id, user_id, username, email, phone FROM customers WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const findCustomerByUserId = async (userId) => {
  const result = await db.query(
    'SELECT * FROM customers WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
};

const getAllCustomers = async () => { 
    const result = await db.query(
    'SELECT id, user_id, username, email, phone FROM customers'
  );
  return result.rows;
};

module.exports = {
  createCustomer,
  findCustomerByEmail,
  findCustomerByUserId,
  getAllCustomers
};
