const Invoice = require('../models/Invoice');

// ==========================================
// 1. CREATE NEW INVOICE
// ==========================================
exports.createInvoice = async (req, res) => {
    try {
        const { 
            invoiceNo, patientName, phone, 
            items, meta, totals 
        } = req.body;

        // Recalculate totals on backend for security
        const calculatedSubTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const calculatedGrandTotal = calculatedSubTotal - (meta.discount || 0);

        const newInvoice = new Invoice({
            invoiceNo,
            patientName,
            phone,
            items: items.map(i => ({
                desc: i.desc,
                price: i.price,
                qty: i.qty,
                total: i.price * i.qty
            })),
            subTotal: calculatedSubTotal,
            discount: meta.discount,
            grandTotal: calculatedGrandTotal,
            paymentMode: meta.paymentMode,
            date: meta.date,
            time: new Date().toLocaleTimeString()
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);

    } catch (err) {
        console.error("Billing Error:", err);
        res.status(500).json({ message: "Failed to save invoice. " + err.message });
    }
};

// ==========================================
// 2. GET ALL INVOICES (History)
// ==========================================
exports.getAllInvoices = async (req, res) => {
    try {
        // Sort by 'createdAt' descending (newest first)
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch history." });
    }
};

// ==========================================
// 3. SEARCH INVOICES
// ==========================================
exports.searchInvoices = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return exports.getAllInvoices(req, res);

        const invoices = await Invoice.find({
            $or: [
                { invoiceNo: { $regex: query, $options: 'i' } },
                { patientName: { $regex: query, $options: 'i' } },
                { phone: { $regex: query } }
            ]
        }).sort({ createdAt: -1 });
        
        res.status(200).json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Search failed." });
    }
};
