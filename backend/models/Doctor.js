const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    name: { type: String, required: true },
    speciality: { type: String, required: true },
    image: { type: String },
    fee: { type: Number, required: true },
    experience: { type: String },
    patients: { type: Number }
});

module.exports = mongoose.model('Doctor', doctorSchema);