const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// ==========================================
// 1. GET ALL DOCTORS
// ==========================================
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Fetch Doctors Error:", error);
        res.status(500).json({ message: "Error fetching doctors", error: error.message });
    }
};
// ==========================================
// ADD NEW DOCTOR (POST)
// ==========================================
exports.addDoctor = async (req, res) => {
    try {
        console.log("📥 Incoming Doctor Data:", req.body);

        let data = req.body;

        if (!data.name || !data.speciality) {
            return res.status(400).json({ message: "Name and Speciality are strictly required." });
        }

        // 🚨 THE MASTER STROKE 🚨
        // React form ka kachra (purani IDs) ignore karo! Naya doctor matlab 100% nayi ID.
        // Hum data.licenseId aur data.email ko check hi nahi karenge ab!
        const forceNewLicense = `LIC-${Math.floor(10000 + Math.random() * 90000)}`;
        const forceNewEmail = `dr_${Date.now()}_${Math.floor(Math.random() * 1000)}@clinic.com`;

        const newDoctor = new Doctor({
            name: String(data.name).trim(),
            email: forceNewEmail,             // <-- Frontend ki email ignore kardi
            licenseId: forceNewLicense,       // <-- Frontend ki licenseId ignore kardi
            
            type: data.type ? String(data.type).toLowerCase() : 'human',
            speciality: String(data.speciality).trim(),
            qualification: data.qualification || "General",
            experience: data.experience ? Number(data.experience) : 0, 
            fee: data.fee ? Number(data.fee) : 0, 
            status: data.status ? String(data.status).toLowerCase() : 'available',
            img: data.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            bio: data.bio || "",
            room: data.room || "Room 101" 
        });

        const savedDoctor = await newDoctor.save();
        console.log("✅ Doctor Added Successfully with FORCE License:", forceNewLicense);
        res.status(201).json(savedDoctor);

    } catch (error) {
        console.error("❌ Add Doctor Error:", error);
        
        if (error.code === 11000) {
            const duplicatedKey = Object.keys(error.keyValue)[0]; 
            const duplicatedValue = error.keyValue[duplicatedKey];
            return res.status(400).json({ 
                message: `Duplicate Error: A doctor with ${duplicatedKey} = "${duplicatedValue}" already exists! Please change it.` 
            });
        }

        res.status(400).json({ message: "Failed to add doctor", error: error.message });
    }
};// ==========================================
// ==========================================
// UPDATE DOCTOR (PUT)
// ==========================================
exports.updateDoctor = async (req, res) => {
    try {
        console.log(`📥 Updating Doctor ${req.params.id}:`, req.body);
        
        let updateData = { ...req.body };

        // 🚨 THE NUCLEAR FIX 🚨
        // Update karte waqt in unique fields ko update karna hi nahi hai!
        // Isse frontend agar galat ID bhi bhejega, toh backend usko kachre ke dabbe mein daal dega.
        delete updateData.licenseId;
        delete updateData.email;

        // 🛠️ SANITIZATION FOR UPDATE:
        if (updateData.type) updateData.type = String(updateData.type).toLowerCase();
        if (updateData.status) updateData.status = String(updateData.status).toLowerCase();
        if (updateData.qualification === "") updateData.qualification = "General";

        // Number fields ko safely parse karo
        if (updateData.fee === "" || updateData.fee == null) updateData.fee = 0;
        else if (updateData.fee !== undefined) updateData.fee = Number(updateData.fee);

        if (updateData.experience === "" || updateData.experience == null) updateData.experience = 0;
        else if (updateData.experience !== undefined) updateData.experience = Number(updateData.experience);

        // Update the doctor in MongoDB
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true } 
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        console.log("✅ Doctor Updated Successfully (Ignored License/Email changes)");
        res.status(200).json(doctor);
        
    } catch (error) {
        console.error("❌ Update Doctor Error:", error);
        
        // Agar fir bhi koi raita failta hai:
        if (error.code === 11000) {
            const duplicatedKey = Object.keys(error.keyValue)[0]; 
            const duplicatedValue = error.keyValue[duplicatedKey];
            return res.status(400).json({ 
                message: `Update Failed: A doctor with ${duplicatedKey} = "${duplicatedValue}" already exists!` 
            });
        }

        res.status(400).json({ message: error.message });
    }
};
// ==========================================
// 4. DELETE DOCTOR (DELETE)
// ==========================================
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        res.status(200).json({ message: 'Doctor removed from system' });
    } catch (error) {
        console.error("❌ Delete Doctor Error:", error);
        res.status(500).json({ message: error.message });
    }
};
// ==========================================
// 1. GET ALL PATIENTS
// ==========================================
exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .sort({ createdAt: -1 })
            .setOptions({ allowDiskUse: true }); // Memory limit crash se bachne ke liye
        
        // Frontend ko .id chahiye delete function ke liye (`patient.id`)
        const formattedPatients = patients.map(p => ({
            ...p._doc,
            id: p._id // Map _id to id so your React table delete button works perfectly
        }));

        res.status(200).json(formattedPatients);
    } catch (error) {
        console.error("❌ Fetch Patients Error:", error.message);
        res.status(500).json({ message: "Failed to load patients" });
    }
};

