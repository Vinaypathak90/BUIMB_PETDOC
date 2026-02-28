require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- 1. IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); 
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes'); 

// 🚨 YAHAN DOCTOR ROUTES IMPORT KIYE HAIN 🚨
const doctorRoutes = require('./routes/doctorRoutes');

connectDB(); // Connect to MongoDB

const app = express();

// --- 2. MIDDLEWARE ---
app.use(cors());

// Increase payload limit for image/file uploads (Set to 50mb to prevent errors)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/appointments', appointmentRoutes); 
app.use('/api/ai', aiRoutes); 
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);

// 🚨 YAHAN DOCTOR ROUTES MOUNT KIYE HAIN 🚨
app.use('/api/doctor', doctorRoutes);

// Safe Test Route (JSON format mein taaki frontend crash na ho)
app.get('/', (req, res) => {
    res.json({ message: 'API is running successfully...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});