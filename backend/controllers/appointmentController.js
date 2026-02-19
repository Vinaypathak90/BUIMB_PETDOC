const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction'); // 👈 Import Transaction Model

// @desc    Get details of the most recent appointment
// @route   GET /api/appointments/latest
exports.getLatestAppointment = async (req, res) => { 
    try {
        const userId = req.user.id;

        // Find the most recent appointment for this user
        const latestAppointment = await Appointment.findOne({ user: userId })
            .sort({ createdAt: -1 }); // Sort by newest first

        if (!latestAppointment) {
            return res.status(404).json({ message: 'No appointments found' });
        }

        res.json(latestAppointment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all doctors (with optional search)
// @route   GET /api/appointments/doctors
exports.getDoctors = async (req, res) => { 
    try {
        const { speciality } = req.query;
        let query = {};

        // If user searches "Dentist", filter by that
        if (speciality) {
            query.speciality = { $regex: speciality, $options: 'i' }; // Case insensitive
        }

        const doctors = await Doctor.find(query);
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new appointment & Generate Transaction
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
    try {
        // 🚨 DEBUG: Ye terminal mein print karega ki frontend ne kya data bheja hai
        console.log("📥 Incoming Booking Request:", req.body); 

        const userId = req.user.id;
        const { doctor, formData, bookingType } = req.body; 

        // Safe Fallbacks (Agar frontend galti se 'undefined' bhej de)
        const doc = doctor || {};
        const data = formData || {};

        // 1. Create the Appointment (With Sanitization)
        const appointment = await Appointment.create({
            user: userId,
            // Handle both _id and id format from frontend
            doctorId: doc._id || doc.id, 
            doctorName: doc.name || "Unknown Doctor",
            speciality: doc.speciality || "General",
            doctorImg: doc.img || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            fee: Number(doc.fee) || 0,

            // Patient Info (Handling missing fields)
            patientName: bookingType === 'pet' ? (data.petName || data.name || "Unknown") : (data.name || "Unknown"),
            age: data.age || "0",
            gender: data.gender || "Not Specified",
            
            // 🚨 SCHEMA REQUIRED FIELDS (Default values added to prevent 500 crash)
            phone: data.phone || "N/A", 
            address: data.address || "N/A", 
            date: data.date || new Date().toISOString().split('T')[0], 
            time: data.time || "00:00", 

            type: bookingType || 'walk-in',
            petName: data.petName || "",
            petType: data.petType || "",
            
            // Appointment Details
            problem: data.problem || "",
            symptoms: data.symptoms || "",
            medicalReport: data.medicalReport || "", 
            day: data.day || "",
            
            status: 'Scheduled',
            paymentStatus: 'Paid'
        });

        // 2. AUTOMATICALLY CREATE TRANSACTION (Safely Wrapped)
       try {
            // Agar frontend galti se fee bhejna bhool jaye, toh fallback 500 set karega (Zero nahi hoga)
            const transactionAmount = Number(doc.fee) || Number(doc.price) || 500;

            await Transaction.create({
                user: userId, // 👈 Ye ensure karega ki ye sirf aapko dikhe
                invoiceId: `INV-${Date.now().toString().slice(-5)}`, 
                name: data.name || data.petName || req.user.name || "Patient Booking", 
                type: "Consultation", 
                flow: "credit", 
                doctorName: doc.name || "Unknown Doctor",
                service: doc.speciality || "Consultation",
                amount: transactionAmount, // 👈 FIXED AMOUNT HERE
                status: 'Paid', 
                method: 'Credit Card', 
                date: new Date()
            });
            console.log(`✅ Transaction Saved Successfully! Amount: ₹${transactionAmount}`);
        } catch (trxError) {
            console.error("⚠️ Transaction Failed to Save:", trxError.message);
        }

        console.log("✅ Appointment successfully booked!");
        res.status(201).json(appointment);

    } catch (error) {
        console.error("❌ Booking Error:", error); 
        
        // Agar validation error hai, toh exact field ka naam frontend ko bhejo
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Missing Fields: " + messages.join(', ') });
        }

        res.status(500).json({ message: 'Booking failed: ' + error.message });
    }
};

// @desc    Get all appointments for the logged-in user
// @route   GET /api/appointments/my-history
// @desc    Get all appointments for the logged-in user
// @route   GET /api/appointments/my-history
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`--- Fetching History for User: ${userId} ---`);

        // ✅ FIX 1: Sort by 'createdAt' (Kyunki humne is par Index lagaya hai, ye fast aur safe hai)
        // ✅ FIX 2: Use .setOptions() instead of direct .allowDiskUse()
        const appointments = await Appointment.find({ user: userId })
            .populate('doctorId', 'name speciality img fee') 
            .sort({ createdAt: -1 }) 
            .setOptions({ allowDiskUse: true }); 

        if (!appointments || appointments.length === 0) {
            return res.status(200).json([]); // Khali array bhejo taaki frontend crash na ho
        }

        res.json(appointments);
    } catch (error) {
        console.error("❌ Error fetching history:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Seed Dummy Doctors (Run this once to populate DB)
// @route   POST /api/appointments/seed
exports.seedDoctors = async (req, res) => {
    try {
        const doctors = [
            { name: "Dr. Ruby Perrin", speciality: "Dentist", fee: 500, exp: "10 Yrs", rating: 4.8, img: "https://randomuser.me/api/portraits/women/44.jpg" },
            { name: "Dr. Darren Elder", speciality: "Pet Surgery", fee: 800, exp: "8 Yrs", rating: 4.9, img: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Dr. Deborah Angel", speciality: "Cardiology", fee: 1200, exp: "15 Yrs", rating: 5.0, img: "https://randomuser.me/api/portraits/women/68.jpg" },
            { name: "Dr. Sofia Brient", speciality: "Urology", fee: 600, exp: "5 Yrs", rating: 4.5, img: "https://randomuser.me/api/portraits/women/65.jpg" },
            { name: "Dr. Marvin Campbell", speciality: "Pet Orthopedics", fee: 750, exp: "12 Yrs", rating: 4.7, img: "https://randomuser.me/api/portraits/men/51.jpg" },
        ];
        
        await Doctor.deleteMany(); // Clear old data
        await Doctor.insertMany(doctors);
        
        res.json({ message: 'Doctors seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get All Live Specialists
// @route   GET /api/admin/specialists
exports.getSpecialists = async (req, res) => {
    try {
        // Sort by status to show 'busy' ones first or last as needed
        const specialists = await Specialist.find().sort({ updatedAt: -1 });
        res.json(specialists);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tracker data" });
    }
};

// @desc    Add Specialist to Tracker
// @route   POST /api/admin/specialists
exports.addSpecialist = async (req, res) => {
    try {
        const specialist = new Specialist(req.body);
        const savedSpecialist = await specialist.save();
        res.status(201).json(savedSpecialist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Live Status (Task, Location, Time)
// @route   PUT /api/admin/specialists/:id
exports.updateSpecialist = async (req, res) => {
    try {
        const specialist = await Specialist.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Return updated document
        );
        
        if (!specialist) return res.status(404).json({ message: "Specialist not found" });
        
        res.json(specialist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove from Tracker
// @route   DELETE /api/admin/specialists/:id
exports.deleteSpecialist = async (req, res) => {
    try {
        const specialist = await Specialist.findById(req.params.id);
        if (!specialist) return res.status(404).json({ message: "Specialist not found" });

        await specialist.deleteOne();
        res.json({ message: "Removed from tracker" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
