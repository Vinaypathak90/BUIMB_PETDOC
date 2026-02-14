const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding...'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        // 1. Create specific Doctor (Dr. Marvin)
        // Check if exists first to avoid duplicates
        await User.deleteMany({ email: "marvin@petdoc.com" }); 
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        const doctor = await User.create({
            // Using ID from your JSON (Converted to Mongoose ID logic, or let Mongo generate one)
            // Note: Explicitly setting _id is tricky, better to let Mongo do it or match existing.
            name: "Dr. Marvin Campbell",
            email: "marvin@petdoc.com",
            password: hashedPassword,
            role: "doctor",
            phone: "+1 987 654 3210",
            speciality: "Pet Orthopedics", // Make sure User model has this field or add it strictly
            fee: 750,
            avatar: "https://randomuser.me/api/portraits/men/51.jpg",
            availability: ["Mon", "Tue", "Wed", "Thu", "Fri"]
        });

        console.log(`✅ Doctor Created: ${doctor.name}`);

        // 2. Create a Dummy Patient
        const patient = await User.create({
            name: "Rahul Verma",
            email: "rahul@gmail.com",
            password: hashedPassword,
            role: "patient",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        });

        // 3. Create Appointments for Dr. Marvin
        const appointments = [
            {
                user: patient._id,
                doctor: doctor._id, // Linking to Marvin
                
                // Snapshot details
                doctorName: doctor.name,
                speciality: "Pet Orthopedics",
                fee: 750,
                doctorImg: doctor.avatar,

                // Patient Info
                patientName: "Bruno",
                type: "Pet",
                petType: "Dog",
                age: "4",
                gender: "Male",
                ownerName: "Rahul Verma",
                
                // Medical
                problem: "Limping Leg",
                symptoms: "Limping left leg, Loss of appetite",
                history: "Previous fracture (2024)",
                
                // Schedule
                date: "2026-02-12",
                time: "10:30 AM",
                status: "Pending", // Ye doctor ko "Accept" button ke sath dikhega

                vitals: { heartRate: "80 bpm", temp: "101 F" }
            },
            {
                user: patient._id,
                doctor: doctor._id,
                
                doctorName: doctor.name,
                speciality: "Pet Orthopedics",
                fee: 750,
                doctorImg: doctor.avatar,

                patientName: "Kitty",
                type: "Pet",
                petType: "Cat",
                age: "2",
                gender: "Female",
                ownerName: "Rahul Verma",
                
                problem: "Checkup",
                symptoms: "Regular vaccination",
                
                date: "2026-02-12",
                time: "11:30 AM",
                status: "Approved", // Ye already Approved dikhega

                vitals: { heartRate: "120 bpm" }
            }
        ];

        await Appointment.deleteMany({ doctorName: "Dr. Marvin Campbell" });
        await Appointment.insertMany(appointments);

        console.log("✅ Appointments Seeded for Dr. Marvin");
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();