const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    // --- User (Account Holder) ---
    // Change: 'required: true' hata diya taaki Receptionist bina login wale patient ko add kar sake
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    
    // Link to Patient Table
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, 

    // Doctor Details
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String, required: true },
    speciality: { type: String },
    doctorImg: { type: String },
    fee: { type: Number },

    // Patient Snapshot Details
    patientName: { type: String, required: true },
    age: { type: String },
    gender: { type: String },
    
    // Contact Info
    phone: { type: String, required: true },
    address: { type: String, required: true },
    
    // --- Type ---
    // Change: 'Walk-in' aur 'Emergency' add kiya. Purane options (myself, pet) waise hi hain.
   type: { type: String, default: 'walk-in' },
    
    // Pet Specific
    petName: { type: String },
    petType: { type: String },

    // Medical Details
    problem: { type: String },
    symptoms: { type: String },
    medicalReport: { type: String }, 

    // Scheduling
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    day: { type: String },
    time: { type: String, required: true },
    
    // --- Status ---
    // Change: Receptionist flow ke liye 'Waiting', 'Checked-in' add kiye.
    status: { 
        type: String, 
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Waiting', 'Checked-in', 'With Doctor'], 
        default: 'Scheduled' 
    },
    // 🚨 NAYI FIELDS: Visit ka type aur Consultation details ke liye
    visitType: { 
        type: String, 
        enum: ['Clinic', 'Video', 'Home'], 
        default: 'Clinic' 
    },
    room: { type: String, default: '101' },
    token: { type: String },
    meetingLink: { type: String },

    // 🚨 PRESCRIPTION & CONSULTATION DATA
    prescription: {
        vitals: {
            temp: String,
            bp: String,
            pulse: String,
            weight: String,
            height: String,
            spo2: String
        },
        clinicalNotes: {
            symptoms: String,
            diagnosis: String,
            advice: String
        },
        medications: [{
            name: String,
            type: { type: String, default: 'Tablet' },
            dosage: String,
            duration: String
        }]
    },
    
    
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' }
}, { timestamps: true });

appointmentSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Appointment', appointmentSchema);
