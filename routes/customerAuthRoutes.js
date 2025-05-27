const express = require('express');
const router = express.Router();
const { register, login, getCustomerInfo, getAllCustomers } = require('../controllers/customerAuthController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/customer-info', authenticateToken, getCustomerInfo);
router.get('/customers', authenticateToken, getAllCustomers);

module.exports = router;
