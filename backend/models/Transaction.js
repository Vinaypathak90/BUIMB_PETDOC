const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    // --- 🔗 RELATIONSHIPS ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Made false so Admin can add expenses (like Electricity Bill) without a User ID
    },

    // --- 🆔 IDENTIFIERS ---
    invoiceId: {
        type: String,
        required: true,
        unique: true
    },

    // --- 👤 ENTITY DETAILS (Compatible with both User & Admin) ---
    // 'name' is the generic display name (e.g., Patient Name OR Vendor Name)
    name: { 
        type: String, 
        required: true 
    },
    
    // 'doctorName' is specific to medical appointments (Optional)
    doctorName: {
        type: String,
        required: false 
    },

    // --- 📂 CATEGORIZATION ---
    // 'type' is the Category (e.g., "Consultation", "Salary", "Equipment")
    type: { 
        type: String, 
        required: true 
    },
    
    // 'service' is specific to appointments (e.g., "Dental Cleaning") - Optional
    service: {
        type: String,
        required: false
    },

    // --- 💰 FINANCIALS ---
    amount: {
        type: Number,
        required: true
    },
    
    // ✅ CRITICAL NEW FIELD: Tracks Income vs Expense
    flow: { 
        type: String, 
        enum: ['credit', 'debit'], // credit = Money In (+), debit = Money Out (-)
        default: 'credit'
    },

    // --- ⚙️ STATUS & METHOD ---
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
        default: 'Paid'
    },
    method: {
        type: String, // e.g., "Credit Card", "Cash", "Bank Transfer"
        default: "Online"
    },
    
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);