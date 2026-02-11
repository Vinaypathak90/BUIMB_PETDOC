const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    name: { type: String, required: true },
    speciality: { type: String, required: true }, // e.g., Dentist, Cardiology
    fee: { type: Number, required: true },
    exp: { type: String }, // e.g., "10 Yrs"
    rating: { type: Number, default: 4.5 },
    img: { type: String }, // URL to image
    availability: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);