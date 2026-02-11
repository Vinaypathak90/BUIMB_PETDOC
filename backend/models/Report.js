const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    disease: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    findings: { type: String },
    doctorType: { type: String },
    date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);