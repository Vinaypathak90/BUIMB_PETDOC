const express = require('express');
const router = express.Router();
const { 
    analyzeMedicalQuery, 
    getChatHistory, 
    clearChatHistory, 
    getSingleChat // 👈 Don't forget to import this
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware'); 

router.post('/analyze', authMiddleware, analyzeMedicalQuery);
router.get('/history', authMiddleware, getChatHistory);
router.get('/history/:id', authMiddleware, getSingleChat); // 👈 Naya route fetch details ke liye
router.delete('/history/clear', authMiddleware, clearChatHistory);

module.exports = router;