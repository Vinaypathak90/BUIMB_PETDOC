const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    title: { type: String, required: true },
    msg: { type: String, required: true },
    
    // Type helps in frontend styling (alert = red, success = green, etc.)
    type: { 
        type: String, 
        enum: ['info', 'alert', 'success', 'neutral'], 
        default: 'info' 
    },
    
    isRead: { type: Boolean, default: false },
    
    // Optional: Target User (if multiple receptionists exist)
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
