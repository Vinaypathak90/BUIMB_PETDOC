const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors (with optional search)
// @route   GET /api/appointments/doctors

exports.getLatestAppointment = async (req, res) => { // get appointment details 
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

exports.getDoctors = async (req, res) => { // get doctors detailed 
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

// @desc    Create new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        // Frontend se "formData" aa raha hai jisme medicalReport (base64) hai
        const { doctor, formData, bookingType } = req.body; 

        const appointment = await Appointment.create({
            user: userId,
            
            // Doctor Info
            doctorId: doctor._id,
            doctorName: doctor.name,
            speciality: doctor.speciality,
            doctorImg: doctor.img,
            fee: doctor.fee,

            // Patient Info
            patientName: bookingType === 'pet' ? formData.petName : formData.name,
            age: formData.age,
            gender: formData.gender,
            phone: formData.phone,
            type: bookingType,
            petName: formData.petName,
            petType: formData.petType,
            
            // Appointment Details
            problem: formData.problem,
            symptoms: formData.symptoms,
            
            // ✅ YE LINE CHECK KARO: Data yahan save ho raha hai
            medicalReport: formData.medicalReport, 

            date: formData.date,
            day: formData.day,
            time: formData.time,
            
            paymentStatus: 'Paid'
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Booking Error:", error); // Error print karwana debugging ke liye
        res.status(500).json({ message: 'Booking failed: ' + error.message });
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


