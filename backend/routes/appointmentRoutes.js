const express = require('express');
const router = express.Router();
const { 
    getDoctors, 
    createAppointment, 
    seedDoctors,
    getLatestAppointment // 👈 Import this!
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');

router.get('/doctors', getDoctors);
router.post('/', protect, createAppointment);
router.get('/latest', protect, getLatestAppointment); // ✅ New Tracking Route
router.post('/seed', seedDoctors);

module.exports = router;