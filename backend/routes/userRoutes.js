const express = require('express');
const router = express.Router();
const { getDashboardData, updateProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Ensure you have authMiddleware from previous steps

router.get('/dashboard', protect, getDashboardData);
router.post('/profile', protect, updateProfile);

module.exports = router;