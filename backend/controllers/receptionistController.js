const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const bcrypt = require('bcryptjs');
// ==========================================
// 1. GET ALL PATIENTS (For List View)
// ==========================================
exports.getAllPatients = async (req, res) => {
    try {
        // Sort by 'updatedAt' so recently modified/added patients appear first
        const patients = await Patient.find().sort({ updatedAt: -1 });
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ message: "Database error: Could not fetch patients." });
    }
};

// ==========================================
// 2. REGISTER NEW PATIENT (Add Action)
// ==========================================
exports.registerPatient = async (req, res) => {
    try {
        console.log("📥 Incoming Patient Data:", req.body);
        const { 
            
            name, age, gender, phone, address, 
            type, ownerName, breed, medicalHistory 
        } = req.body;

        // Auto-generate ID (Format: PT + 4 random digits, e.g., PT6187)
        const patientId = `PT${Math.floor(1000 + Math.random() * 9000)}`;

        const newPatient = new Patient({
            patientId,
            name,
            age,
            gender,
            phone,
            address,
            type: type || 'human', // Default to human if not sent
            ownerName: type === 'pet' ? ownerName : '',
            breed: type === 'pet' ? breed : '',
            medicalHistory: medicalHistory || '',
            status: 'active',
            img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });

        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);

    } catch (err) {
        console.error("Save Error:", err);
        res.status(400).json({ message: "Registration failed. Please check inputs." });
    }
};

// ==========================================
// 3. SEARCH PATIENT (Filter Action)
// ==========================================
exports.searchPatient = async (req, res) => {
    const { query } = req.query;
    try {
        const results = await Patient.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query } },
                { patientId: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
};

// ==========================================
// 1. GET ALL APPOINTMENTS (Filtered by Date)
// ==========================================
exports.getAppointments = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

        // Agar date mili toh filter karo, nahi toh saare le aao
        if (date) {
            query.date = date;
        }

        // Time ke hisaab se sort karke bhejo
        const appointments = await Appointment.find(query).sort({ time: 1 });
        
        res.status(200).json(appointments);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: "Appointments load nahi huye." });
    }
};

// ==========================================
// 2. BOOK NEW APPOINTMENT (Receptionist)
// ==========================================
exports.bookAppointment = async (req, res) => {
    try {
        // Frontend se jo data aa raha hai
        const { name, contact, date, time, doctor, type, reason } = req.body;

        // Naya appointment create karo
        const newAppointment = new Appointment({
            // Receptionist booking mein 'user' field khali rahega (kyunki yeh walk-in hai)
            
            patientName: name,      
            phone: contact,         // Schema mein 'phone' required hai
            address: "Clinic Visit", // Default address daal rahe hain taaki validation pass ho
            
            doctorName: doctor,     // Doctor ka naam string mein save kar rahe hain
            
            date,
            time,
            // Automatic Day Calculation (e.g., 'Monday')
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),

            type: type || 'Walk-in', // Agar type nahi aaya to default Walk-in
            status: 'Waiting',       // Walk-in patient pehle waiting mein jayega
            
            problem: reason || "General Visit",
            paymentStatus: 'Pending'
        });

        const savedAppt = await newAppointment.save();
        res.status(201).json(savedAppt);

    } catch (err) {
        console.error("Booking Error:", err.message);
        res.status(400).json({ message: "Booking Failed: " + err.message });
    }
};

// ==========================================
// 3. UPDATE STATUS (Check-in / Cancel)
// ==========================================
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedAppt = await Appointment.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true } // runValidators ensures enum check
        );

        if (!updatedAppt) {
            return res.status(404).json({ message: "Appointment nahi mila." });
        }

        res.status(200).json(updatedAppt);

    } catch (err) {
        res.status(500).json({ message: "Status update fail ho gaya." });
    }
};

// 4. GET ALL DOCTORS LIST (For Dropdown)
exports.getDoctorsList = async (req, res) => {
    try {
        // Humein sirf Naam, ID aur Speciality chahiye
        const doctors = await Doctor.find({}).select('name speciality _id');
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ message: "Doctors list load nahi huyi" });
    }
};

// 5. GET LIVE QUEUE STATUS
exports.getLiveQueue = async (req, res) => {
    try {
        // 1. Find who is currently inside with the doctor
        const currentPatient = await Appointment.findOne({ 
            status: 'With Doctor',
            date: new Date().toISOString().split('T')[0] // Only today
        }).select('patientName token doctorName time type');

        // 2. Find who is waiting (Sorted: Emergency first, then by Time)
        const waitingQueue = await Appointment.find({
            status: { $in: ['Checked-in', 'Waiting'] },
            date: new Date().toISOString().split('T')[0]
        }).sort({ type: 1, time: 1 }); // 'Emergency' comes before 'Walk-in' alphabetically, or use custom sort logic if needed

        res.status(200).json({
            current: currentPatient,
            queue: waitingQueue
        });

    } catch (err) {
        res.status(500).json({ message: "Queue data fetch failed" });
    }
};

// --- 1. GET DOCTORS LIST (For Dropdown) ---
exports.getDoctorsList = async (req, res) => {
    try {
        // We need Name, Specialty, and Fee for the dropdown logic
        const doctors = await Doctor.find({}).select('name speciality fee');
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ message: "Failed to load doctors" });
    }
};

