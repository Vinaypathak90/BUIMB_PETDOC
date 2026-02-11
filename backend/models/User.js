const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'receptionist', 'patient'], // Sirf ye roles allowed hain
        default: 'patient'
    }
}, {
    timestamps: true // CreatedAt aur UpdatedAt khud aa jayega
});

module.exports = mongoose.model('User', userSchema);