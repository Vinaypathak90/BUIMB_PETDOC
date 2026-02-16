const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
    getAllPatients, 
    registerPatient, 
    searchPatient 
} = require('../controllers/receptionistController');

// --- Patient Management Routes ---
router.get('/patients', protect, getAllPatients);
router.post('/register', protect, registerPatient); // Matches the "Add Patient" button
router.get('/search', protect, searchPatient);      // Matches the "Search" bar

module.exports = router;
