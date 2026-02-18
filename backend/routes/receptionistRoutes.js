const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
    getAllPatients, 
    registerPatient, 
    searchPatient,
    getAppointments, bookAppointment, updateAppointmentStatus ,
    getDoctorsList

} = require('../controllers/receptionistController');

// --- Patient Management Routes ---
router.get('/patients', protect, getAllPatients);
router.post('/register', protect, registerPatient); // Matches the "Add Patient" button
router.get('/search', protect, searchPatient);      // Matches the "Search" bar

router.get('/appointments', protect, getAppointments);
router.post('/appointments', protect, bookAppointment);
router.put('/appointments/:id/status', protect, updateAppointmentStatus);

router.get('/doctors', protect, getDoctorsList);
module.exports = router;
