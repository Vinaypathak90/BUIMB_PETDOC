const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String, required: true },
    patientImg: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String, required: true },
    doctorImg: { type: String, default: 'https://randomuser.me/api/portraits/men/85.jpg' },
    
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reply: { type: String, default: null }, 
    helpful: { type: Number, default: 0 },
    type: { type: String, enum: ['human', 'pet'], default: 'human' },
    
    date: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
