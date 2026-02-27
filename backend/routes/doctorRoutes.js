const express = require('express');
const router = express.Router();

// Middleware for authentication
const protect = require('../middleware/authMiddleware');

// Controller import
const doctorController = require('../controllers/doctorController');

// ==========================================
// 1. DOCTOR PROFILE & SIDEBAR
// ==========================================
//router.get('/profile', protect, doctorController.getDoctorProfile);             
//router.put('/toggle-availability', protect, doctorController.toggleAvailability); 

// ==========================================
// 2. DOCTOR DASHBOARD & APPOINTMENTS
// ==========================================
//router.get('/dashboard', protect, doctorController.getDoctorDashboard); 
//router.put('/appointments/:id/status', protect, doctorController.updateAppointmentStatus);

// ==========================================
// 3. PATIENT MANAGEMENT (MY PATIENTS)
// ==========================================
//router.get('/patients', protect, doctorController.getDoctorPatients);           
//router.post('/patients', protect, doctorController.addDoctorPatient);           
//router.delete('/patients/:id', protect, doctorController.deleteDoctorPatient);  

// ==========================================
// 8. APPOINTMENTS & LIVE CONSULTATION
// ==========================================
router.get('/appointments', protect, doctorController.getDoctorAppointments);
router.put('/appointments/:id/complete', protect, doctorController.completeConsultation);
router.put('/appointments/:id/status', protect, doctorController.updateAppointmentStatus);
// ==========================================
// 4. SPECIALTIES & SERVICES
// ==========================================
router.get('/specialties', protect, doctorController.getSpecialties);    
router.put('/specialties', protect, doctorController.updateSpecialties); 

// ==========================================
// 5. INVOICES & BILLING (NEW) 🚀
// ==========================================
router.get('/invoices', protect, doctorController.getDoctorInvoices);
router.post('/invoices', protect, doctorController.createDoctorInvoice);

router.get('/schedule', protect, doctorController.getDoctorSchedule);
router.put('/schedule', protect, doctorController.updateDoctorSchedule); 

module.exports = router;
