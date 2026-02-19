const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Ensure user is logged in

const { 
    getNotifications, 
    markRead, 
    deleteNotification 
} = require('../controllers/notificationController');

// --- ROUTES ---
router.get('/', protect, getNotifications);          // Get List
router.put('/:id/read', protect, markRead);          // Mark Read (or 'all')
router.delete('/:id', protect, deleteNotification);  // Delete (or 'all')

module.exports = router;
