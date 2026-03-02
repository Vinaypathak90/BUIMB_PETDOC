const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    // --- Basic Info ---
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String },
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
      enum: ['active', 'inactive', 'on-leave', 'available', 'busy', 'break','off duty','on duty', 'off duty', 'away', 'busy'],
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
    isVerified: { type: Boolean, default: true },
    licenseId: { 
        type: String, 
        default: () => `LIC-${Date.now()}${Math.floor(Math.random() * 1000)}` 
    },
    qualification: { type: String, default: "General" },
    experience: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    specialties: [{
        id: { type: String }, // Frontend ID maintain karne ke liye
        name: { type: String },
        services: [{
            id: { type: String },
            name: { type: String },
            price: { type: Number, default: 0 },
            description: { type: String }
        }]
    }],
   

    // --- 📅 SCHEDULE & TIMINGS ---
    slotDuration: { type: Number, default: 30 },
    schedule: {
        Sunday: [{ id: String, start: String, end: String }],
        Monday: [{ id: String, start: String, end: String }],
        Tuesday: [{ id: String, start: String, end: String }],
        Wednesday: [{ id: String, start: String, end: String }],
        Thursday: [{ id: String, start: String, end: String }],
        Friday: [{ id: String, start: String, end: String }],
        Saturday: [{ id: String, start: String, end: String }]
    },
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String },
    dob: { type: String },
    title: { type: String, default: 'Dr.' },
    category: { type: String, default: 'Human' }, // 'Human' or 'Pet'
    
    // Address Object
    address: {
        line1: String, line2: String, city: String, state: String, country: String, zip: String
    },
    
    // Pricing Object
    pricing: {
        type: { type: String, default: 'custom' },
        consultationFee: Number, 
        videoFee: Number, 
        followUpFee: Number
    },
    
    // Arrays for Dynamic Lists
    education: [{ id: String, degree: String, college: String, year: String }],
    experienceList: [{ id: String, hospital: String, from: String, to: String, designation: String }],
    awards: [{ id: String, name: String, year: String, description: String }],
    registrations: [{ id: String, registration: String, council: String, year: String }],
    clinics: [{ id: String, name: String, address: String, img: String }],
    
    // Arrays for Tags
    servicesOffered: [{ type: String }],
    specializations: [{ type: String }]


}, 


{ timestamps: true });

doctorSchema.index({ createdAt: -1 });


module.exports = mongoose.model('Doctor', doctorSchema);