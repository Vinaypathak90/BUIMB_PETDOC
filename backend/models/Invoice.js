const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    // Unique Invoice Identifier
    invoiceNo: { type: String, required: true, unique: true },
    
    // Patient Details (Snapshot)
    patientName: { type: String, required: true },
    phone: { type: String, default: '---' },
    
    // Billing Items
    items: [
        {
            desc: { type: String, required: true }, // Description
            price: { type: Number, required: true },
            qty: { type: Number, default: 1 },
            total: { type: Number } // price * qty
        }
    ],
    
    // Calculations
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    
    // Meta Data
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' },
    date: { type: String, required: true }, // Format: DD/MM/YYYY
    time: { type: String }, // Format: HH:MM:SS
    
    // Optional: Link to a Patient or Doctor if needed later
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
