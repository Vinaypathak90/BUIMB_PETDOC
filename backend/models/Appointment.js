const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    // User who booked the appointment
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // ✅ CHANGED 'doctorId' to 'doctor' so .populate('doctor') works!
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor',
        required: true 
    },

    // Snapshot Data (Saved in case doctor changes later)
    doctorName: { type: String, required: true },
    speciality: { type: String },
    doctorImg: { type: String },
    fee: { type: Number },

    // Patient Details
    patientName: { type: String, required: true },
    age: { type: String },
    gender: { type: String },
    phone: { type: String },
    type: { type: String, enum: ['myself', 'pet', 'other'], required: true },
    
    // Pet Specific
    petName: { type: String },
    petType: { type: String },

    // Appointment Details
    problem: { type: String },
    symptoms: { type: String },
    
    // ✅ ADDED AS REQUESTED
    medicalReport: { type: String }, 

    date: { type: String, required: true },
    day: { type: String },
    time: { type: String, required: true },
    
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);