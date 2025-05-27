const express = require('express');
const router = express.Router();
const { register, login, getAgentInfo } = require('../controllers/agentAuthController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/agent-info', authenticateToken, getAgentInfo);

module.exports = router;
