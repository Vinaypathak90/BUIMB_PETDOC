const Profile = require('../models/Profile');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const Vitals = require('../models/Vitals');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');


// @desc    Get all user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Profile
        let profile = await Profile.findOne({ user: userId });
        
        // 2. Get Appointments (Limit 3 sorted by date)
        const appointments = await Appointment.find({ user: userId }).sort({ createdAt: -1 }).limit(3);

        // 3. Get Reports (Limit 3)
        const reports = await Report.find({ user: userId }).sort({ createdAt: -1 }).limit(3);

        // 4. Get Vitals (Create default if not exists)
        let vitals = await Vitals.findOne({ user: userId });
        if (!vitals) {
            vitals = await Vitals.create({ user: userId }); // Create default 
        }

        res.json({
            profile: profile || null, // Send null if profile doesn't exist yet
            appointments,
            reports,
            vitals
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Create or Update Profile
// @route   POST /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = { ...req.body, user: userId };

        // Upsert: Update if exists, Create if not
        const profile = await Profile.findOneAndUpdate(
            { user: userId },
            profileData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Update Failed: ' + error.message });
    }
};
exports.bookAppointment = async (req, res) => {
    try {
        const { 
            doctorId, 
            patientName, age, gender, phone, address, 
            type, petName, petType, 
            problem, symptoms, medicalReport, 
            date, day, time 
        } = req.body;

        const userId = req.user.id; // Logged in user

        // 1. FETCH DOCTOR DETAILS (To get Image & Fee)
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // 2. SYNC PATIENT (Auto Create/Update in 'patients' table)
        // Check if patient exists using Name + Phone
        let patient = await Patient.findOne({ name: patientName, phone: phone });

        if (!patient) {
            // Create New Patient Record
            const newPatientId = `PT${Date.now().toString().slice(-6)}`;
            
            patient = await Patient.create({
                patientId: newPatientId,
                name: patientName,
                type: type === 'pet' ? 'pet' : 'human',
                ownerName: type === 'pet' ? (req.user.name || "Self") : "", 
                breed: petType || "",
                age: age || "",
                gender: gender || "",
                phone: phone,
                address: address,
                img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Default Avatar
                lastVisit: date,
                status: 'active'
            });
        } else {
            // Update Existing Patient Visit
            patient.lastVisit = date;
            await patient.save();
        }

        // 3. CREATE APPOINTMENT (With Doctor Image Linked)
        const appointment = new Appointment({
            user: userId,
            patientId: patient._id, // Link to Patient Table
            doctorId: doctor._id,   // Link to Doctor Table

            // Snapshot Data (Saved permanently for this appointment)
            doctorName: doctor.name,
            speciality: doctor.speciality,
            doctorImg: doctor.img, // ✅ Image from Doctor Table
            fee: doctor.fee,

            // Patient Data
            patientName, age, gender, phone, address,
            type, petName, petType,
            patImg: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",

            // Medical & Schedule
            problem, symptoms, medicalReport,
            date, day, time,
            amount: doctor.fee, // Ensure amount is saved
            
            status: 'Scheduled',
            paymentStatus: 'Paid'
        });

        await appointment.save();

        res.status(201).json({ 
            message: 'Appointment Booked Successfully', 
            appointment 
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Booking Failed', error: error.message });
    }
};
/*
// ✅ AUTO-CREATE TRANSACTION (INCOME)
await Transaction.create({
    invoiceId: `#INV-${Date.now().toString().slice(-6)}`,
    name: patientName, // The user paying
    type: "Consultation Fee",
    amount: doctor.fee, // Fee from Doctor Model
    flow: "credit",     // Income
    status: "Paid",
    method: "Credit Card",
    date: new Date()
});
*/
// ==========================================
// 1. GET ADMIN PROFILE
// ==========================================
// @route   GET /api/user/admin-profile
exports.getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 2. UPDATE ADMIN PROFILE
// ==========================================
// @route   PUT /api/user/admin-profile
exports.updateAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Update fields if present in body
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.dob = req.body.dob || user.dob;
            user.address = req.body.address || user.address;
            user.bio = req.body.bio || user.bio;
            user.img = req.body.img || user.img;
            user.cover = req.body.cover || user.cover;

            // Mark profile complete if critical fields exist
            if (user.phone && user.address) {
                user.isProfileComplete = true;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                img: updatedUser.img,
                isProfileComplete: updatedUser.isProfileComplete,
                token: req.token // If you want to refresh token (optional)
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update failed" });
    }
};

// ==========================================
// 3. GET ALL ADMINS (For Team Tab)
// ==========================================
// @route   GET /api/user/admins
exports.getAdmins = async (req, res) => {
    try {
        // Find all users where role is 'admin' (excluding password)
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching team" });
    }
};

// ==========================================
// 4. UPDATE PASSWORD
// ==========================================
// @route   PUT /api/user/update-password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify Current Password
        // Note: We use bcrypt.compare directly here because user.password is hashed
        // but user found via findById doesn't have the matchPassword method available 
        // unless you explicitly load the schema methods or use user instance.
        // The method defined in schema works on the instance 'user'.
        const isMatch = await user.matchPassword(currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Update to New Password (pre-save middleware handles hashing)
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
