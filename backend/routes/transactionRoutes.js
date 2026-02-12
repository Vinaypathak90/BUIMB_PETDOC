const express = require('express');
const router = express.Router();
const { getMyTransactions, seedTransactions } = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');

router.get('/my-history', protect, getMyTransactions);
router.post('/seed', protect, seedTransactions); // Only for testing

module.exports = router;
