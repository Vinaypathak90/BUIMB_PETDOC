const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    patientId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['human', 'pet'], 
        required: true 
    },
    // Pet Specific Fields
    ownerName: { type: String }, 
    breed: { type: String },
    
    // Common Fields
    age: { type: String },
    gender: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    lastVisit: { type: String },
    paid: { type: Number, default: 0 },
    
    // Stores Base64 string for image or file path
    img: { 
        type: String, 
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
    },
    medicalHistory: { type: String }, // Stores file name

    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);