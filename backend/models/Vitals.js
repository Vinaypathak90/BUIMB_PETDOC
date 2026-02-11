const mongoose = require('mongoose');

const vitalsSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    heartRate: { type: String, default: '72 Bpm' },
    temp: { type: String, default: '36.8 C' },
    glucose: { type: String, default: '90 mg/dl' },
    bp: { type: String, default: '120/80' },
    bmi: { type: String, default: '20.1' },
    spo2: { type: String, default: '98%' }
}, { timestamps: true });

module.exports = mongoose.model('Vitals', vitalsSchema);
