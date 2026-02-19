const Appointment = require('../models/Appointment');
const User = require('../models/User'); // We use User model for Doctors

// ==========================================
// 1. GET ALL DASHBOARD DATA
// ==========================================
exports.getDashboardData = async (req, res) => {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // 1. Fetch Today's Appointments
        const appointments = await Appointment.find({ date: today }).sort({ createdAt: -1 });

        // 2. Fetch Doctors (Users with role 'doctor')
        const doctors = await User.find({ role: 'doctor' });

        // 3. Calculate Live Stats
        const total = appointments.length;
        const waiting = appointments.filter(a => a.status === 'Waiting' || a.status === 'Checked In').length;
        const cancelled = appointments.filter(a => a.status === 'Cancelled' || a.status === 'No-Show').length;
        
        // Count doctors who are 'Available'
        const activeDoctors = doctors.filter(d => 
            d.status && d.status.toLowerCase() === 'available'
        ).length;
        
        // Calculate total revenue for today
        const revenue = appointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

        // 4. Format Appointments for Frontend
        const formattedAppointments = appointments.map(appt => ({
            id: appt._id,
            name: appt.patientName,
            doctor: appt.doctorName,
            time: appt.time,
            type: appt.type,
            status: appt.status,
            priority: appt.priority,
            token: appt.token || "--",
            amount: appt.amount,
            checkInTime: appt.checkInTime || null
        }));

        // 5. Format Doctors for Frontend
        const formattedDoctors = doctors.map(doc => ({
            id: doc._id,
            name: doc.name,
            dept: doc.speciality || "General",
            room: doc.room || "101", // Assuming you might add 'room' to User schema later
            status: doc.status || "Available",
            avatar: doc.name.charAt(0).toUpperCase() // Initials for Avatar
        }));

        // Send combined response
        res.status(200).json({
            stats: { total, waiting, cancelled, doctors: activeDoctors, revenue },
            appointments: formattedAppointments,
            doctors: formattedDoctors
        });

    } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        res.status(500).json({ message: "Failed to load dashboard data" });
    }
};

// ==========================================
// 2. UPDATE APPOINTMENT STATUS (Check-In)
// ==========================================

exports.updateAppointmentStatus = async (req, res) => {
    try {
        console.log(`--- 🔄 UPDATING APPOINTMENT: ${req.params.id} ---`);
        console.log("Payload received:", req.body);
        
        const { status, checkInTime } = req.body;
        
        const updatedAppt = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status, checkInTime }, 
            { new: true } // Returns the updated document
        );

        if (!updatedAppt) {
            console.log("❌ Appointment not found in Database!");
            return res.status(404).json({ message: "Appointment not found" });
        }

        console.log("✅ Appointment Updated Successfully!");
        res.status(200).json({ message: "Status updated", appointment: updatedAppt });
    } catch (err) {
        console.error("❌ CRITICAL ERROR in updateAppointmentStatus:", err);
        res.status(500).json({ message: "Failed to update status: " + err.message });
    }
};

// ==========================================
// 3. DELETE APPOINTMENT
// ==========================================
exports.deleteAppointment = async (req, res) => {
    try {
        const appt = await Appointment.findByIdAndDelete(req.params.id);
        if (!appt) return res.status(404).json({ message: "Appointment not found" });

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete appointment" });
    }
};

// ==========================================
// 4. UPDATE DOCTOR STATUS (Available/Busy/Break)
// ==========================================
exports.updateDoctorStatus = async (req, res) => {
    try {
        console.log(`--- 👨‍⚕️ UPDATING DOCTOR STATUS: ${req.params.id} ---`);
        console.log("Payload received:", req.body);

        const { status } = req.body;

        const updatedDoctor = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedDoctor) {
            console.log("❌ Doctor not found in Database!");
            return res.status(404).json({ message: "Doctor not found" });
        }

        console.log("✅ Doctor Status Updated Successfully!");
        res.status(200).json({ message: "Doctor status updated", doctor: updatedDoctor });
    } catch (err) {
        console.error("❌ CRITICAL ERROR in updateDoctorStatus:", err);
        res.status(500).json({ message: "Failed to update doctor status: " + err.message });
    }
};