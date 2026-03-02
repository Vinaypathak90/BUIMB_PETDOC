const Review = require('../models/Review');
const Doctor = require('../models/Doctor');   
const Patient = require('../models/Patient'); 
const User = require('../models/User');

// ==========================================
// 1. GET DOCTORS LIST (For Dropdown in User Panel)
//    Only return doctors the current user has an appointment with
// ==========================================
exports.getDoctorsList = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;

        // find unique doctorIds from appointments by this user
        const appointments = await require('../models/Appointment').find({ user: userId }).select('doctorId');
        const doctorIds = [...new Set(appointments.map(a => a.doctorId.toString()))];

        // fetch doctor details only for those IDs
        const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('name speciality img type');
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error in getDoctorsList:", error);
        res.status(500).json({ message: "Failed to fetch doctors" });
    }
};

// ==========================================
// 2. ADD A REVIEW (By Patient)
// ==========================================
exports.addReview = async (req, res) => {
    try {
        const { doctorId, rating, comment } = req.body;
        const userId = req.user.id || req.user._id || req.userId;

        // 1. Fetch Patient details
        const patientProfile = await Patient.findOne({ patientId: userId.toString() });
        const userAuth = await User.findById(userId).select('name');
        
        const patientName = patientProfile?.name || userAuth?.name || "Anonymous Patient";
        const patientImg = patientProfile?.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        const patientType = patientProfile?.type || "human"; 

        // 2. Fetch Doctor Info
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // 3. Format Date
        const formattedDate = new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', month: 'short', year: 'numeric' 
        });

        // 4. Create Review
        const newReview = new Review({
            patientId: userId,
            patientName: patientName,
            patientImg: patientImg,
            
            doctorId: doctor._id,
            doctorName: doctor.name,
            doctorImg: doctor.img || "https://randomuser.me/api/portraits/men/85.jpg",
            
            rating: Number(rating),
            comment: comment,
            type: patientType,
            date: formattedDate
        });

        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully!", review: newReview });

    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ message: "Failed to submit review." });
    }
};

// ==========================================
// 3. GET ALL REVIEWS (For Admin Panel)
// ==========================================
// @desc    Get all reviews for Admin
// @route   GET /api/reviews/all
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
    try {
        // Yeh line saare reviews (Human + Pet) fetch karegi
        const reviews = await Review.find().sort({ createdAt: -1 });
        
        console.log(`📊 Admin Debug: Total ${reviews.length} reviews fetched from DB.`);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all reviews" });
    }
};

// ==========================================
// 4. GET DOCTOR'S SPECIFIC REVIEWS (🚨 BUG FIXED HERE)
// ==========================================
exports.getDoctorReviews = async (req, res) => {
    try {
        const authUserId = req.user.id || req.user._id || req.userId; 
        console.log("➡️ STEP 1: ID received from Token:", authUserId);

        // 1. Pehle check karte hain agar ye direct DOCTOR ki '_id' hai
        let doctorProfile = await Doctor.findById(authUserId);
        console.log("➡️ STEP 2: Checked direct Doctor _id ->", doctorProfile ? "MIL GAYA! ✅" : "Nahi Mila ❌");
        
        // 2. Agar nahi mili, toh check karte hain agar ye 'userId' wale field mein hai

        if (!doctorProfile) {
            doctorProfile = await Doctor.findOne({ userId: authUserId });
            console.log("➡️ STEP 3: Checked by 'userId' field ->", doctorProfile ? "MIL GAYA! ✅" : "Nahi Mila ❌");
        }

        // Agar dono jagah nahi mili, tab error denge
        if (!doctorProfile) {
            console.log("🚨 FINAL RESULT: Doctor profile database me is ID se link hi nahi hai!");
            return res.status(404).json({ message: "Doctor profile not found for this account." });
        }

        console.log("✅ Asli Doctor ID jo use hogi:", doctorProfile._id);

        // 3. Asli Doctor _id se reviews fetch karo
        const reviews = await Review.find({ doctorId: doctorProfile._id }).sort({ createdAt: -1 });
        console.log(`🎉 SUCCESS: ${reviews.length} reviews mil gaye! Bhej rahe hain frontend ko...`);
        
        res.status(200).json(reviews);
    } catch (error) {
        console.error("❌ Error fetching doctor reviews:", error);
        res.status(500).json({ message: "Failed to fetch doctor reviews" });
    }
};

// ==========================================
// 5. DOCTOR REPLIES TO REVIEW
// ==========================================
exports.replyToReview = async (req, res) => {
    try {
        const { reply } = req.body;
        const review = await Review.findByIdAndUpdate(
            req.params.id, 
            { reply: reply }, 
            { new: true }
        );
        res.status(200).json({ message: "Reply posted!", review });
    } catch (error) {
        res.status(500).json({ message: "Failed to post reply" });
    }
};

// ==========================================
// 6. DELETE REVIEW (For Admin and Doctor)
// ==========================================
// @desc    Delete a review permanently
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Admin Delete Error:", error);
        res.status(500).json({ message: "Failed to delete review" });
    }
};