const Patient = require('../models/Patient');

// ==========================================
// 1. GET ALL PATIENTS (For List View)
// ==========================================
exports.getAllPatients = async (req, res) => {
    try {
        // Sort by 'updatedAt' so recently modified/added patients appear first
        const patients = await Patient.find().sort({ updatedAt: -1 });
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ message: "Database error: Could not fetch patients." });
    }
};

// ==========================================
// 2. REGISTER NEW PATIENT (Add Action)
// ==========================================
exports.registerPatient = async (req, res) => {
    try {
        const { 
            name, age, gender, phone, address, 
            type, ownerName, breed, medicalHistory 
        } = req.body;

        // Auto-generate ID (Format: PT + 4 random digits, e.g., PT6187)
        const patientId = `PT${Math.floor(1000 + Math.random() * 9000)}`;

        const newPatient = new Patient({
            patientId,
            name,
            age,
            gender,
            phone,
            address,
            type: type || 'human', // Default to human if not sent
            ownerName: type === 'pet' ? ownerName : '',
            breed: type === 'pet' ? breed : '',
            medicalHistory: medicalHistory || '',
            status: 'active',
            img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);

    } catch (err) {
        console.error("Save Error:", err);
        res.status(400).json({ message: "Registration failed. Please check inputs." });
    }
};

// ==========================================
// 3. SEARCH PATIENT (Filter Action)
// ==========================================
exports.searchPatient = async (req, res) => {
    const { query } = req.query;
    try {
        const results = await Patient.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query } },
                { patientId: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
};
