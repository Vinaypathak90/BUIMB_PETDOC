const express = require('express');
const router = express.Router();
const { getDashboardData, updateProfile,bookAppointment, 
    getUserProfile, 
    updateUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Ensure you have authMiddleware from previous steps

router.get('/dashboard', protect, getDashboardData);
router.post('/profile', protect, updateProfile);
router.post('/book-appointment', protect, bookAppointment);
router.post('/book-appointment', protect, bookAppointment);

module.exports = router;