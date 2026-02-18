const Doctor = require('../models/Doctor');

// ==========================================
// 1. GET ALL DOCTORS (For Status Board)
// ==========================================
exports.getAllDoctors = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        // 1. Filter by Status
        if (status && status !== 'All') {
            query.status = status.toLowerCase(); // Ensure lowercase matches enum
        }

        // 2. Search Logic (Name or Speciality)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { speciality: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(query);

        // 3. Map Database Fields to Frontend Expectation
        // Frontend uses 'dept' and 'avatar', DB uses 'speciality' and 'img'
        const formattedDoctors = doctors.map(doc => ({
            _id: doc._id, // Important for updates
            id: doc._id,  // Fallback
            name: doc.name,
            dept: doc.speciality, // ✅ Mapped
            room: doc.room,
            // Capitalize status for UI (available -> Available)
            status: doc.status.charAt(0).toUpperCase() + doc.status.slice(1), 
            nextSlot: doc.nextFree, // ✅ Mapped 'nextFree' to 'nextSlot'
            avatar: doc.img,      // ✅ Mapped
            contact: doc.contact,
            isOnline: doc.isOnline
        }));

        res.status(200).json(formattedDoctors);

    } catch (err) {
        console.error("Doctor Fetch Error:", err);
        res.status(500).json({ message: "Failed to load doctors." });
    }
};

// ==========================================
// 2. TOGGLE DOCTOR STATUS
// ==========================================
// ==========================================
// 2. TOGGLE DOCTOR STATUS (FIXED)
// ==========================================
exports.updateDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        // 1. Get current status (ensure lowercase for comparison)
        const currentStatus = doctor.status.toLowerCase();
        
        let nextStatus = 'available';
        let nextTime = 'Now';

        // 2. Determine Next Status
        if (currentStatus === 'available') {
            nextStatus = 'busy';
            nextTime = '45 mins';
        } else if (currentStatus === 'busy') {
            nextStatus = 'break';
            nextTime = '1 Hour';
        } else if (currentStatus === 'break') {
            nextStatus = 'off duty';
            nextTime = 'Tomorrow';
        } else {
            // If 'off duty' or anything else, cycle back to available
            nextStatus = 'available'; 
            nextTime = 'Now';
        }

        // 3. Update Database Fields
        doctor.status = nextStatus; // Saving as lowercase to match Enum
        doctor.nextFree = nextTime; // Ensure this matches your Schema field name
        
        // Save
        await doctor.save();

        // 4. Return Formatted Response for Frontend
        res.status(200).json({
            _id: doctor._id,
            id: doctor._id,
            name: doctor.name,
            dept: doctor.speciality,
            room: doctor.room,
            // Format for UI (Capitalize first letter)
            status: nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1), 
            nextSlot: nextTime,
            avatar: doctor.img,
            contact: doctor.contact
        });

    } catch (err) {
        console.error("Status Update Error:", err); // Log the real error to console
        res.status(500).json({ message: "Status update failed: " + err.message });
    }
};

// ==========================================
// 3. ADD NEW DOCTOR (Utility)
// ==========================================
exports.addDoctor = async (req, res) => {
    try {
        const newDoc = new Doctor(req.body);
        await newDoc.save();
        res.status(201).json(newDoc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
