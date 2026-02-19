const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'doctor', 'receptionist', 'patient'], 
        default: 'patient' 
    },
    speciality: { type: String },
    fee: { type: Number },
    exp: { type: String },
    availability: [{ type: String }],
    
    // 👇 NEW FIELDS ADDED FOR RECEPTIONIST PROFILE 👇
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    empId: { type: String, default: '' },
    status: { type: String, default: 'Online' }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);