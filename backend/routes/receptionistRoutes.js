const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
    getAllPatients, 
    registerPatient, 
    searchPatient,
    getAppointments, bookAppointment, updateAppointmentStatus ,
    getDoctorsList,bookWalkIn,
getLiveQueue,  getDailyReport,getReceptionistList, 
    updateReceptionistProfile,
    changePassword
} = require('../controllers/receptionistController');
const { 
    getAllDoctors, 
    updateDoctorStatus, 
    addDoctor 
} = require('../controllers/doctorController');

// --- Import NEW Billing Controller ---
const { 
    createInvoice, 
    getAllInvoices, 
    searchInvoices 
} = require('../controllers/billingController');



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

// ==========================================
// 💰 NEW BILLING ROUTES
// ==========================================
router.post('/billing/create', protect, createInvoice);   // Save Invoice
router.get('/billing/history', protect, getAllInvoices);  // Get List
router.get('/billing/search', protect, searchInvoices);   // Search List
// 📊 REPORT ROUTE
router.get('/reports/daily', protect, getDailyReport);

// --- PROFILE ROUTES ---
// Uses getReceptionistList as you requested
router.get('/profile', protect, getReceptionistList); 
router.put('/profile', protect, updateReceptionistProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
