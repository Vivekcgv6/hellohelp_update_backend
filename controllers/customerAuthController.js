  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { createCustomer, findCustomerByEmail, findCustomerByUserId, getAllCustomers } = require('../models/customerModel');
  const { createUser, findUserByEmail, findUserByPhone } = require('../models/userModel');
  const { parsePhoneNumberFromString } = require('libphonenumber-js');
  
  // Registration function

  const SUPPORTED_REGIONS = ['US', 'CA', 'IN']; // Add more regions as needed

  exports.register = async (req, res) => {
    const { username, email, phone, password } = req.body;

    try {
      // Basic field validation
      if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Phone validation (support US, Canada, India)
      let validPhone = false;
      for (const region of SUPPORTED_REGIONS) {
        const parsed = parsePhoneNumberFromString(phone, region);
        if (parsed && parsed.isValid()) {
          validPhone = true;
          break;
        }
      }
      if (!validPhone) {
        return res.status(400).json({ error: 'Invalid phone number. Only US, Canada, and India numbers are accepted.' });
      }


      // Check if user already exists in users table
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered as user' });
      }

      // Check if phone already exists in users table
      const existingPhone = await findUserByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone number already registered as user' });
      }
      // Check if customer already exists in customers table
      const existingCustomer = await findCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(409).json({ error: 'Email already registered as customer' });
      }


      // Password hash and customer creation
      const hashed = await bcrypt.hash(password, 10);

      //Create user with is_customer = true
      const user = await createUser(username, email, phone, hashed, true);

      //Create customer and link to user
      const customer = await createCustomer(user.id, username, email, phone, hashed);

      res.status(201).json({
        message: 'customer registered successfully',
        customer: { id: customer.id, email: customer.email, phone: customer.phone },
      });

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  //Login_function

  exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const customer = await findCustomerByEmail(email);
      if (!customer) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, customer.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          userId: customer.user_id,
          username: customer.username,
          email: customer.email,
          phone: customer.phone,
          role: 'customer',
          

        }, 
        process.env.JWT_SECRET, { expiresIn: '1y' });
      res.json({ message: 'Login successful',
        token,
        customer: { 
          id: customer.id,
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  //customer_info_function

  exports.getCustomerInfo = async (req, res) => {
  // Extract userId from the JWT payload
  const userId = req.user.userId || req.user.id;
  try {
    if (!userId) {
      return res.status(400).json({ error: 'userId is not defined' });
    }
    const customer = await findCustomerByUserId(userId);
    if (!customer) return res.status(404).json({ error: 'customer not found' });

    res.json({
      id: customer.user_id,
      username: customer.username,
      email: customer.email,
      phone: customer.phone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//list all customers

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    if (!customers || customers.length === 0) {
      return res.status(404).json({ error: 'No customers found' });
    }
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
