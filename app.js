require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const agentAuthRoutes = require('./routes/agentAuthRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const streamRoutes = require('./services/streamService');
// const callRoutes = require('./routes/callRoutes');


// Middleware to parse JSON bodies
app.use(express.json());

// Mount auth routes at /api/auth (or just /auth if you want)
app.use('/api/auth', authRoutes);

// Mount agent auth routes at /api/agent(or just /agent if you want)
app.use('/api/agent', agentAuthRoutes);

// Mount customer auth routes at /api/customer(or just /customer if you want)
app.use('/api/customer', customerAuthRoutes);

// Mount call routes at /api/calls (or just /calls if you want)
app.use('/api/stream', streamRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
