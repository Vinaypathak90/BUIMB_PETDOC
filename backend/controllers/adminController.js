const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// @desc    Get all doctors
// @route   GET /api/admin/doctors
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new doctor
// @route   POST /api/admin/doctors
exports.addDoctor = async (req, res) => {
    try {
        console.log("📥 Incoming Doctor Data:", req.body);

        // Extracting fields from frontend request
        const { name, type, speciality, qualification, experience, fee, status, img, room } = req.body;

        // Basic Validation
        if (!name || !speciality) {
            return res.status(400).json({ message: "Name and Speciality are required." });
        }

        const newDoctor = new Doctor({
            name,
            type: type ? type.toLowerCase() : 'human', // Convert to lowercase for DB enum
            speciality,
            qualification: qualification || "MBBS",
            experience: experience || "0",
            fee: Number(fee) || 0,
            status: status ? status.toLowerCase() : 'available',
            img: img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            room: room || "General"
        });

        const savedDoctor = await newDoctor.save();
        console.log("✅ Doctor Added Successfully:", savedDoctor._id);
        res.status(201).json(savedDoctor);

    } catch (error) {
        console.error("❌ Add Doctor Error:", error);
        // If it's a validation error, send the exact missing field
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(400).json({ message: "Validation Failed", error: error.message });
    }
};

