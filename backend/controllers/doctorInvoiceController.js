const Invoice = require('../models/Invoice');

// ==========================================
// 1. GET ALL INVOICES (For Logged-in Doctor)
// ==========================================
exports.getInvoices = async (req, res) => {
    try {
        // Extract Doctor ID safely
        const doctorId = req.user.id || req.user._id;

        // Fetch invoices for this specific doctor & sort by newest first
        const invoices = await Invoice.find({ doctorId })
            .sort({ createdAt: -1 })
            .setOptions({ allowDiskUse: true }); // Memory limit crash fix
        
        // 🚨 IMPORTANT: Mapping data to exactly match your React Frontend State
        const formattedInvoices = invoices.map(inv => ({
            _id: inv._id,
            id: inv.invoiceNo,         // Frontend uses 'id' instead of 'invoiceNo'
            patient: inv.patientName,  // Frontend uses 'patient' instead of 'patientName'
            date: inv.date,
            time: inv.time || "12:00 PM",
            amount: inv.grandTotal,    // Frontend uses 'amount' for the total bill
            status: inv.status,
            items: inv.items,
            tax: inv.tax,
            img: inv.img,
            method: inv.paymentMode
        }));

        res.status(200).json(formattedInvoices);

    } catch (error) {
        console.error("❌ Fetch Invoices Error:", error);
        res.status(500).json({ message: "Failed to load invoices", error: error.message });
    }
};

// ==========================================
// 2. CREATE NEW INVOICE
// ==========================================
exports.createInvoice = async (req, res) => {
    try {
        const doctorId = req.user.id || req.user._id;
        
        // Frontend se aane wala data
        const { patient, items, tax, status, paymentMode, phone } = req.body;

        // 1. Sanitization & Item Auto-Calculation
        let calculatedSubTotal = 0;
        const processedItems = (items || []).map(item => {
            const cost = Number(item.cost) || 0;
            const qty = Number(item.qty) || 1;
            const total = cost * qty;
            calculatedSubTotal += total; // Subtotal mein add karte jao

            return {
                desc: item.desc || "Consultation",
                cost: cost,
                qty: qty,
                total: total
            };
        });

        // 2. Tax & Grand Total Calculation
        const appliedTax = Number(tax) || 0;
        const discountAmount = 0; // Agar future mein discount add karna ho
        const calculatedGrandTotal = calculatedSubTotal + (calculatedSubTotal * (appliedTax / 100)) - discountAmount;

        // 3. Current Date & Time
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // 4. Create Invoice Document
        const newInvoice = new Invoice({
            doctorId,
            invoiceNo: `INV-${Math.floor(10000 + Math.random() * 90000)}`, // Generate INV-XXXXX
            patientName: patient || "Unknown Patient",
            phone: phone || "---",
            items: processedItems,
            status: status || 'Pending',
            subTotal: calculatedSubTotal,
            tax: appliedTax,
            discount: discountAmount,
            grandTotal: calculatedGrandTotal,
            paymentMode: paymentMode || 'Cash',
            date: formattedDate,
            time: formattedTime,
            img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });

        // 5. Save to Database
        const savedInvoice = await newInvoice.save();
        console.log(`✅ Invoice ${savedInvoice.invoiceNo} generated successfully!`);
        
        // 6. Return response formatted for React State
        res.status(201).json({
            _id: savedInvoice._id,
            id: savedInvoice.invoiceNo,
            patient: savedInvoice.patientName,
            date: savedInvoice.date,
            time: savedInvoice.time,
            amount: savedInvoice.grandTotal,
            status: savedInvoice.status,
            items: savedInvoice.items,
            tax: savedInvoice.tax,
            img: savedInvoice.img,
            method: savedInvoice.paymentMode
        });

    } catch (error) {
        console.error("❌ Create Invoice Error:", error);
        res.status(400).json({ message: "Failed to create invoice", error: error.message });
    }
};

// ==========================================
// 3. UPDATE INVOICE STATUS (Optional but useful)
// ==========================================
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );

        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        res.status(200).json({ message: "Status updated successfully", status: invoice.status });
    } catch (error) {
        res.status(400).json({ message: "Failed to update status", error: error.message });
    }
};

// ==========================================
// 4. DELETE INVOICE (Optional)
// ==========================================
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete invoice", error: error.message });
    }
};