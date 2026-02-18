const Patient = require('../models/Patient');

const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

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