// @desc    Update doctor details
// @route   PUT /api/admin/doctors/:id
exports.updateDoctor = async (req, res) => {
    try {
        console.log(`📥 Updating Doctor ${req.params.id}:`, req.body);
        
        // Ensure type and status are formatted correctly before updating
        if (req.body.type) req.body.type = req.body.type.toLowerCase();
        if (req.body.status) req.body.status = req.body.status.toLowerCase();

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // runValidators ensures updated data respects Schema rules
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        console.log("✅ Doctor Updated Successfully");
        res.status(200).json(doctor);
    } catch (error) {
        console.error("❌ Update Doctor Error:", error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        await doctor.deleteOne();
        res.json({ message: 'Doctor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Error fetching patients" });
    }
};
exports.addPatient = async (req, res) => {
    try {
        const { patientId } = req.body;
        
        // Check duplicate ID
        const exists = await Patient.findOne({ patientId });
        if (exists) {
            return res.status(400).json({ message: "Patient ID already exists" });
        }

        const patient = new Patient(req.body);
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Patient Details
// @route   PUT /api/admin/patients/:id
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            // Update fields
            patient.name = req.body.name || patient.name;
            patient.phone = req.body.phone || patient.phone;
            patient.address = req.body.address || patient.address;
            patient.age = req.body.age || patient.age;
            patient.paid = req.body.paid || patient.paid;
            patient.lastVisit = req.body.lastVisit || patient.lastVisit;
            patient.img = req.body.img || patient.img;
            
            // Conditional Updates
            if(req.body.type) patient.type = req.body.type;
            if(req.body.ownerName) patient.ownerName = req.body.ownerName;
            if(req.body.breed) patient.breed = req.body.breed;
            if(req.body.gender) patient.gender = req.body.gender;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: "Patient not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete Patient Record
// @route   DELETE /api/admin/patients/:id
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            await patient.deleteOne();
            res.json({ message: "Patient removed" });
        } else {
            res.status(404).json({ message: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SPECIALIST TRACKER HANDLERS ---
// @desc    Get All Doctors for Tracker
// @route   GET /api/admin/specialists
exports.getSpecialists = async (req, res) => {
    try {
        // Hum Doctors table se data layenge
        const specialists = await Doctor.find().sort({ updatedAt: -1 });
        res.json(specialists);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tracker data" });
    }
};

// @desc    Add New Doctor (via Tracker Page)
// @route   POST /api/admin/specialists
exports.addSpecialist = async (req, res) => {
    try {
        // Agar Tracker page se add kiya, toh wo Doctor table mein save hoga
        const doctor = new Doctor({
            ...req.body,
            fee: req.body.fee || 500, // Default fee agar form mein nahi hai
            exp: "1 Yr" // Default exp
        });
        const savedDoctor = await doctor.save();
        res.status(201).json(savedDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Live Status (Busy/Available)
// @route   PUT /api/admin/specialists/:id
exports.updateSpecialist = async (req, res) => {
    try {
        // Doctor ka status update karein
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        
        res.json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete Doctor
// @route   DELETE /api/admin/specialists/:id
exports.deleteSpecialist = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        await doctor.deleteOne();
        res.json({ message: "Removed from system" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get All Appointments for Admin
// @route   GET /api/admin/appointments
exports.getAppointments = async (req, res) => {
    try {
        // Kyunki 'doctorImg' ab Appointment table mein hi hai, 
        // humein .populate() karne ki zaroorat nahi hai (Fast Performance)
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// @desc    Toggle Status
// @route   PUT /api/admin/appointments/:id/toggle
exports.toggleAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Not Found" });

        appointment.status = appointment.status === 'Scheduled' ? 'Cancelled' : 'Scheduled';
        await appointment.save();

        res.json({ message: "Status Updated", status: appointment.status });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};
exports.deleteAppointment = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("🗑️ Attempting to delete Appointment ID:", id);

        // Check if ID is valid (prevents server crash on bad IDs)
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("❌ Invalid ID format");
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Find and Delete in one step
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            console.log("⚠️ Appointment not found in Database");
            return res.status(404).json({ message: "Appointment not found" });
        }

        console.log("✅ Appointment Deleted Successfully");
        res.json({ message: "Appointment removed" });

    } catch (error) {
        console.error("🔥 Delete Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==========================================
// TRANSACTION CONTROLLERS
// ==========================================

// @desc    Get All Transactions
// @route   GET /api/admin/transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
};

// @desc    Delete Transaction
// @route   DELETE /api/admin/transactions/:id
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: "Transaction not found" });

        await transaction.deleteOne();
        res.json({ message: "Transaction removed" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

// @desc    (Optional) Add Manual Expense
// @route   POST /api/admin/transactions
exports.addTransaction = async (req, res) => {
    try {
        const { name, type, amount, flow, status, method } = req.body;
        
        const transaction = await Transaction.create({
            invoiceId: `#TRX-${Date.now().toString().slice(-4)}`,
            name,
            type,
            amount,
            flow, // 'debit' for expenses
            status: status || 'Paid',
            method: method || 'Cash',
            date: new Date()
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Get current platform settings
// @route   GET /api/admin/settings
exports.getSettings = async (req, res) => {
    try {
        // We look for the first settings document. If none exists, create default.
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (settings) {
            // Update existing settings
            settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            // Create if for some reason it doesn't exist
            settings = await Settings.create(req.body);
        }
        
        res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(400).json({ message: "Error updating settings", error: error.message });
    }
};

// @desc    Get Top Doctors and Recent Patients
// @route   GET /api/admin/dashboard-tables
exports.getDashboardTables = async (req, res) => {
    try {
        // 1. Fetch Top 5 Doctors (Sorted by Earnings)
        const topDoctors = await Doctor.find()
            .sort({ earned: -1 }) // Highest earning first
            .limit(5);

        // 2. Fetch Recent 5 Patients (Sorted by Last Visit)
        const recentPatients = await Patient.find()
            .sort({ lastVisit: -1 }) // Newest visit first
            .limit(5);

        res.json({
            doctors: topDoctors,
            patients: recentPatients
        });

    } catch (error) {
        console.error("Dashboard Table Error:", error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};
// @desc    Get Key Stats for Admin Dashboard
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (Sum of all 'credit' transactions with status 'Paid')
        const revenueAgg = await Transaction.aggregate([
            { $match: { flow: 'credit', status: 'Paid' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Counts
        const doctorCount = await Doctor.countDocuments();
        const patientCount = await Patient.countDocuments();
        const appointmentCount = await Appointment.countDocuments();

        res.json({
            revenue: totalRevenue,
            doctors: doctorCount,
            patients: patientCount,
            appointments: appointmentCount
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};

exports.getChartData = async (req, res) => {
    try {
        // Revenue by Year
        const revenueAgg = await Transaction.aggregate([
            { $match: { flow: 'credit', status: 'Paid' } },
            { $group: { _id: { $year: "$date" }, total: { $sum: "$amount" } } },
            { $sort: { _id: 1 } }
        ]);
        const revenueData = revenueAgg.map(item => ({ year: item._id.toString(), revenue: item.total }));

        // Doctor & Patient Growth (Simplified logic)
        // In a real app, you would aggregate User/Doctor models by createdAt
        const statusData = [
            { year: '2024', doctors: 5, patients: 20 },
            { year: '2025', doctors: 12, patients: 45 },
            { year: '2026', doctors: 24, patients: 85 }
        ];

        res.json({ revenueData, statusData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching chart data" });
    }
};
