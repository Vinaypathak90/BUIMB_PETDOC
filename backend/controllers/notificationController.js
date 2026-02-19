const Notification = require('../models/Notification');

// ==========================================
// 1. GET ALL NOTIFICATIONS
// ==========================================
exports.getNotifications = async (req, res) => {
    try {
        // Sort by Newest First
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};

// ==========================================
// 2. CREATE NOTIFICATION (Internal Use)
// ==========================================
// This function can be called by other controllers (e.g., when an appointment is booked)
exports.createNotification = async (title, msg, type = 'info') => {
    try {
        const newNotif = new Notification({ title, msg, type });
        await newNotif.save();
        return newNotif;
    } catch (err) {
        console.error("Notification Creation Error:", err);
    }
};

// ==========================================
// 3. MARK AS READ (Single or All)
// ==========================================
exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'all') {
            await Notification.updateMany({}, { isRead: true });
            return res.status(200).json({ message: "All marked as read." });
        }

        const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.status(200).json(notif);

    } catch (err) {
        res.status(500).json({ message: "Update failed." });
    }
};

// ==========================================
// 4. DELETE NOTIFICATION (Single or All)
// ==========================================
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 'all') {
            await Notification.deleteMany({});
            return res.status(200).json({ message: "All cleared." });
        }

        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: "Deleted." });

    } catch (err) {
        res.status(500).json({ message: "Delete failed." });
    }
};
