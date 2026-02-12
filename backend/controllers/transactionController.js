const Transaction = require('../models/Transaction');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions/my-history
// @access  Private
exports.getMyTransactions = async (req, res) => {
    try {
        // 👇 Log the ID of the user currently logged in (Check your VS Code Terminal for this!)
        console.log("Logged in User ID:", req.user._id); 

        // ❌ OLD LINE (Filters by specific user) - Comment this out
        // const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

        // ✅ NEW LINE (Shows EVERYTHING for testing)
        const transactions = await Transaction.find({}).sort({ date: -1 });
        
        console.log("Transactions found in DB:", transactions.length);

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
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
