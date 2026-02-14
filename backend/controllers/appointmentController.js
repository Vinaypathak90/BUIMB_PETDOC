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
        const userId = req.user.id;
        const { doctor, formData, bookingType } = req.body; 

        // 1. Create the Appointment
        const appointment = await Appointment.create({
            user: userId,

            // Save the referenced doctor using the schema field 'doctorId'
            doctorId: doctor._id,
            
            // Snapshot Data
            doctorName: doctor.name,
            speciality: doctor.speciality,
            doctorImg: doctor.img,
            fee: doctor.fee,

            // Patient Info
            patientName: bookingType === 'pet' ? formData.petName : formData.name,
            age: formData.age,
            gender: formData.gender,
            phone: formData.phone,
            address: formData.address,
            type: bookingType,
            petName: formData.petName,
            petType: formData.petType,
            
            // Appointment Details
            problem: formData.problem,
            symptoms: formData.symptoms,
            medicalReport: formData.medicalReport, // ✅ Saves Base64 string

            date: formData.date,
            day: formData.day,
            time: formData.time,
            
            status: 'Scheduled',
            paymentStatus: 'Paid'
        });

        // 2. ✅ AUTOMATICALLY CREATE TRANSACTION
        // This ensures the amount shows in "Total Spent" and "Transaction History"
        await Transaction.create({
            user: userId,
            invoiceId: `INV-${Date.now()}`, // Generate unique ID
            doctorName: doctor.name,
            service: doctor.speciality || "Consultation",
            amount: doctor.fee,
            status: 'Paid', // Marked as Paid so it counts in Total Spent
            method: 'Credit Card •••• 4242', // Default method for now
            date: new Date()
        });

        res.status(201).json(appointment);

    } catch (error) {
        console.error("Booking Error:", error); 
        res.status(500).json({ message: 'Booking failed: ' + error.message });
    }
};

// @desc    Get all appointments for the logged-in user
// @route   GET /api/appointments/my-history
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch appointments and sort by most recent first
        // ✅ Populating 'doctor' works now because we fixed the field name in createAppointment
        const appointments = await Appointment.find({ user: userId })
            // Populate the actual schema field 'doctorId' and use the Doctor model's 'img' field
            .populate('doctorId', 'name speciality img fee') 
            .sort({ date: -1, time: -1 });

        if (!appointments) {
            return res.status(404).json({ message: 'No appointments found' });
        }

        res.json(appointments);
    } catch (error) {
        console.error("Error fetching history:", error);
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
