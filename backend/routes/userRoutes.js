const express = require('express');
const router = express.Router();
const { getDashboardData, updateProfile,bookAppointment, 
    getUserProfile, 
    updateUserProfile,
getAdminProfile, 
    updateAdminProfile, 
    getAdmins, 
    updatePassword } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Ensure you have authMiddleware from previous steps

router.get('/dashboard', protect, getDashboardData);
router.post('/profile', protect, updateProfile);
router.post('/book-appointment', protect, bookAppointment);
router.post('/book-appointment', protect, bookAppointment);
// 1. Profile Routes
router.get('/admin-profile', protect, getAdminProfile);
router.put('/admin-profile', protect, updateAdminProfile);

// 2. Team Route
router.get('/admins', protect, getAdmins);

// 3. Password Route
router.put('/update-password', protect, updatePassword);
module.exports = router;