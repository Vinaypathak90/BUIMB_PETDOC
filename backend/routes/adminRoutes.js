const express = require('express');
const router = express.Router();
const { getDoctors, addDoctor, updateDoctor, deleteDoctor, getPatients, addPatient, updatePatient, deletePatient, getSpecialists, addSpecialist, updateSpecialist, deleteSpecialist, getAppointments, toggleAppointmentStatus,deleteAppointment,
    getTransactions, deleteTransaction, addTransaction } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { getSettings, updateSettings } = require('../controllers/adminController');
// Secure all routes
router.use(protect, adminOnly);

router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);


// --- PATIENT ROUTES (New) ---
router.get('/patients', getPatients);
router.post('/patients', addPatient);
router.put('/patients/:id', updatePatient);
router.delete('/patients/:id', deletePatient);

// --- SPECIALIST TRACKER ROUTES ---
router.get('/specialists', getSpecialists);
router.post('/specialists', addSpecialist);
router.put('/specialists/:id', updateSpecialist);
router.delete('/specialists/:id', deleteSpecialist);

// --- APPOINTMENTS ---
router.get('/appointments', getAppointments);
router.put('/appointments/:id/toggle', toggleAppointmentStatus);
//--- TRANSACTIONS ---
router.get('/transactions', getTransactions);
router.post('/transactions', addTransaction); // To add salaries/expenses manually
router.delete('/transactions/:id', deleteTransaction);
// --- PLATFORM SETTINGS ROUTES ---
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
// THIS IS THE DELETE ROUTE
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;