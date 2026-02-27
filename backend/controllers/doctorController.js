const Doctor = require('../models/Doctor');
const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


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
// =========================================================================
// 🩺 SECTION 8: DOCTOR APPOINTMENTS & CONSULTATION
// =========================================================================

// 1. Fetch All Appointments for Logged-in Doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ 
            $or: [ { email: req.user.email }, { userId: req.user._id } ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        const appointments = await Appointment.find({ doctorId: doctor._id }).sort({ date: 1, time: 1 });

        const formattedAppointments = appointments.map(app => {
            let uiStatus = app.status;
            if (app.status === 'Scheduled') uiStatus = 'Upcoming';
            if (app.status === 'Waiting') uiStatus = 'Pending';

            return {
                id: app._id,
                patientName: app.type === 'pet' ? (app.petName || app.patientName) : app.patientName,
                type: app.visitType || 'Clinic',
                age: app.age || 'N/A',
                gender: app.gender || 'N/A',
                date: app.date,
                time: app.time,
                status: uiStatus,
                email: "N/A", 
                phone: app.phone,
                symptoms: app.symptoms || "Checkup",
                purpose: app.problem || app.speciality,
                address: app.address || "N/A",
                meetingLink: app.meetingLink || "meet.google.com/xyz-demo",
                token: app.token || `A-${app._id.toString().slice(-3).toUpperCase()}`,
                room: app.room || doctor.room || "101",
                img: app.type === 'pet' ? "https://cdn-icons-png.flaticon.com/512/2950/2950648.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            };
        });

        res.status(200).json(formattedAppointments);
    } catch (error) {
        console.error("Fetch Appointments Error:", error);
        res.status(500).json({ message: "Failed to fetch appointments." });
    }
};

// 2. End Consultation & Save Prescription
exports.completeConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { vitals, clinicalNotes, medications } = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            {
                status: 'Completed',
                prescription: { vitals, clinicalNotes, medications }
            },
            { new: true }
        );

        if (!updatedAppointment) return res.status(404).json({ message: "Appointment not found." });

        res.status(200).json({ message: "Consultation ended and Prescription saved!", appointment: updatedAppointment });
    } catch (error) {
        console.error("Complete Consultation Error:", error);
        res.status(500).json({ message: "Failed to save prescription." });
    }
};

// 🚨 3. Update Appointment Status (Cancel / Approve) -> YEH MISSING THA! 🚨
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const appointment = await Appointment.findByIdAndUpdate(
            id, 
            { status: status }, 
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: "Appointment not found." });

        res.status(200).json({ message: "Status updated successfully", status: appointment.status });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Failed to update status." });
    }
};


// =========================================================================
// 🟡 SECTION 3: PATIENT MANAGEMENT (MY PATIENTS)
// =========================================================================

