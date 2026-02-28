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
        // 1. Auth Check & Safe ID
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const tokenUserId = req.user._id || req.user.id;
        if (!tokenUserId) return res.status(400).json({ message: "Invalid Token: User ID missing." });

        // 2. Doctor Profile Find (Safe Search)
        const doctor = await Doctor.findOne({ 
            $or: [ 
                { email: req.user.email }, 
                { userId: tokenUserId },
                { userId: tokenUserId?.toString() }
            ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        // 3. 🚨 ROBUST SEARCH: Naam ya ID dono se match karega (Sirf Income/Credit)
        const transactions = await Transaction.find({ 
            $or: [
                { doctorName: doctor.name },
                { doctorId: doctor._id },
                { doctorId: doctor._id.toString() }
            ],
            flow: 'credit' // Only income
        }).sort({ createdAt: -1 });

        console.log(`✅ ${transactions.length} invoices found for Dr. ${doctor.name}`);

        // 4. Frontend format mein map karna (Safe Fallbacks ke sath)
        const formattedInvoices = transactions.map(t => {
            // Safe Date Formatting
            let validDate = "N/A";
            try {
                if (t.date || t.createdAt) {
                    validDate = new Date(t.date || t.createdAt).toLocaleDateString('en-GB', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                    });
                }
            } catch (e) {
                console.error("Date parsing error for invoice:", t._id);
            }

            const patientName = t.name || "Unknown Patient";

            return {
                _id: t._id,
                id: t.invoiceId || `INV-${t._id.toString().slice(-6).toUpperCase()}`, // Safe ID fallback
                patient: patientName, 
                date: validDate,
                amount: t.amount || 0,
                status: t.status || "Pending",
                method: t.method || "Cash",
                items: [{ desc: t.service || t.type || "Consultation", cost: t.amount || 0, qty: 1 }], 
                tax: 0,
                // Name ke hisaab se dynamic Avatar generate karega
                img: `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=random&color=fff`
            };
        });

        res.status(200).json(formattedInvoices);

    } catch (error) {
        console.error("Fetch Invoices Critical Error:", error.message);
        res.status(500).json({ message: "Failed to fetch invoices.", error: error.message });
    }
};

// 2. Create a New Invoice (Generates a Transaction)
exports.createDoctorInvoice = async (req, res) => {
    try {
        // 1. Auth Check & Safe ID
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) return res.status(400).json({ message: "Invalid Token: User ID missing." });

        // 2. Doctor Profile Find (Safe Search)
        const doctor = await Doctor.findOne({ 
            $or: [ 
                { userId: tokenUserId }, 
                { userId: tokenUserId?.toString() },
                { email: tokenEmail } 
            ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        // 3. 🚨 SAFE DESTRUCTURING: Agar frontend se data miss ho jaye toh server crash na ho
        const { patientName = "Walk-in Patient", items = [], status = "Pending", totalAmount = 0 } = req.body;

        // 4. Naya Invoice (Transaction) Create Karein
        const newTransaction = new Transaction({
            user: tokenUserId,
            doctorId: doctor._id, // Future queries ko fast aur secure banane ke liye (if schema supports)
            invoiceId: `INV-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 1000)}`,
            name: patientName,
            doctorName: doctor.name,
            type: "Consultation",
            // 🚨 SAFE ARRAY CHECK 🚨
            service: (items && items.length > 0) ? items[0].desc : "General Checkup",
            amount: totalAmount,
            flow: "credit",
            status: status,
            method: "Cash", // Default, can be updated later
            date: new Date(),  
        });

        await newTransaction.save();

        console.log(`✅ Invoice ${newTransaction.invoiceId} created successfully for Dr. ${doctor.name}`);

        // 5. Frontend Format mein Map karna
        res.status(201).json({ 
            message: "Invoice created successfully. ✅", 
            invoice: {
                _id: newTransaction._id,
                id: newTransaction.invoiceId,
                patient: newTransaction.name,
                date: new Date(newTransaction.date).toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                }),
                amount: newTransaction.amount,
                status: newTransaction.status,
                items: items,
                tax: 0,
                // Static image ki jagah dynamic aur professional Name Avatar
                img: `https://ui-avatars.com/api/?name=${encodeURIComponent(newTransaction.name)}&background=random&color=fff`
            }
        });

    } catch (error) {
        console.error("Create Invoice Critical Error:", error.message);
        res.status(500).json({ message: "Failed to create invoice.", error: error.message });
    }
};

