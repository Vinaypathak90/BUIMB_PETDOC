const Profile = require('../models/Profile');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const Vitals = require('../models/Vitals');

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
