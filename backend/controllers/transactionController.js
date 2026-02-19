const Transaction = require('../models/Transaction');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions/my-history
// @access  Private
exports.getMyTransactions = async (req, res) => {
    try {
        // 🚨 FIX: Safely extract ID whether it's saved as .id or ._id
        const userId = req.user.id || req.user._id; 
        
        console.log("✅ Logged in User ID:", userId); 

        // Agar token mein issue hai toh yahi rok do
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing from token" });
        }

        // ✅ FIX: Wapas filter laga diya taaki user ko sirf APNE transactions dikhein
        // Aur sort 'createdAt: -1' rakha hai taaki naye wale sabse upar aayen
        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
        
        console.log(`Transactions found for this user: ${transactions.length}`);

        res.json(transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Create a mock transaction (For testing/seeding)
// @route   POST /api/transactions/seed
// @access  Private
exports.seedTransactions = async (req, res) => {
    try {
        const mockData = [
            {
                user: req.user._id,
                invoiceId: "INV-2024-001",
                doctorName: "Dr. Ruby Perrin",
                service: "Dental Checkup",
                amount: 500,
                status: "Paid",
                method: "Credit Card •••• 4242",
                date: new Date('2026-02-12')
            },
            {
                user: req.user._id,
                invoiceId: "INV-2024-002",
                doctorName: "Dr. Darren Elder",
                service: "Pet Surgery (Bruno)",
                amount: 1200,
                status: "Pending",
                method: "Pay on Visit",
                date: new Date('2026-02-10')
            },
            {
                user: req.user._id,
                invoiceId: "INV-2024-003",
                doctorName: "Dr. Sofia Brient",
                service: "Cardiology",
                amount: 1500,
                status: "Refunded",
                method: "Wallet",
                date: new Date('2026-02-05')
            }
        ];

        await Transaction.insertMany(mockData);
        res.status(201).json({ message: "Mock transactions added!" });
    } catch (error) {
        console.error("Error seeding transactions:", error);
        res.status(500).json({ message: "Seeding Failed" });
    }
};
