const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'receptionist', 'patient'],
        default: 'patient'
    },
    
    // --- 🚨 NEW FIELDS FOR PROFILE OVERVIEW ---
    phone: { type: String, default: "" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    img: { type: String, default: "" },   // Base64 Profile Image
    cover: { type: String, default: "" }, // Base64 Cover Image
    isProfileComplete: { type: Boolean, default: false },

    // --- DOCTOR SPECIFIC FIELDS ---
    speciality: { type: String },
    fee: { type: Number },
    exp: { type: String },
    availability: [{ type: String }]
},
{
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);