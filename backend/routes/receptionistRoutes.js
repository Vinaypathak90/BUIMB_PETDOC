const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
    getAllPatients, 
    registerPatient, 
    searchPatient,
    getAppointments, bookAppointment, updateAppointmentStatus ,
    getDoctorsList,bookWalkIn,
getLiveQueue
} = require('../controllers/receptionistController');
const { 
    getAllDoctors, 
    updateDoctorStatus, 
    addDoctor 
} = require('../controllers/doctorController');


// --- Patient Management Routes ---
router.get('/patients', protect, getAllPatients);
router.post('/register', protect, registerPatient); // Matches the "Add Patient" button
router.get('/search', protect, searchPatient);      // Matches the "Search" bar

router.get('/appointments', protect, getAppointments);
router.post('/appointments', protect, bookAppointment);
router.put('/appointments/:id/status', protect, updateAppointmentStatus);

router.get('/doctors', protect, getDoctorsList);
router.get('/live-queue', protect, getLiveQueue);

// --- 🔴 DOCTOR STATUS BOARD ROUTES ---
router.get('/doctors-status', protect, getAllDoctors);       // Fetch Full List with Status
router.put('/doctors/:id/status', protect, updateDoctorStatus); // Toggle Status
router.post('/doctors', protect, addDoctor);                 // Add New Doctor
// --- New Walk-in Registration (The form you just made) ---
router.post('/book-walk-in', protect, bookWalkIn);
module.exports = router;
