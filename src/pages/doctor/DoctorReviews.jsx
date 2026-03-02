import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Search, Filter, Star, ThumbsUp, MessageCircle, 
  Trash2, Reply, CheckCircle, ChevronLeft, ChevronRight, User, MoreHorizontal, Loader2
} from 'lucide-react';

const DoctorReviews = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('All'); // All, 5, 4, 3, 2, 1
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Loading state added
  const itemsPerPage = 5;

  // --- REPLY STATE ---
  const [replyId, setReplyId] = useState(null); // ID of review being replied to
  const [replyText, setReplyText] = useState("");

  // --- GET AUTH TOKEN ---
  // --- 🚨 SUPER-CHARGED AUTH TOKEN GETTER ---
  const getAuthToken = () => {
    // Yahan humne saare common naam daal diye hain
    let tokenStr = localStorage.getItem('doctor_token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('user_token') || 
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('jwt'); // Agar aapka koi aur naam hai, toh yahan add karein
                   
    if (!tokenStr) return null;

    try { 
        const parsed = JSON.parse(tokenStr);
        return parsed.token || parsed.accessToken || tokenStr; 
    } catch (e) { 
        return tokenStr; 
    }
  };

  // --- 1. FETCH REVIEWS FROM BACKEND ---
useEffect(() => {
    const fetchReviews = async () => {
      const token = getAuthToken();

      // 🚨 NAYA SPEED BREAKER: Agar token 'null' ya 'undefined' hai, toh API call mat karo
      if (!token || token === "null" || token === "undefined") {
          console.warn("⏳ Waiting for a valid token...");
          setIsLoading(false);
          return; 
      }

      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/reviews/doctor', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
            const data = await res.json();
            const formattedData = data.map(r => ({
                ...r, 
                id: r._id, 
                name: r.patientName, 
                img: r.patientImg 
            }));
            setReviews(formattedData);
        } else {
            console.error("🚨 Backend rejected the token.");
        }
      } catch (error) {
        console.error("Error fetching reviews", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);
  // --- STATS CALCULATION (Made safe for empty arrays) ---
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const satisfactionRate = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  // --- HANDLERS ---

  // 2. DELETE REVIEW API
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this review?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if(res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
            } else {
                alert("Failed to delete review from server.");
            }
        } catch(error) {
            alert("Network error: Failed to delete review.");
        }
    }
  };

  // 3. POST REPLY API
  const handleSubmitReply = async (id) => {
    if(!replyText.trim()) return;
    try {
        const res = await fetch(`http://localhost:5000/api/reviews/${id}/reply`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}` 
            },
            body: JSON.stringify({ reply: replyText })
        });

        if (res.ok) {
            const updatedReviews = reviews.map(r => 
                r.id === id ? { ...r, reply: replyText } : r
            );
            setReviews(updatedReviews);
            setReplyId(null);
            setReplyText("");
            alert("Reply posted successfully!");
        } else {
            alert("Failed to post reply.");
        }
    } catch(error) {
        alert("Network error while posting reply.");
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredReviews = filterRating === 'All' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Helper to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={14} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
    ));
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
              <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
      );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="bg-white sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">Patient Reviews</h2>
            </div>
            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          
          {/* 1. Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Reviews</p>
                      <h3 className="text-3xl font-black text-slate-800">{totalReviews}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageCircle size={24}/></div>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Average Rating</p>
                      <div className="flex items-center gap-2">
                          <h3 className="text-3xl font-black text-slate-800">{averageRating}</h3>
                          <div className="flex text-yellow-400">{renderStars(Math.round(Number(averageRating)))}</div>
                      </div>
                  </div>
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={24} fill="currentColor"/></div>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Satisfaction Rate</p>
                      <h3 className="text-3xl font-black text-slate-800">{satisfactionRate}%</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ThumbsUp size={24}/></div>
              </div>
          </div>

          {/* 2. Reviews Section */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              
              {/* Filter Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-lg font-bold text-slate-800">Recent Feedback</h3>
                  
                  <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500">Filter by:</span>
                      <div className="flex gap-2">
                          {['All', '5', '4', '3', '2', '1'].map(rating => (
                              <button 
                                key={rating}
                                onClick={() => { setFilterRating(rating); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                    filterRating === rating 
                                    ? 'bg-[#192a56] text-white shadow-md' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {rating === 'All' ? 'All' : <>{rating} <Star size={10} fill="currentColor"/></>}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Reviews List */}
              <div className="divide-y divide-slate-100">
                  {currentReviews.length > 0 ? (
                      currentReviews.map((review) => (
                          <div key={review.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                              <div className="flex items-start gap-4">
                                  <img src={review.img} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                                  
                                  <div className="flex-1">
                                      {/* Header Row */}
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <h4 className="font-bold text-slate-800">{review.name}</h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                  <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                                                  <span className="text-xs text-slate-400">• {review.date}</span>
                                              </div>
                                          </div>
                                          
                                          {/* Action Buttons (Visible on Hover) */}
                                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              {!review.reply && (
                                                  <button 
                                                    onClick={() => setReplyId(review.id === replyId ? null : review.id)} 
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                    title="Reply"
                                                  >
                                                      <Reply size={16}/>
                                                  </button>
                                              )}
                                              <button onClick={() => handleDelete(review.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                  <Trash2 size={16}/>
                                              </button>
                                          </div>
                                      </div>

                                      {/* Comment */}
                                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                                          {review.comment}
                                      </p>

                                      {/* Reply Section */}
                                      {review.reply && (
                                          <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                              <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="Doc" className="w-8 h-8 rounded-full border border-blue-200" />
                                              <div>
                                                  <p className="text-xs font-bold text-blue-800 mb-1">Your Reply</p>
                                                  <p className="text-xs text-slate-600">{review.reply}</p>
                                              </div>
                                          </div>
                                      )}

                                      {/* Reply Input Box */}
                                      {replyId === review.id && (
                                          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                              <textarea 
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-[#00d0f1] outline-none bg-white" 
                                                rows="2"
                                                placeholder="Type your reply here..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                              ></textarea>
                                              <div className="flex justify-end gap-2 mt-2">
                                                  <button onClick={() => setReplyId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                                  <button onClick={() => handleSubmitReply(review.id)} className="px-4 py-2 text-xs font-bold bg-[#192a56] text-white rounded-lg hover:bg-blue-900">Post Reply</button>
                                              </div>
                                          </div>
                                      )}

                                      {/* Footer */}
                                      <div className="mt-3 flex items-center gap-4">
                                          <button className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-blue-500 transition-colors">
                                              <ThumbsUp size={12}/> Helpful ({review.helpful || 0})
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="p-12 text-center text-slate-400">
                          <Star size={48} className="mx-auto mb-3 opacity-20"/>
                          <p>No reviews found for this rating.</p>
                      </div>
                  )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                  <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-500">
                          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length}
                      </span>
                      <div className="flex gap-2">
                          <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                          >
                              <ChevronLeft size={16}/>
                          </button>
                          {[...Array(totalPages)].map((_, i) => (
                              <button 
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold ${
                                    currentPage === i + 1 
                                    ? 'bg-[#192a56] text-white shadow-md' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {i + 1}
                              </button>
                          ))}
                          <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                          >
                              <ChevronRight size={16}/>
                          </button>
                      </div>
                  </div>
              )}

          </div>

        </main>
      </div>
    </div>
  );
};

export default DoctorReviews;