// ==========================================
// 2. ADD NEW PATIENT
// ==========================================
exports.addPatient = async (req, res) => {
    try {
        let data = req.body;
        
        // Ensure patientId exists
        if (!data.patientId) {
            data.patientId = `PT${Date.now().toString().slice(-4)}`;
        }

        // Check if patientId already exists
        const existing = await Patient.findOne({ patientId: data.patientId });
        if (existing) {
            return res.status(400).json({ message: "Patient ID already exists. Please try again." });
        }

        // Sanitization & Default Values
        const newPatient = new Patient({
            patientId: data.patientId,
            name: data.name || "Unknown",
            type: data.type || "human",
            ownerName: data.ownerName || "",
            breed: data.breed || "",
            age: data.age || "",
            gender: data.gender || "",
            phone: data.phone || "N/A",
            address: data.address || "N/A",
            lastVisit: data.lastVisit || "",
            paid: Number(data.paid) || 0, // Convert string to Number securely
            medicalHistory: data.medicalHistory || "",
            status: data.status || "active",
            img: data.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);

    } catch (error) {
        console.error("❌ Add Patient Error:", error.message);
        res.status(400).json({ message: "Failed to add patient", error: error.message });
    }
};

// ==========================================
// 3. UPDATE PATIENT
// ==========================================
exports.updatePatient = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Ensure 'paid' is a valid number before updating
        if (updateData.paid !== undefined) {
            updateData.paid = Number(updateData.paid) || 0;
        }

        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error("❌ Update Patient Error:", error.message);
        res.status(400).json({ message: "Update failed", error: error.message });
    }
};

// ==========================================
// 4. DELETE PATIENT
// ==========================================
exports.deletePatient = async (req, res) => {
    try {
        const id = req.params.id;

        // Valid MongoDB ID format check to prevent server crash
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid Patient ID format" });
        }

        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("❌ Delete Patient Error:", error.message);
        res.status(500).json({ message: "Server Error during deletion" });
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
// ==========================================
// 🚀 GET ALL APPOINTMENTS (Safe & Optimized)
// ==========================================
exports.getAppointments = async (req, res) => {
    try {
        console.log("--- 🕵️ Admin Fetching All Appointments ---");

        // allowDiskUse(true) memory error ko solve karta hai
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .allowDiskUse(true); 

        console.log(`✅ Database se ${appointments.length} records mile.`);

        // Frontend mapping (Transforming for your Table)
        const formattedData = appointments.map(app => ({
            _id: app._id,
            doctorName: app.doctorName || "Unknown Doctor",
            speciality: app.speciality || "General",
            patientName: app.patientName || "Guest Patient",
            date: app.date || "--",
            time: app.time || "--",
            status: app.status, // Frontend boolean logic handles this
            fee: app.fee || 0,
            doctorImg: app.doctorImg || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            patImg: app.patImg || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error("❌ CRITICAL ERROR IN ADMIN GET_APPOINTMENTS:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==========================================
// 🔄 TOGGLE APPOINTMENT STATUS
// ==========================================
exports.toggleAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Status Toggle Logic
        appointment.status = appointment.status === 'Scheduled' ? 'Cancelled' : 'Scheduled';
        await appointment.save();

        console.log(`✅ Status Toggled for ${appointment.patientName}: ${appointment.status}`);
        res.status(200).json({ message: "Status Updated", status: appointment.status });

    } catch (error) {
        console.error("❌ Toggle Status Error:", error.message);
        res.status(500).json({ message: "Update Failed" });
    }
};

// ==========================================
// 🗑️ DELETE APPOINTMENT
// ==========================================
exports.deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Appointment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
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