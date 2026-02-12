const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    invoiceId: {
        type: String,
        required: true,
        unique: true
    },
    doctorName: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
        default: 'Pending'
    },
    method: {
        type: String, // e.g., "Credit Card •••• 4242", "UPI", "Wallet"
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
