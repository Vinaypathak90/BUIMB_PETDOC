const Doctor = require('../models/Doctor');
const Transaction = require('../models/Transaction');
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

// =========================================================================
// 🟢 SECTION 6: DOCTOR INVOICES & PAYMENTS
// =========================================================================

// 1. Fetch All Invoices for the Logged-in Doctor
exports.getDoctorInvoices = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ 
            $or: [ { email: req.user.email }, { userId: req.user._id } ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        // Sirf is doctor ki transactions fetch karni hain jisme patient se paisa aaya ho
        const transactions = await Transaction.find({ 
            doctorName: doctor.name, // Mapping via doctor name based on your schema
            flow: 'credit'           // Only income
        }).sort({ createdAt: -1 });

        // Frontend format mein map karna
        const formattedInvoices = transactions.map(t => ({
            _id: t._id,
            id: t.invoiceId,
            patient: t.name, // In your schema 'name' is the patient's name
            date: new Date(t.date || t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: t.amount,
            status: t.status,
            method: t.method || "Cash",
            // Transaction model mein items nahi hain, toh hum service name use kar rahe hain
            items: [{ desc: t.service || t.type, cost: t.amount, qty: 1 }], 
            tax: 0,
            img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        }));

        res.status(200).json(formattedInvoices);
    } catch (error) {
        console.error("Fetch Invoices Error:", error);
        res.status(500).json({ message: "Failed to fetch invoices." });
    }
};

// 2. Create a New Invoice (Generates a Transaction)
exports.createDoctorInvoice = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ 
            $or: [ { email: req.user.email }, { userId: req.user._id } ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        const { patientName, items, status, totalAmount } = req.body;

        const newTransaction = new Transaction({
            user: req.user._id,
            invoiceId: `INV-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`,
            name: patientName,
            doctorName: doctor.name,
            type: "Consultation",
            service: items.length > 0 ? items[0].desc : "General Checkup",
            amount: totalAmount,
            flow: "credit",
            status: status || "Pending",
            method: "Cash", // Default, can be updated later
            date: new Date(),  
        });

        await newTransaction.save();

        res.status(201).json({ 
            message: "Invoice created successfully.", 
            invoice: {
                id: newTransaction.invoiceId,
                patient: newTransaction.name,
                date: new Date(newTransaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                amount: newTransaction.amount,
                status: newTransaction.status,
                items: items,
                tax: 0,
                img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
        });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ message: "Failed to create invoice." });
    }
};
// =========================================================================
// ⏱️ SECTION 7: DOCTOR SCHEDULE & TIMINGS
// =========================================================================

// 1. Get Doctor's Schedule
exports.getDoctorSchedule = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ 
            $or: [ { email: req.user.email }, { userId: req.user._id } ] 
        }).select('schedule slotDuration');

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        // Agar schedule null hai toh default structure bhejenge
        const defaultSchedule = {
            Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: []
        };

        res.status(200).json({
            slotDuration: doctor.slotDuration || 30,
            schedule: doctor.schedule || defaultSchedule
        });
    } catch (error) {
        console.error("Fetch Schedule Error:", error);
        res.status(500).json({ message: "Failed to fetch schedule." });
    }
};

// 2. Update Doctor's Schedule
exports.updateDoctorSchedule = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const { schedule, slotDuration } = req.body;

        const doctor = await Doctor.findOneAndUpdate(
            { $or: [ { email: req.user.email }, { userId: req.user._id } ] },
            { schedule, slotDuration },
            { new: true }
        ).select('schedule slotDuration');

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        res.status(200).json({ 
            message: "Schedule updated successfully!",
            slotDuration: doctor.slotDuration,
            schedule: doctor.schedule
        });
    } catch (error) {
        console.error("Update Schedule Error:", error);
        res.status(500).json({ message: "Failed to update schedule." });
    }
};
// =========================================================================
// 🟠 SECTION 4: SPECIALTIES & SERVICES (Doctor Panel)
// =========================================================================

// 1. Fetch Doctor's Specialties & Services
exports.getSpecialties = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ 
            $or: [ { email: req.user.email }, { userId: req.user._id } ] 
        }).select('specialties');

        if (!doctor) return res.status(404).json({ message: "Doctor not found." });

        // Agar empty hai toh empty array bhejo
        res.status(200).json(doctor.specialties || []);
    } catch (error) {
        console.error("Fetch Specialties Error:", error);
        res.status(500).json({ message: "Failed to fetch specialties." });
    }
};

// 2. Update/Save Doctor's Specialties & Services
exports.updateSpecialties = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const { specialties } = req.body; // Frontend se pura array aayega

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { $or: [ { email: req.user.email }, { userId: req.user._id } ] },
            { specialties: specialties },
            { new: true } 
        ).select('specialties');

        if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found." });

        res.status(200).json({ 
            message: "Specialties saved successfully!", 
            specialties: updatedDoctor.specialties 
        });
    } catch (error) {
        console.error("Save Specialties Error:", error);
        res.status(500).json({ message: "Failed to save specialties." });
    }
};