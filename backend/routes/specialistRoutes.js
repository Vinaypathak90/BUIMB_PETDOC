const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    saveSpecialties, 
    getDoctorSpecialties 
} = require('../controllers/specialistController');

// Ye route doctor ke panel ke liye hai
router.post('/save-specialties', protect, saveSpecialties);
router.get('/my-specialties', protect, getDoctorSpecialties);

module.exports = router;