/// 1. Fetch all Patients (Merged from Appointments + Manual Entries)
exports.getDoctorPatients = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ $or: [ { email: req.user.email }, { userId: req.user._id } ] });
        if (!doctor) return res.status(404).json({ message: "Doctor not found." });

        // Fetch Doctor's Data
        const doctorAppointments = await Appointment.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
        const doctorTransactions = await Transaction.find({ doctorName: doctor.name }).sort({ createdAt: -1 });
        const manualPatients = await Patient.find().sort({ createdAt: -1 });

        // Use a Map to ensure unique patients (Key: Phone number or Name)
        const patientMap = new Map();

        // Step A: Load Manually Added Patients
        manualPatients.forEach(p => {
            patientMap.set(p.phone || p.name, {
                id: p.patientId, // Custom ID like PT1234
                _id: p._id,      // MongoDB ID
                name: p.name,
                age: p.age || "N/A",
                gender: p.gender || "N/A",
                bloodGroup: "O+", 
                phone: p.phone,
                email: "N/A",
                location: p.address || "Unknown Location",
                img: p.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff`,
                status: p.status === 'active' ? 'Active' : 'Inactive',
                isManual: true,
                records: p.records || [] // External records saved manually
            });
        });

        // Step B: Load Patients from Appointments (Who are not in manual list)
        doctorAppointments.forEach(app => {
            const key = app.phone || app.patientName;
            if (!patientMap.has(key)) {
                patientMap.set(key, {
                    id: `APT-${app._id.toString().slice(-5).toUpperCase()}`, // Auto ID for UI
                    _id: app._id,
                    name: app.type === 'pet' ? (app.petName || app.patientName) : app.patientName,
                    age: app.age || "N/A",
                    gender: app.gender || "N/A",
                    bloodGroup: "Unknown",
                    phone: app.phone || "N/A",
                    email: "N/A",
                    location: app.address || "Unknown Location",
                    img: app.type === 'pet' ? "https://cdn-icons-png.flaticon.com/512/2950/2950648.png" : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.patientName)}&background=random&color=fff`,
                    status: 'Active',
                    isManual: false,
                    records: []
                });
            }
        });

        // Step C: Process each unique patient (Attach History, Vitals, Bills, Records)
        const formattedPatients = Array.from(patientMap.values()).map(p => {
            
            // 1. History
            const patHistory = doctorAppointments.filter(app => app.phone === p.phone || app.patientName === p.name);
            const mappedHistory = patHistory.map(app => ({
                id: app._id,
                date: app.date,
                time: app.time,
                purpose: app.problem || app.speciality || "Consultation",
                type: app.visitType || app.type || "Clinic",
                status: app.status,
                fee: app.fee
            }));

            // 2. Vitals (From the latest completed appointment)
            const completedApps = patHistory.filter(a => a.status === 'Completed' && a.prescription && a.prescription.vitals);
            let latestVitals = { bp: "-", heartRate: "-", glucose: "-", temp: "-" };
            
            if (completedApps.length > 0) {
                const latest = completedApps[0].prescription.vitals; // latest first
                latestVitals = { bp: latest.bp || "-", heartRate: latest.pulse || "-", glucose: "-", temp: latest.temp || "-" };
            }

            // 3. Bills
            const bills = doctorTransactions.filter(b => b.name === p.name || b.phone === p.phone);
            const mappedBills = bills.map(b => ({
                id: b.invoiceId,
                date: new Date(b.date || b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                amount: b.amount,
                status: b.status
            }));
            const totalPaid = bills.filter(b => b.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // 4. Records (Merge Manual Records with Completed Appointment Prescriptions)
            const autoRecords = completedApps.map(app => ({
                id: app._id,
                date: app.date,
                title: `Prescription: ${app.problem || 'Checkup'}`,
                type: "Rx",
                doctor: doctor.name,
                details: app.prescription // This allows UI to show full Rx details
            }));

            const allRecords = [...(p.records || []), ...autoRecords];

            return {
                ...p,
                lastVisit: patHistory.length > 0 ? patHistory[0].date : "New Patient",
                totalPaid,
                vitals: latestVitals,
                history: mappedHistory,
                bills: mappedBills,
                records: allRecords
            };
        });

        // Sort latest active patients first
        formattedPatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

        res.status(200).json(formattedPatients);
    } catch (error) {
        console.error("Fetch Patients Error:", error);
        res.status(500).json({ message: "Failed to fetch patients.", error: error.message });
    }
};