// --- 2. BOOK WALK-IN APPOINTMENT ---
// ==========================================
// 6. BOOK WALK-IN (New Registration Form) ✅ FIX HERE
// ==========================================
exports.bookWalkIn = async (req, res) => {
    try {
        const { 
            name, age, gender, contact, address, 
            appointmentFor, doctor, symptoms, diseases, 
            consultationFee, type, priority 
        } = req.body;

        // Generate Random Token
        const tokenNumber = `T-${Math.floor(100 + Math.random() * 900)}`;

        const newAppt = new Appointment({
            // ✅ FIX 1: Map 'contact' (Frontend) to 'phone' (Schema)
            phone: contact, 
            
            patientName: name,
            age,
            gender,
            address,
            contact, // (Optional: Backup field)
            
            problem: appointmentFor,
            doctorName: doctor,
            symptoms: symptoms + (diseases ? ` (History: ${diseases})` : ""),
            
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            
            // ✅ FIX 2: Convert "Human" -> "human"
            type: type ? type.toLowerCase() : 'walk-in', 
            
            // ✅ FIX 3: Default Priority
            priority: priority || 'Normal',
            
            amount: consultationFee,
            paymentStatus: 'Paid',
            status: 'Waiting',
            token: tokenNumber
        });

        await newAppt.save();
        res.status(201).json(newAppt);

    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ message: "Registration failed: " + err.message });
    }
};
// ==========================================
// 7. GET DAILY REPORTS (Stats & Charts)
// ==========================================
exports.getDailyReport = async (req, res) => {
    try {
        // 1. Define "Today's" Time Range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Fetch Today's Appointments & Invoices
        const appointments = await Appointment.find({
            date: new Date().toISOString().split('T')[0] // Match string date YYYY-MM-DD
        });

        const invoices = await Invoice.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // 3. CALCULATE SUMMARY METRICS
        const served = appointments.filter(a => ['Completed', 'Checked-in', 'With Doctor'].includes(a.status)).length;
        const noShows = appointments.filter(a => ['Cancelled', 'No-Show'].includes(a.status)).length;
        
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

        // 4. CALCULATE HOURLY TRAFFIC
        // Initialize 9 AM to 5 PM with 0
        let hourlyMap = { "09": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0 };
        
        appointments.forEach(app => {
            if (app.time) {
                // Assuming time is "09:30 AM" or "14:00" -> extract hour
                const hour = app.time.split(':')[0]; 
                // Normalize 12-hour format if needed, but assuming standard storage
                if (hourlyMap[hour] !== undefined) hourlyMap[hour]++;
            }
        });

        // Find Peak Hour
        const peakHourKey = Object.keys(hourlyMap).reduce((a, b) => hourlyMap[a] > hourlyMap[b] ? a : b);
        const peakHourVal = hourlyMap[peakHourKey];
        const peakHourLabel = `${peakHourKey}:00 - ${parseInt(peakHourKey)+1}:00`;

        // Format for Frontend Bar Chart
        const hourlyTraffic = Object.keys(hourlyMap).map(hour => ({
            time: `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`,
            count: hourlyMap[hour]
        }));

        // 5. CALCULATE STATUS BREAKDOWN
        const statusCounts = {
            'Served': served,
            'Waiting': appointments.filter(a => a.status === 'Waiting').length,
            'No-Show': noShows
        };

        res.status(200).json({
            summary: {
                served,
                noShows,
                revenue: totalRevenue,
                peakHour: peakHourVal > 0 ? peakHourLabel : "No Data"
            },
            hourlyTraffic,
            statusCounts
        });

    } catch (err) {
        console.error("Report Error:", err);
        res.status(500).json({ message: "Failed to generate report." });
    }
};

// ==========================================
// 1. GET PROFILE (Name changed as requested)
// ==========================================
// ==========================================
// 1. GET PROFILE & DYNAMIC STATS
// ==========================================
exports.getReceptionistList = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id; 
        
        // 1. Fetch User Profile
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found in Database' });
        }

        // 2. Calculate Dynamic Stats
        // A. Total Patients Registered (Jo receptionist ne walk-in se add kiye)
        // Agar aapke paas Patient model alag hai, toh usko count karo. Abhi ke liye hum appointments ke unique numbers count kar sakte hain ya total appointments.
        const totalAppointments = await Appointment.countDocuments();
        
        // B. Appointments Booked Today (Aaj ke kitne bookings the)
        const todayString = new Date().toISOString().split('T')[0];
        const todayAppointments = await Appointment.countDocuments({ date: todayString });

        // C. Calculate Hours Logged (Basic logic: User kab bana tha wahan se days nikal kar * 8 hours)
        const joinDate = new Date(user.createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const hoursLogged = diffDays * 8; // Assuming 8 hours shift per day since joining

        // Generate dynamic employee ID if empty
        const dynamicEmpId = user.empId || `EMP-${user._id.toString().slice(-4).toUpperCase()}`;

        res.status(200).json({
            // User Data
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "", 
            address: user.address || "",
            role: user.role,
            empId: dynamicEmpId,
            status: user.status || "Online",
            joinDate: user.createdAt,
            
            // Stats Data
            stats: {
                totalRegistered: totalAppointments, // Ya Patient.countDocuments() agar alag model hai
                appointmentsBooked: todayAppointments,
                hoursLogged: `${hoursLogged}h`
            }
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
// ==========================================
// 2. UPDATE PERSONAL INFO
// ==========================================
exports.updateReceptionistProfile = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        user.name = req.body.name || user.name;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        user.address = req.body.address !== undefined ? req.body.address : user.address;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile Updated Successfully",
            user: {
                name: updatedUser.name,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Update failed' });
    }
};

// ==========================================
// 3. CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id || req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.status(200).json({ message: 'Password updated successfully. Please login again if needed.' });

    } catch (error) {
        console.error("Password Change Error:", error);
        res.status(500).json({ message: 'Password update failed' });
    }
};