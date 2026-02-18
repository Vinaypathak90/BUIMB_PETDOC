const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    // --- Basic Info ---
    name: { type: String, required: true },
    speciality: { type: String, required: true }, // Mapped to 'dept' in frontend
    fee: { type: Number, required: true },
    exp: { type: String },
    
    img: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" }, // Mapped to 'avatar'
    
    // ✅ Added these fields for your frontend compatibility
    room: { type: String, required: true },
    contact: { type: String, default: "N/A" }, 

    // --- Type (Human or Pet Doctor) ---
    type: { 
        type: String, 
        enum: ['human', 'pet'], 
        default: 'human' 
    },

    // --- 🔴 LIVE TRACKER FIELDS ---
    status: { 
        type: String, 
        // Added 'off duty' to match your frontend toggle logic
        enum: ['available', 'busy', 'break', 'off duty'], 
        default: 'available' 
    },
    // Used as 'nextSlot' in frontend
    nextFree: { type: String, default: 'Now' }, 
    isOnline: { type: Boolean, default: false },
    currentTask: { type: String, default: 'Available for Consult' },
    location: { type: String, default: 'OPD Cabin' },
    
    // Stats for Dashboard
    earned: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 }, // 0 to 5
    isVerified: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);