const Specialist = require('../models/Specialist');

// 1. Save or Update Specialties
exports.saveSpecialties = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const incomingSpecialties = req.body; // Array of specialties from UI

        if (!incomingSpecialties || !Array.isArray(incomingSpecialties)) {
            return res.status(400).json({ message: "Invalid data format" });
        }

        // Sabse pehle purana data delete karenge taaki clean update ho
        await Specialist.deleteMany({ doctorId: doctorId });

        // Ab naya data format karenge database ke hisaab se
        const formattedData = incomingSpecialties.map(spec => ({
            doctorId: doctorId,
            name: req.user.name, // Doctor ka naam User collection se
            type: 'human',       // Default type
            speciality: spec.name, // UI dropdown value (e.g. Cardiology)
            services: spec.services.map(svc => ({
                name: svc.name,
                price: Number(svc.price) || 0,
                description: svc.description
            })),
            status: 'available',
            location: 'Main Clinic'
        }));

        await Specialist.insertMany(formattedData);

        res.status(200).json({ 
            success: true, 
            message: "All specialties and services updated successfully!" 
        });

    } catch (error) {
        console.error("❌ Save Error:", error);
        res.status(500).json({ message: "Server Error: Could not save data" });
    }
};

// 2. Fetch Doctor's own specialties (For frontend useEffect)
exports.getDoctorSpecialties = async (req, res) => {
    try {
        const data = await Specialist.find({ doctorId: req.user._id });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data" });
    }
};