// =========================================================================
// ⏱️ SECTION 7: DOCTOR SCHEDULE & TIMINGS
// =========================================================================

// 1. Get Doctor's Schedule
exports.getDoctorSchedule = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 1. Doctor Profile dhoondo (Safe & Flexible Search)
        // Schedule aur slotDuration ko specifically select kar rahe hain
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        }).select('schedule slotDuration name');

        if (!doctor) {
            console.log("❌ Schedule Fetch: Doctor profile NOT FOUND.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 2. Default Structure (Security layer taaki frontend crash na ho)
        const defaultSchedule = {
            Sunday: [], Monday: [], Tuesday: [], Wednesday: [], 
            Thursday: [], Friday: [], Saturday: []
        };

        console.log(`✅ Schedule fetched for: ${doctor.name}`);

        // 3. Response bhej rahe hain
        res.status(200).json({
            slotDuration: doctor.slotDuration || 30, // Default 30 mins
            schedule: doctor.schedule || defaultSchedule
        });

    } catch (error) {
        console.error("Fetch Schedule Safe Error:", error.message);
        res.status(500).json({ message: "Failed to fetch schedule.", error: error.message });
    }
};


// 2. Update Doctor's Schedule
exports.updateDoctorSchedule = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 1. Body se data nikalo (Defaults set kar diye hain)
        const { schedule, slotDuration } = req.body;

        console.log(`Updating schedule for User ID: ${tokenUserId}`);

        // 2. Doctor ko dhoondo aur UPDATE karo (Flexible Search)
        const doctor = await Doctor.findOneAndUpdate(
            { 
                $or: [ 
                    { userId: tokenUserId }, 
                    { userId: tokenUserId.toString() },
                    { email: tokenEmail } 
                ] 
            },
            { 
                $set: { 
                    schedule: schedule, 
                    slotDuration: slotDuration || 30 // Fallback to 30 mins
                } 
            },
            { new: true, runValidators: true } // Validators ensure data integrity
        ).select('schedule slotDuration name');

        if (!doctor) {
            console.log("❌ Update Schedule: Doctor profile NOT FOUND.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        console.log(`✅ Schedule updated successfully for Dr. ${doctor.name}`);

        // 3. Response bhej rahe hain
        res.status(200).json({ 
            message: "Schedule updated successfully! 🗓️",
            slotDuration: doctor.slotDuration,
            schedule: doctor.schedule
        });

    } catch (error) {
        console.error("Update Schedule Safe Error:", error.message);
        res.status(500).json({ message: "Failed to update schedule.", error: error.message });
    }
};
// =========================================================================
// 🟠 SECTION 4: SPECIALTIES & SERVICES (Doctor Panel)
// =========================================================================

// 1. Fetch Doctor's Specialties & Services
exports.getSpecialties = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 1. Doctor Profile dhoondo (Flexible Search)
        // Hum 'specialties' aur 'speciality' dono select kar rahe hain backup ke liye
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        }).select('specialties speciality name');

        if (!doctor) {
            console.log("❌ Specialties Fetch: Doctor profile NOT FOUND.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        console.log(`✅ Fetching specialties for: ${doctor.name}`);

        // 2. Data Fallback Logic
        // Agar 'specialties' array khali hai par 'speciality' field me kuch hai, toh wo bhej do
        const specialtiesList = doctor.specialties || (doctor.speciality ? [doctor.speciality] : []);

        res.status(200).json(specialtiesList);

    } catch (error) {
        console.error("Fetch Specialties Safe Error:", error.message);
        res.status(500).json({ message: "Failed to fetch specialties.", error: error.message });
    }
};


// 2. Update/Save Doctor's Specialties & Services

