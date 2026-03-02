import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { Trash2, Star, Search, MessageSquare, User, Stethoscope, ChevronLeft, ChevronRight, Dog, Loader2 } from 'lucide-react';

const Reviews = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- PAGINATION & SEARCH STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Show 10 reviews per page
  const [searchTerm, setSearchTerm] = useState("");

  // --- API DATA STATE ---
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- GET AUTH TOKEN ---
  const getAuthToken = () => {
    let tokenStr = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (!tokenStr) return null;
    try { return JSON.parse(tokenStr).token || tokenStr; } catch (e) { return tokenStr; }
  };

  // --- 1. FETCH ALL REVIEWS FROM BACKEND ---
  useEffect(() => {
    const fetchAllReviews = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/reviews/all', {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        if(res.ok) {
            const data = await res.json();
            // Map MongoDB _id to id so frontend logic works seamlessly
            const formattedData = data.map(r => ({...r, id: r._id}));
            setReviews(formattedData);
        }
      } catch (error) {
        console.error("Error fetching all reviews", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllReviews();
  }, []);

  // --- 2. DELETE REVIEW HANDLER (Admin Power) ---
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to permanently delete this review?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            if(res.ok) {
                setReviews(reviews.filter(review => review.id !== id));
            } else {
                alert("Failed to delete review from server.");
            }
        } catch(error) {
            alert("Network error while deleting review.");
        }
    }
  };

  // --- PAGINATION LOGIC ---
  
  // 1. Filter Data first (Search safely with optional chaining)
  const filteredReviews = reviews.filter(
    (review) =>
      review.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Calculate Page Slices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // 3. Page Change Handlers
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // Helper for rendering star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill={i < rating ? "#facc15" : "none"} className={i < rating ? "text-yellow-400" : "text-slate-300"} />
    ));
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen relative">
      
      {/* Sidebar & Header */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Reviews Management</h1>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
                <Search size={18} className="absolute top-2.5 left-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search Patient or Doctor..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
                    className="w-full border border-slate-300 rounded-full pl-10 pr-4 py-2 focus:border-emerald-500 outline-none text-sm font-medium shadow-sm transition-all"
                />
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden p-6 animate-in fade-in duration-500">
            
            {/* Entries Selector */}
            <div className="flex justify-between items-center mb-4">
               <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  Show 
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                    className="border border-slate-300 rounded-md p-1 focus:outline-none focus:border-emerald-500 text-slate-700 font-bold"
                  >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                  </select> 
                  entries
               </div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Total Reviews: {filteredReviews.length}
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Patient / Owner</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 w-1/3">Comment</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentReviews.length > 0 ? (
                    currentReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-slate-50 transition-colors group">
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.patientImg || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                            <div>
                                <span className="font-bold text-slate-700 block text-sm line-clamp-1">{review.patientName}</span>
                                {review.type === 'pet' ? (
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mt-0.5"><Dog size={10} /> Owner</span>
                                ) : (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mt-0.5"><User size={10} /> Patient</span>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.doctorImg || "https://randomuser.me/api/portraits/men/85.jpg"} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                            <div>
                                <span className="font-bold text-slate-700 block text-sm line-clamp-1">{review.doctorName}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Stethoscope size={10} /> Doctor</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                            <div className="flex gap-0.5 mb-1">{renderStars(review.rating)}</div>
                            <span className="text-xs font-bold text-slate-500">{review.rating}.0</span>
                        </td>

                        <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed" title={review.comment}>{review.comment}</p>
                            {review.reply && (
                                <p className="text-xs text-blue-600 mt-1 line-clamp-1 border-l-2 border-blue-400 pl-2">
                                  <strong>Doc Reply:</strong> {review.reply}
                                </p>
                            )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {review.date}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(review.id)} 
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">
                            <div className="flex flex-col items-center gap-2">
                                <MessageSquare size={30} className="opacity-20" /> No reviews found matching your criteria.
                            </div>
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION FOOTER (1 to N) --- */}
            {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 border-t border-slate-100 pt-4">
                    <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                        Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredReviews.length)}</span> of <span className="font-bold text-slate-800">{filteredReviews.length}</span> entries
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {/* Page Numbers */}
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`px-3.5 py-1.5 text-sm font-bold rounded-lg transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-[#192a56] text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronRight size={16} />
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

export default Reviews;
