const express = require('express');
const router = express.Router();

// 1. Controller import (Ye toh sahi hai kyunki file aapne abhi dikhayi)
const { analyzeMedicalQuery } = require('../controllers/aiController');

// 2. Middleware import (Agar aapka middleware 'protect' naam se export nahi ho raha, toh server crash hoga)
// Isliye testing ke liye hum abhi is route ko direct open kar rahe hain.
// const { protect } = require('../middleware/authMiddleware'); 

// 🚨 Testing Route (Bina protect ke check karte hain ki server start hota hai ya nahi)
router.post('/analyze', analyzeMedicalQuery);

module.exports = router;