// 2. Add a new Patient Manually by Doctor
exports.addDoctorPatient = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, age, gender, bloodGroup, location } = req.body;
        const generatedPatientId = `PT${Math.floor(Math.random() * 10000)}${Date.now().toString().slice(-3)}`;

        const newPatient = new Patient({
            patientId: generatedPatientId,
            name: `${firstName} ${lastName}`.trim(),
            type: 'human', 
            phone, age, gender, 
            address: location,
            lastVisit: "Just Added",
            status: 'active'
        });

        await newPatient.save();
        
        res.status(201).json({ 
            message: "Patient added!", 
            patient: {
                id: newPatient.patientId, 
                _id: newPatient._id,
                name: newPatient.name, 
                age: newPatient.age,
                gender: newPatient.gender, 
                bloodGroup: bloodGroup || "O+",
                phone: newPatient.phone, 
                email: email || "N/A",
                location: newPatient.address,
                img: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPatient.name)}&background=random&color=fff`,
                lastVisit: newPatient.lastVisit, 
                totalPaid: 0, 
                status: 'Active',
                vitals: { bp: "-", heartRate: "-", glucose: "-", temp: "-" },
                history: [], bills: [], records: [],
                isManual: true
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add patient.", error: error.message });
    }
};

// 3. Delete a Patient (Manual only)
exports.deleteDoctorPatient = async (req, res) => {
    try {
        const { id } = req.params;
        
        let patient = await Patient.findOneAndDelete({ patientId: id });
        if (!patient && id.match(/^[0-9a-fA-F]{24}$/)) {
            patient = await Patient.findByIdAndDelete(id);
        }

        if (!patient) return res.status(404).json({ message: "Patient not found in records." });

        res.status(200).json({ message: "Patient deleted successfully." });
    } catch (error) {
        console.error("Delete Patient Error:", error);
        res.status(500).json({ message: "Failed to delete patient.", error: error.message });
    }
};

// 4. Update an existing Patient (Manual entries)
exports.updateDoctorPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, email, age, gender, bloodGroup, location } = req.body;

        const updateData = {
            name: `${firstName} ${lastName}`.trim(),
            phone,
            age,
            gender,
            address: location
        };

        let patient = await Patient.findOneAndUpdate(
            { patientId: id },
            { $set: updateData },
            { new: true }
        );

        if (!patient && id.match(/^[0-9a-fA-F]{24}$/)) {
            patient = await Patient.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );
        }

        if (!patient) return res.status(404).json({ message: "Patient not found." });

        res.status(200).json({ message: "Patient updated successfully.", patient });
    } catch (error) {
        console.error("Update Patient Error:", error);
        res.status(500).json({ message: "Failed to update patient.", error: error.message });
    }
};

// 5. Add External Record to Patient Profile
exports.addPatientRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, type, doctor } = req.body;
        
        const newRecord = {
            id: Date.now().toString(),
            title: title || "New Medical Document",
            date: date || new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}),
            type: type || "Rx",
            doctor: doctor || "You"
        };

        let patient = await Patient.findOne({ patientId: id });
        if (!patient && id.match(/^[0-9a-fA-F]{24}$/)) {
            patient = await Patient.findById(id);
        }

        if(!patient) return res.status(404).json({message: "Patient not found."});

        // Agar schema me records field nahi hai, to usme temporary array store karega (Mongoose strict schema false pe)
        if(!patient.records) patient.records = [];
        patient.records.unshift(newRecord);

        await patient.save();

        res.status(200).json({ message: "Record added successfully", record: newRecord });

    } catch(err) {
        console.error("Add Record Error:", err);
        res.status(500).json({ message: "Failed to add record." });
    }
};
// =========================================================================
// ⚙️ SECTION 9: DOCTOR PROFILE SETTINGS
// =========================================================================

// 1. Fetch Doctor Profile Settings
exports.getDoctorProfileSettings = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const doctor = await Doctor.findOne({ $or: [{ email: req.user.email }, { userId: req.user._id }] });
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        res.status(500).json({ message: "Failed to fetch profile settings." });
    }
};

// 2. Update Doctor Profile & Password
exports.updateDoctorProfileSettings = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // Frontend se aane wala data destruct karein
        const { 
            profile, address, pricing, education, experience, 
            awards, registrations, clinics, services, specializations,
            security // Yahan password aayega
        } = req.body;

        // Generate Full Name
        const fullName = `${profile.title || 'Dr.'} ${profile.firstName || ''} ${profile.lastName || ''}`.trim();

        const updateData = {
            name: fullName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            contact: profile.phone, // mapping to existing schema field
            gender: profile.gender,
            dob: profile.dob,
            category: profile.category,
            title: profile.title,
            bio: profile.bio,
            img: profile.img, 
            fee: pricing.consultationFee, 
            address: address,
            pricing: pricing,
            education: education,
            experienceList: experience,
            awards: awards,
            registrations: registrations,
            clinics: clinics,
            servicesOffered: services,
            specializations: specializations
        };

        // Update Doctor Profile
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { $or: [{ email: req.user.email }, { userId: req.user._id }] },
            { $set: updateData },
            { new: true }
        );

        if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found." });

        // 🚨 UPDATE USER MODEL (Name, Email & Password) 🚨
        let userUpdate = { 
            name: fullName,
            email: profile.email 
        };
        
        // Agar naya password aaya hai, toh usko encrypt (hash) karke update karein
        if (security && security.newPass) {
            const salt = await bcrypt.genSalt(10);
            userUpdate.password = await bcrypt.hash(security.newPass, salt);
        }

        await User.findOneAndUpdate(
            { _id: req.user._id }, 
            { $set: userUpdate }
        );

        res.status(200).json({ message: "Profile & Security updated successfully!", doctor: updatedDoctor });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Failed to update profile." });
    }
};

// 1. Sidebar ke liye Doctor ka basic data fetch karna
exports.getSidebarProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // userId se doctor dhoondo
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) return res.status(404).json({ message: "Doctor not found." });

        // Wahi fields bhejo jo sidebar ko chahiye
        res.status(200).json({
            name: doctor.name,
            img: doctor.img,
            qualification: doctor.qualification || "Specialist",
            status: doctor.status || "off duty"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

// 2. Doctor ki availability toggle karna (Available / Offline)
// Toggle Doctor Availability Status
exports.toggleAvailability = async (req, res) => {
    try {
        // Log 1: Check if user is coming from protect middleware
        console.log("Toggle Status Request received for User ID:", req.user?._id);

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized. No user found in request." });
        }

        // Log 2: Try to find doctor
        const doctor = await Doctor.findOne({ userId: req.user._id });
        console.log("Doctor found in DB:", doctor ? doctor.name : "NOT FOUND");

        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found for this user." });
        }

        // Toggle logic
        const oldStatus = doctor.status;
        doctor.status = (doctor.status === 'on duty' ? 'off duty' : 'on duty');
        doctor.isOnline = (doctor.status === 'on duty');

        // Log 3: Before saving
        console.log(`Toggling status from ${oldStatus} to ${doctor.status}`);

        await doctor.save();

        res.status(200).json({ 
            status: doctor.status, 
            isOnline: doctor.isOnline 
        });

    } catch (error) {
        // 🚨 Yeh log aapko VS Code terminal mein asli error batayega
        console.error("CRITICAL ERROR IN TOGGLE STATUS:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};