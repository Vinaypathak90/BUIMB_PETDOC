// backend/models/ChatHistory.js
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    data: { type: Object }, 
    messages: [
        {
            id: { type: String }, // Frontend msg ID
            sender: { type: String, enum: ['user', 'ai'] },
            text: { type: String },
            type: { type: String, default: 'text' },
            time: { type: String }
        }
    ],
    // 🚨 7-DAY AUTO DELETE MAGIC 
    createdAt: { type: Date, default: Date.now, expires: '7d' } 
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);