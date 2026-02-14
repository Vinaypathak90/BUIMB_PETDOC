const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Your User Model
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@petdoc.com' });
        
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Super Admin',
            email: 'admin@petdoc.com',
            password: hashedPassword, // Hash the password manually if not using model hooks
            role: 'admin',
            phone: '0000000000'
        });

        console.log('✅ Admin User Created: admin@petdoc.com / admin123');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });