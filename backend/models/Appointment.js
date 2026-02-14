const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    // User (Account Holder)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // ✅ LINK TO NEW PATIENT TABLE
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, 

    // Doctor Details
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String, required: true },
    speciality: { type: String },
    doctorImg: { type: String },
    fee: { type: Number },

    // Patient Snapshot Details (Appointment ke waqt jo data tha)
    patientName: { type: String, required: true },
    age: { type: String },
    gender: { type: String },
    
    // ✅ NEW FIELDS FROM FORM
    phone: { type: String, required: true }, // Added Phone
    address: { type: String, required: true }, // Added Address
    
    type: { type: String, enum: ['myself', 'pet', 'other'], required: true },
    
    // Pet Specific
    petName: { type: String },
    petType: { type: String },

    // Medical Details
    problem: { type: String },
    symptoms: { type: String },
    
    // ✅ Medical Report File (Base64 or URL)
    medicalReport: { type: String }, 

    // Scheduling
    date: { type: String, required: true },
    day: { type: String },
    time: { type: String, required: true },
    
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);