const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String },
    dob: { type: Date },
    gender: { type: String },
    bloodGroup: { type: String },
    email: { type: String }, // Contact email (might differ from login email)
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    // Extra Profile Info (Bio)
    bio: { type: String, default: '' },
    state: { type: String },
    country: { type: String },
    // Appearance
    themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
    accentColor: { type: String, default: 'blue' },
    
    // Notification Flags
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        promo: { type: Boolean, default: false }
    },
   img: { 
        type: String, // Base64 string yahan save ho jayegi (kaafi lambi string hoti hai)
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
    }
    
}, { timestamps: true });


module.exports = mongoose.model('Profile', profileSchema);