const express = require('express');
const router = express.Router();

// Asli Dynamic Guard (Jo har doctor ka token verify karega)
const protect = require('../middleware/authMiddleware'); 

const { 
    getDoctorsList, 
    addReview, 
    getAllReviews, 
    getDoctorReviews, 
    replyToReview, 
    deleteReview 
} = require('../controllers/reviewController');

// ==========================================
// 🚨 SARE ROUTES PAR ASLI GUARD LAGA DIYA HAI
// ==========================================

router.get('/doctor', protect, getDoctorReviews); // Har doctor ko apna data milega
router.get('/doctors-list', protect, getDoctorsList); 
router.post('/add', protect, addReview);
router.get('/all', protect, getAllReviews);
router.put('/:id/reply', protect, replyToReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
