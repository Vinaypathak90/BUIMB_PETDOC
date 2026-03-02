import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { Menu, Bell, Star, Send, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WriteReview = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // --- FORM STATES ---
  const [doctors, setDoctors] = useState([]); // Dropdown ke liye doctors ki list
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Universal Token Fetcher
  const getAuthToken = () => {
    let tokenStr = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (!tokenStr) return null;
    try { return JSON.parse(tokenStr).token || tokenStr; } catch (e) { return tokenStr; }
  };

  // 1. Fetch Doctors for Dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // fetch only doctors from past appointments for current user
        const res = await fetch('http://localhost:5000/api/reviews/doctors-list', {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });

        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        } else {
          console.warn('doctors-list response not ok', res.status);
          setDoctors([]);
        }
      } catch (error) {
        console.error("Error fetching doctors", error);
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Submit Review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || rating === 0 || !comment.trim()) {
        alert("Please select a doctor, give a rating, and write a comment.");
        return;
    }

    setIsLoading(true);
    const token = getAuthToken();

    try {
        const res = await fetch('http://localhost:5000/api/reviews/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                doctorId: selectedDoctor,
                rating: rating,
                comment: comment,
                type: "human" // Default human, agar pet ho toh logic add kar sakte hain
            })
        });

        if (res.ok) {
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/user/dashboard'); // 2 second baad dashboard pe bhej do
            }, 2000);
        } else {
            const errorData = await res.json();
            alert(errorData.message || "Failed to submit review.");
        }
    } catch (error) {
        alert("Network error while submitting review.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-slate-800">Write a Review</h2>
            </div>
            <Bell className="text-slate-500 hover:text-[#00d0f1] transition-colors cursor-pointer" size={20} />
        </header>
        
        <main className="p-6 md:p-8 max-w-3xl mx-auto">
          
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {isSuccess ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
                     <CheckCircle size={60} className="text-emerald-500 mb-4 animate-bounce" />
                     <h2 className="text-2xl font-black text-slate-800 mb-2">Review Submitted!</h2>
                     <p className="text-slate-500 font-medium">Thank you for your feedback. Redirecting...</p>
                 </div>
             ) : (
                 doctors.length === 0 ? (
                     <div className="py-8 text-center">
                         <p className="text-red-500 font-bold">No past appointments found.</p>
                         <p className="text-slate-600">Please schedule an appointment before writing a review.</p>
                     </div>
                 ) : (
                 <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Intro */}
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                            <MessageSquare className="text-[#00d0f1]" size={28}/> Share Your Experience
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">Your feedback helps doctors improve and helps other patients make better health decisions.</p>
                    </div>

                    {/* 1. Doctor Selection Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Doctor</label>
                        <select 
                            value={selectedDoctor} 
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none bg-white transition-all shadow-sm cursor-pointer"
                            required
                        >
                            <option value="" disabled>-- Choose a Doctor --</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>{doc.name} {doc.speciality ? `(${doc.speciality})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Interactive Star Rating */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Rate Your Visit</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star 
                                        size={36} 
                                        className={`transition-colors duration-200 ${
                                            star <= (hoverRating || rating) 
                                            ? "fill-yellow-400 text-yellow-400" 
                                            : "text-slate-200 fill-slate-50"
                                        }`} 
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && <p className="text-xs font-bold text-yellow-500 mt-2">{['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][rating - 1]}</p>}
                    </div>

                    {/* 3. Review Comment */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Detailed Review</label>
                        <textarea 
                            rows="5"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about the consultation, the clinic environment, and your overall experience..."
                            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 focus:border-[#00d0f1] outline-none transition-all shadow-sm resize-none custom-scrollbar"
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#192a56] hover:bg-blue-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18}/> Post Public Review</>}
                        </button>
                    </div>

                 </form>
                 )
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WriteReview;