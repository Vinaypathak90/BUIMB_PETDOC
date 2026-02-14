const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    // General Information
    siteName: { type: String, default: 'PetDoc AI' },
    supportEmail: { type: String, default: 'admin@petdoc.com' },
    contactPhone: { type: String, default: '+1 234 567 890' },
    copyrightText: { type: String, default: '© 2026 PetDoc Inc.' },

    // Appearance Preferences (Backend Backup)
    theme: { type: String, enum: ['light', 'dark', 'blue'], default: 'light' },
    fontSize: { type: String, enum: ['small', 'normal', 'large'], default: 'normal' },

    // Notification Toggles
    emailOrder: { type: Boolean, default: true },
    smsOrder: { type: Boolean, default: false },
    promoEmails: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);