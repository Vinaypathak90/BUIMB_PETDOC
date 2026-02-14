const mongoose = require('mongoose');

const specialistSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['human', 'pet'], 
        required: true 
    },
    speciality: { type: String, required: true },
    
    // Live Tracking Fields
    status: { 
        type: String, 
        enum: ['available', 'busy', 'break'], 
        default: 'available' 
    },
    currentTask: { type: String, default: 'Available' },
    location: { type: String, default: 'Main Hall' },
    nextFree: { type: String, default: 'Now' },
    
    img: { 
        type: String, 
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Specialist', specialistSchema);
