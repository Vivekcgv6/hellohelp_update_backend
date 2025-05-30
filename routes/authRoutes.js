const express = require('express');
const router = express.Router();
const { register, login, getUserInfo, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/user-info', authenticateToken, getUserInfo);
router.post('/reset-password', authenticateToken, resetPassword);

module.exports = router;