exports.updateSpecialties = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        const { specialties } = req.body; // Frontend se array aayega

        console.log(`Updating specialties for User ID: ${tokenUserId}`);

        // 🚨 ROBUST UPDATE: Object ID, String ID, aur Email teeno fallback ke saath
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { 
                $or: [ 
                    { userId: tokenUserId }, 
                    { userId: tokenUserId.toString() },
                    { email: tokenEmail } 
                ] 
            },
            { $set: { specialties: specialties || [] } }, // Array safety
            { new: true, runValidators: true } 
        ).select('specialties name');

        if (!updatedDoctor) {
            console.log("❌ Update Specialties: Doctor profile NOT FOUND.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        console.log(`✅ Specialties saved for: ${updatedDoctor.name}`);

        res.status(200).json({ 
            message: "Specialties saved successfully! ✅", 
            specialties: updatedDoctor.specialties 
        });

    } catch (error) {
        console.error("Save Specialties Safe Error:", error.message);
        res.status(500).json({ message: "Failed to save specialties.", error: error.message });
    }
};

// =========================================================================
// 🩺 SECTION 8: DOCTOR APPOINTMENTS & CONSULTATION
// =========================================================================

// 1. Fetch All Appointments for Logged-in Doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized. Token missing." });

        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        // 2. Doctor Profile Find
        const doctor = await Doctor.findOne({ 
            $or: [ 
                { userId: tokenUserId }, 
                { userId: tokenUserId?.toString() },
                { email: tokenEmail } 
            ] 
        });

        if (!doctor) {
            console.log("❌ Appointments Fetch Error: Doctor profile not found.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 3. Search Query
        const appointments = await Appointment.find({ 
            $or: [
                { doctorId: doctor._id }, 
                { doctorId: doctor._id.toString() },
                { doctorName: doctor.name } 
            ]
        }).sort({ date: 1, time: 1 });

        console.log(`✅ Success: ${appointments.length} appointments fetched for Dr. ${doctor.name}`);

        // 4. 🚨 FORMATTING DATA (YEH PART FIX KIYA HAI) 🚨
        const formattedAppointments = appointments.map(app => {
            
            // Backend Status ko Frontend Tabs ke sath Match karna
            let rawStatus = app.status || "Pending";
            let uiStatus = 'Upcoming'; // Default value sabko upcoming me daalegi

            // Sirf Completed aur Cancelled ko alag karenge, baaki sab 'Upcoming' ban jayenge
            if (['Completed', 'Done', 'Finished'].includes(rawStatus)) {
                uiStatus = 'Completed';
            } else if (['Cancelled', 'Rejected', 'Failed'].includes(rawStatus)) {
                uiStatus = 'Cancelled';
            } else {
                // 'Approved', 'With Doctor', 'Waiting', 'Pending', 'Scheduled' sab 'Upcoming' me dikhenge
                uiStatus = 'Upcoming';
            }

            // Safe Patient Name
            const finalPatientName = app.type === 'pet' ? (app.petName || app.patientName) : (app.patientName || "Unknown Patient");

            return {
                id: app._id,
                patientName: finalPatientName,
                type: app.visitType || app.type || 'Clinic',
                age: app.age || 'N/A',
                gender: app.gender || 'N/A',
                date: app.date || "N/A",
                time: app.time || "N/A",
                status: uiStatus, // 🚨 Yahan ab clean status jayega
                originalStatus: rawStatus, // Agar frontend me exact status dikhana ho (jaise "With Doctor")
                email: app.email || "N/A", 
                phone: app.phone || "N/A",
                symptoms: app.problem || app.symptoms || "General Checkup",
                purpose: app.problem || app.speciality || "Consultation",
                address: app.address || "N/A",
                meetingLink: app.meetingLink || "meet.google.com/xyz-demo",
                token: app.token || `A-${app._id.toString().slice(-3).toUpperCase()}`,
                room: app.room || doctor.room || "101",
                img: app.type === 'pet' 
                    ? "https://cdn-icons-png.flaticon.com/512/2950/2950648.png" 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(finalPatientName)}&background=random&color=fff`
            };
        });

        // 5. Send back to frontend
        res.status(200).json(formattedAppointments);

    } catch (error) {
        console.error("Fetch Appointments Critical Error:", error);
        res.status(500).json({ message: "Failed to fetch appointments.", error: error.message });
    }
};


// 2. End Consultation & Save Prescription
exports.completeConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { vitals, clinicalNotes, medications } = req.body;

        // 1. Auth Check & Safe ID Extraction (Crash se bachne ke liye)
        if (!req.user) return res.status(401).json({ message: "Not authorized. Token missing." });
        
        const tokenUserId = req.user._id || req.user.id;
        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 2. Doctor ki Profile dhoondo (Safe Search)
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId?.toString() },
                { email: req.user.email }
            ] 
        });

        if (!doctor) {
            console.log("❌ Consultation Error: Doctor profile not found.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 3. 🚨 SECURE UPDATE: Ensure appointment belongs to THIS exact doctor 🚨
        const updatedAppointment = await Appointment.findOneAndUpdate(
            { _id: id, doctorId: doctor._id }, // Strict check: Dono match hone chahiye
            {
                $set: {
                    status: 'Completed',
                    prescription: { 
                        vitals: vitals || {}, 
                        clinicalNotes: clinicalNotes || "", 
                        medications: medications || [],
                        completedAt: new Date() // Record the exact time of completion
                    }
                }
            },
            { new: true }
        );

        if (!updatedAppointment) {
            console.log(`⚠️ Unauthorized attempt or missing appointment ID: ${id}`);
            return res.status(404).json({ 
                message: "Appointment not found or you are not authorized to complete this." 
            });
        }

        console.log(`✅ Consultation completed successfully for Appointment ID: ${id}`);

        res.status(200).json({ 
            message: "Consultation ended and Prescription saved! ✅", 
            appointment: updatedAppointment 
        });

    } catch (error) {
        console.error("Complete Consultation Critical Error:", error.message);
        res.status(500).json({ message: "Failed to save prescription.", error: error.message });
    }
};

// 🚨 3. Update Appointment Status (Cancel / Approve) -> YEH MISSING THA! 🚨
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        // 1. Auth Check & Safe ID Extraction
        if (!req.user) return res.status(401).json({ message: "Not authorized. Token missing." });
        
        const tokenUserId = req.user._id || req.user.id;
        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 2. Doctor ki Profile dhoondo (Safe Search)
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId?.toString() },
                { email: req.user.email }
            ] 
        });

        if (!doctor) {
            console.log("❌ Status Update Error: Doctor profile not found.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 3. 🚨 SECURE UPDATE: Ensure appointment belongs to THIS doctor 🚨
        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, doctorId: doctor._id }, // Strict Security Check
            { $set: { status: status } }, 
            { new: true, runValidators: true } // Ensure valid status values from Schema
        );

        if (!appointment) {
            console.log(`⚠️ Unauthorized status update attempt for Appointment ID: ${id}`);
            return res.status(404).json({ 
                message: "Appointment not found or you are not authorized to update this." 
            });
        }

        console.log(`✅ Appointment status updated to '${status}' successfully.`);

        // 4. Clean Frontend Response
        res.status(200).json({ 
            message: `Appointment ${status} successfully! ✅`, 
            status: appointment.status 
        });

    } catch (error) {
        console.error("Status Update Critical Error:", error.message);
        res.status(500).json({ message: "Failed to update status.", error: error.message });
    }
};
// =========================================================================
// 🟡 SECTION 3: PATIENT MANAGEMENT (MY PATIENTS)
// =========================================================================

/// 1. Fetch all Patients (Merged from Appointments + Manual Entries)
exports.getDoctorPatients = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 1. Doctor Profile dhoondo (Email ya ID fallback ke saath)
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor not found." });

        // 2. Fetch Data Parallelly (Performance improvement)
        const [doctorAppointments, doctorTransactions, manualPatients] = await Promise.all([
            Appointment.find({ doctorId: doctor._id }).sort({ date: -1, time: -1 }),
            Transaction.find({ doctorName: doctor.name }).sort({ createdAt: -1 }),
            Patient.find().sort({ createdAt: -1 })
        ]);

        const patientMap = new Map();

        // Step A: Load Manually Added Patients
        manualPatients.forEach(p => {
            patientMap.set(p.phone || p.name, {
                id: p.patientId || `PT-${p._id.toString().slice(-4).toUpperCase()}`, 
                _id: p._id,
                name: p.name,
                age: p.age || "N/A",
                gender: p.gender || "N/A",
                bloodGroup: p.bloodGroup || "Unknown", 
                phone: p.phone || "N/A",
                email: p.email || "N/A",
                location: p.address || "Clinic Visit",
                img: p.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff`,
                status: p.status === 'active' ? 'Active' : 'Inactive',
                isManual: true,
                records: p.records || []
            });
        });

        // Step B: Load Patients from Appointments (Unique only)
        doctorAppointments.forEach(app => {
            const key = app.phone || app.patientName;
            if (!patientMap.has(key)) {
                patientMap.set(key, {
                    id: `APT-${app._id.toString().slice(-5).toUpperCase()}`,
                    _id: app._id,
                    name: app.type === 'pet' ? (app.petName || app.patientName) : app.patientName,
                    age: app.age || "N/A",
                    gender: app.gender || "N/A",
                    bloodGroup: "Unknown",
                    phone: app.phone || "N/A",
                    email: app.email || "N/A",
                    location: app.address || "Online/Clinic",
                    img: app.type === 'pet' 
                        ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80" 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.patientName)}&background=random&color=fff`,
                    status: 'Active',
                    isManual: false,
                    records: []
                });
            }
        });

        // Step C: Process each unique patient (Attach History, Vitals, Bills)
        const formattedPatients = Array.from(patientMap.values()).map(p => {
            const patHistory = doctorAppointments.filter(app => app.phone === p.phone || app.patientName === p.name);
            
            // Map History
            const mappedHistory = patHistory.map(app => ({
                id: app._id,
                date: app.date ? new Date(app.date).toISOString().split('T')[0] : "N/A",
                time: app.time,
                purpose: app.problem || "Consultation",
                type: app.visitType || app.type || "Clinic",
                status: app.status,
                fee: app.fee || doctor.fee || 0
            }));

            // Extract Latest Vitals
            const latestCompleted = patHistory.find(a => a.status === 'Completed' && a.prescription?.vitals);
            const latestVitals = latestCompleted ? {
                bp: latestCompleted.prescription.vitals.bp || "-",
                heartRate: latestCompleted.prescription.vitals.pulse || "-",
                glucose: latestCompleted.prescription.vitals.glucose || "-",
                temp: latestCompleted.prescription.vitals.temp || "-"
            } : { bp: "-", heartRate: "-", glucose: "-", temp: "-" };

            // Map Bills
            const bills = doctorTransactions.filter(b => b.name === p.name || b.phone === p.phone);
            const mappedBills = bills.map(b => ({
                id: b.invoiceId || b._id.toString().slice(-6).toUpperCase(),
                date: new Date(b.date || b.createdAt).toLocaleDateString('en-IN'),
                amount: b.amount,
                status: b.status
            }));
            const totalPaid = bills.filter(b => b.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // Merge Auto Prescriptions into Records
            const autoRecords = patHistory.filter(a => a.status === 'Completed').map(app => ({
                id: app._id,
                date: app.date,
                title: `Prescription: ${app.problem || 'Visit'}`,
                type: "Rx",
                doctor: doctor.name,
                details: app.prescription
            }));

            return {
                ...p,
                lastVisit: patHistory.length > 0 ? patHistory[0].date : "New Patient",
                totalPaid,
                vitals: latestVitals,
                history: mappedHistory,
                bills: mappedBills,
                records: [...(p.records || []), ...autoRecords]
            };
        });

        // Latest visits first
        formattedPatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

        res.status(200).json(formattedPatients);

    } catch (error) {
        console.error("Fetch Patients Error:", error.message);
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

        // 🚨 SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        console.log(`Fetching Profile Settings for User ID: ${tokenUserId}`);

        // 🚨 ROBUST SEARCH: Object ID, String ID, aur Email teeno fallback ke saath
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        });

        if (!doctor) {
            console.log("❌ Fetch Profile Settings: Doctor profile NOT FOUND.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        console.log(`✅ Profile settings fetched for: ${doctor.name}`);

        // Pura doctor object bhej rahe hain taaki frontend form pre-fill ho jaye
        res.status(200).json(doctor);

    } catch (error) {
        console.error("Fetch Profile Safe Error:", error.message);
        res.status(500).json({ message: "Failed to fetch profile settings.", error: error.message });
    }
};

