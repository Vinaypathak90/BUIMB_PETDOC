const express = require('express');
const router = express.Router();
const { getDashboardData, updateProfile,bookAppointment, 
    getUserProfile, 
    updateUserProfile,
getAdminProfile, 
    updateAdminProfile, 
    getAdmins, 
    updatePassword,
    getUserProfileSettings, 
    updateUserProfileSettings, 
    updateUserPassword } = require('../controllers/userController');
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

// 1. GET Request: Frontend loads Settings page -> fetch data
router.get('/profile', protect, getUserProfileSettings);

// 2. PUT Request: Frontend clicks "Save All Changes" -> update data & image
router.put('/profile', protect, updateUserProfileSettings);

// 3. PUT Request: Frontend clicks "Update Password" -> verify and hash new password
router.put('/password', protect, updateUserPassword);

module.exports = router;