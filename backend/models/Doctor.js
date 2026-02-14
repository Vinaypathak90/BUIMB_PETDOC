const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    // --- Basic Info ---
    name: { type: String, required: true },
    speciality: { type: String, required: true },
    fee: { type: Number, required: true },
    exp: { type: String },
    rating: { type: Number, default: 0 },
    img: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" },
    
    // --- Type (Human or Pet Doctor) ---
    type: { 
        type: String, 
        enum: ['human', 'pet'], 
        default: 'human' // Default human maan lete hain
    },

    // --- 🔴 LIVE TRACKER FIELDS (New Added) ---
    status: { 
        type: String, 
        enum: ['available', 'busy', 'break'], 
        default: 'available' 
    },
    currentTask: { type: String, default: 'Available for Consult' },
    location: { type: String, default: 'OPD Cabin' },
    nextFree: { type: String, default: 'Now' }

}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);