// 2. Update Doctor Profile & Password


exports.updateDoctorProfileSettings = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 1. SAFE ID EXTRACTION (Crash protection)
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 2. Safe Destructuring (Agar frontend koi data na bheje, toh error na aaye)
        const { 
            profile = {}, address = {}, pricing = {}, education = [], experience = [], 
            awards = [], registrations = [], clinics = [], services = [], specializations = [],
            security = {} 
        } = req.body;

        // Generate Full Name Safely
        const fullName = `${profile.title || 'Dr.'} ${profile.firstName || ''} ${profile.lastName || ''}`.trim();

        console.log(`Updating Profile for User ID: ${tokenUserId}`);

        // 3. Mapping data exactly as per your schema
        const updateData = {
            name: fullName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            contact: profile.phone, 
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

        // 4. Update Doctor Profile (Robust Search)
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { 
                $or: [ 
                    { userId: tokenUserId }, 
                    { userId: tokenUserId.toString() },
                    { email: tokenEmail } 
                ] 
            },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            console.log("❌ Update Profile: Doctor NOT FOUND in Doctor Collection.");
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 5. 🚨 UPDATE USER MODEL (Name, Email & Password) 🚨
        let userUpdate = { 
            name: fullName,
            email: profile.email 
        };
        
        // Agar naya password aaya hai, toh usko encrypt (hash) karke update karein
        if (security.newPass) {
            const bcrypt = require('bcrypt'); // Make sure bcrypt or bcryptjs is installed
            const salt = await bcrypt.genSalt(10);
            userUpdate.password = await bcrypt.hash(security.newPass, salt);
            console.log("🔒 Password updated successfully.");
        }

        await User.findOneAndUpdate(
            { _id: tokenUserId }, 
            { $set: userUpdate }
        );

        console.log(`✅ Profile & Security updated for: ${fullName}`);

        res.status(200).json({ 
            message: "Profile & Security updated successfully! ✅", 
            doctor: updatedDoctor 
        });

    } catch (error) {
        console.error("Update Profile Safe Error:", error.message);
        res.status(500).json({ message: "Failed to update profile.", error: error.message });
    }
};

