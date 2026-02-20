const Specialist = require('../models/Specialist');

exports.saveSpecialties = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const incomingData = req.body; // Array of { name: 'Cardiology', services: [...] }

        // 1. Purana data clear karein (Sirf us doctor ka)
        await Specialist.deleteMany({ doctorId: doctorId });

        // 2. Naya data format karke save karein
        const specialistsToSave = incomingData.map(spec => ({
            doctorId: doctorId,
            name: req.user.name || "Doctor", // User model se naam uthayega
            type: 'human', // Default or get from profile
            speciality: spec.name, // UI ka 'Specialty Name' dropdown
            services: spec.services.map(svc => ({
                name: svc.name,
                price: Number(svc.price),
                description: svc.description
            })),
            status: 'available'
        }));

        await Specialist.insertMany(specialistsToSave);

        res.status(200).json({ message: "Specialties & Services saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};