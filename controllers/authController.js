const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserById, findUserByPhone, updatePassword } = require('../models/userModel');
const { createAgent, findAgentByEmail } = require('../models/agentModel');
const { findCustomerByEmail, createCustomer } = require('../models/customerModel');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

  // Registration function

  const SUPPORTED_REGIONS = ['US', 'CA', 'IN']; // Add more regions as needed

  exports.register = async (req, res) => {
    const { username, email, phone, password, is_agent } = req.body;

    try {
      // Basic field validation
      if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Phone validation (support US, Canada, India)
      const existingPhone = await findUserByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone number already registered' });
      }

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

      // Email uniqueness check
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // If registering as agent, check agent table as well
      if (is_agent) {
        const existingAgent = await findAgentByEmail(email);
        if (existingAgent) {
          return res.status(409).json({ error: 'Email already registered as agent' });
        }
      } else {
        // If registering as customer, check customer table
        const existingCustomer = await findCustomerByEmail(email);
        if (existingCustomer) {
          return res.status(409).json({ error: 'Email already registered as customer' });
        }
      }

      // Password hash and user creation
      const hashed = await bcrypt.hash(password, 10);

      // Pass is_agent to createUser!
      const user = await createUser(username, email, phone, hashed, is_agent);

      // If registering as agent, also create agent entry linked to user
      if (is_agent) {
        await createAgent(user.id, username, email, phone, hashed);
      } else {
        // If registering as customer, create customer entry linked to user
        await createCustomer(user.id, username, email, phone, hashed);
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, phone: user.phone, is_agent: user.is_agent },
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
      const user = await findUserByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          is_agent: user.is_agent,
          createUser: user.createUser,
        }, 
        process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful',
        token,
        user: { 
          id: user.id,
          is_agent: user.is_agent,
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  //user_info_function

  exports.getUserInfo = async (req, res) => {
    const userId = req.user.userId || req.user.id; // Extract userId from the token
    try {
      const user = await findUserById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        is_agent: user.is_agent,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

//reset_password_function
  exports.resetPassword = async (req, res) => {
  const userId = req.user.userId || req.user.id; // Extract userId from token (middleware must set req.user)
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }
  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different from old password' });
  }

  try {
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePassword(userId, hashed); // You need to implement this in your userModel

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