// 1. Sidebar ke liye Doctor ka basic data fetch karna
exports.getSidebarProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE CHECK: Agar _id nahi hai to id use karo
        const tokenUserId = req.user._id || req.user.id || req.user.userId;
        const tokenEmail = req.user.email;

        console.log("Safe Token ID Extracted:", tokenUserId);

        // Agar Token me koi ID hi nahi hai to crash se bacho
        if (!tokenUserId) {
            return res.status(400).json({ message: "Token is invalid, ID missing" });
        }

        const queryConditions = [
            { userId: tokenUserId },
            { userId: tokenUserId.toString() }
        ];

        // Agar token mein email hai, tabhi usko condition mein dalo
        if (tokenEmail) {
            queryConditions.push({ email: tokenEmail });
        }

        const doctor = await Doctor.findOne({ $or: queryConditions });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found in DB." });
        }

        res.status(200).json({
            name: doctor.name,
            img: doctor.img,
            qualification: doctor.qualification || doctor.speciality || "Specialist",
            status: doctor.status || "off duty"
        });
        
    } catch (error) {
        console.error("Sidebar Fetch Error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// 2. Doctor ki availability toggle karna (Available / Offline)
// Toggle Doctor Availability Status
exports.toggleAvailability = async (req, res) => {
    try {
        // 1. Safe ID Extraction (Jaise Dashboard aur Sidebar me kiya)
        const tokenUserId = req.user?._id || req.user?.id;
        const tokenEmail = req.user?.email;

        console.log("Toggle Request - ID:", tokenUserId, "Email:", tokenEmail);

        if (!tokenUserId) {
            return res.status(401).json({ message: "Not authorized. Token User ID missing." });
        }

        // 2. Doctor ko dhoondo (Flexible Search)
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        });

        if (!doctor) {
            console.log("❌ Doctor profile NOT FOUND for toggle.");
            return res.status(404).json({ message: "Doctor profile not found for this user." });
        }

        // 3. Toggle Logic (Strict check with fallback)
        // Agar status 'active' ya kuch aur hai, to usko 'off duty' se start karo
        const currentStatus = doctor.status === 'on duty' ? 'on duty' : 'off duty';
        
        doctor.status = (currentStatus === 'on duty' ? 'off duty' : 'on duty');
        doctor.isOnline = (doctor.status === 'on duty');

        console.log(`✅ Toggling status from ${currentStatus} to ${doctor.status}`);

        // 4. Update Task (Optional: Clean UI feel ke liye)
        doctor.currentTask = doctor.status === 'on duty' ? "Available for Consult" : "Offline";

        await doctor.save();

        res.status(200).json({ 
            status: doctor.status, 
            isOnline: doctor.isOnline,
            message: `You are now ${doctor.status}`
        });

    } catch (error) {
        console.error("CRITICAL ERROR IN TOGGLE STATUS:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// =========================================================================
// 🚀 SECTION 10: DOCTOR DASHBOARD
// =========================================================================

// 1. Fetch Dashboard Data (Appointments & Stats)
exports.getDoctorDashboard = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Not authorized." });

        // 🚨 SAFE ID EXTRACTION: Undefined se bachne ke liye
        const tokenUserId = req.user._id || req.user.id;
        const tokenEmail = req.user.email;

        if (!tokenUserId) {
            return res.status(400).json({ message: "Invalid Token: User ID missing." });
        }

        // 1. Doctor Profile dhoondo (Email ya ID dono se check karega)
        const doctor = await Doctor.findOne({ 
            $or: [
                { userId: tokenUserId }, 
                { userId: tokenUserId.toString() },
                { email: tokenEmail }
            ] 
        });

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        // 2. Fetch Appointments for this specific doctor
        const appointments = await Appointment.find({ doctorId: doctor._id }).sort({ date: 1, time: 1 });

        // 3. Unique Patients Count
        const uniquePatientsFromApps = [...new Set(appointments.map(a => a.phone || a.patientName))];
        const manualPatientsCount = await Patient.countDocuments(); 
        const totalPatients = uniquePatientsFromApps.length + manualPatientsCount;

        // 4. Calculate Stats (Upcoming includes Pending & Waiting)
        const upcomingAppointments = appointments.filter(a => 
            ['Upcoming', 'Pending', 'Waiting'].includes(a.status)
        ).length;
        
        // Revenue logic
        const revenueAppointments = appointments.filter(a => 
            ['Completed', 'Approved'].includes(a.status)
        );
        
        let totalRevenue = 0;
        revenueAppointments.forEach(app => {
            totalRevenue += (app.fee || doctor.fee || 0);
        });

        // 5. Format for Frontend UI
        const formattedAppointments = appointments.map(app => ({
            id: app._id,
            patientName: app.type === 'pet' ? (app.petName || app.patientName) : app.patientName,
            ownerName: app.ownerName || "",
            type: app.type || "Human",
            age: app.age || "N/A",
            gender: app.gender || "Unknown",
            // Safe Date Formatting
            date: app.date ? new Date(app.date).toISOString().split('T')[0] : "No Date",
            time: app.time || "N/A",
            status: app.status,
            symptoms: app.problem || "General Checkup",
            history: "No previous history fetched.",
            img: app.type === 'pet' 
                ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80" 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.patientName)}&background=random&color=fff`,
            phone: app.phone || "N/A",
            vitals: app.prescription?.vitals || null
        }));

        // Response bhej rahe hain
        res.status(200).json({
            stats: {
                patients: totalPatients,
                appointments: upcomingAppointments,
                income: totalRevenue
            },
            appointments: formattedAppointments
        });

    } catch (error) {
        console.error("Dashboard Safe Fetch Error:", error);
        res.status(500).json({ message: "Server error loading dashboard." });
    }
};


// 2. Update Appointment Status from Dashboard
exports.updateDashboardAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'Approved', 'Cancelled', 'Completed'

        // 1. Pehle us doctor ki ID nikal lo (Token se)
        const tokenUserId = req.user._id || req.user.id;
        const doctor = await Doctor.findOne({ 
            $or: [{ userId: tokenUserId }, { email: req.user.email }] 
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        // 2. Appointment update karo par CHECK karo ki doctorId match honi chahiye
        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, doctorId: doctor._id }, // 🚨 Security check: Sirf apna appointment update kar sake
            { $set: { status: status } },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ 
                message: "Appointment not found or you are not authorized to update this." 
            });
        }

        // 3. Status ke hisaab se response message
        let displayMessage = `Appointment ${status} successfully.`;
        if (status === 'Approved') displayMessage = "Appointment accepted! ✅";
        if (status === 'Cancelled') displayMessage = "Appointment cancelled. ❌";

        res.status(200).json({ 
            message: displayMessage, 
            appointment 
        });

    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Server error updating status." });
    }
};
