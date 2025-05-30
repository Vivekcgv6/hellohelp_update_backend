  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { createAgent, findAgentByEmail, findAgentByUserId, getAllAgents } = require('../models/agentModel');
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
      // Check if agent already exists in agents table
      const existingAgent = await findAgentByEmail(email);
      if (existingAgent) {
        return res.status(409).json({ error: 'Email already registered as agent' });
      }


      // Password hash and agent creation
      const hashed = await bcrypt.hash(password, 10);

      //Create user with is_agent = true
      const user = await createUser(username, email, phone, hashed, true);

      //Create agent and link to user
      const agent = await createAgent(user.id, username, email, phone, hashed);

      res.status(201).json({
        message: 'Agent registered successfully',
        agent: { id: agent.id, email: agent.email, phone: agent.phone },
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
      const agent = await findAgentByEmail(email);
      if (!agent) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, agent.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          userId: agent.user_id,
          username: agent.username,
          email: agent.email,
          phone: agent.phone,
          role: 'agent',
          

        }, 
        process.env.JWT_SECRET, { expiresIn: '1y' });
      res.json({ message: 'Login successful',
        token,
        agent: { 
          id: agent.id,
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  //agent_info_function

  exports.getAgentInfo = async (req, res) => {
  // Extract userId from the JWT payload
  const userId = req.user.userId || req.user.id;
  try {
    if (!userId) {
      return res.status(400).json({ error: 'userId is not defined' });
    }
    const agent = await findAgentByUserId(userId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({
      id: agent.user_id,
      username: agent.username,
      email: agent.email,
      phone: agent.phone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get all agents function

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await getAllAgents();
    if (!agents || agents.length === 0) {
      return res.status(404).json({ error: 'No agents found' });
    }
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
