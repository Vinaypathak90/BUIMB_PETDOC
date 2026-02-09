import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { Trash2, Star, Search, MessageSquare, User, Stethoscope, ChevronLeft, ChevronRight, Dog } from 'lucide-react';

const Reviews = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- PAGINATION & SEARCH STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Show 10 reviews per page
  const [searchTerm, setSearchTerm] = useState("");

  // --- DUMMY REVIEWS DATA (Year 2026) ---
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      patientName: "Charlene Reed", 
      patientImg: "https://randomuser.me/api/portraits/women/22.jpg",
      doctorName: "Dr. Ruby Perrin",
      doctorImg: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment: "Great experience! The doctor was very gentle with my dental procedure.",
      date: "12 Jan 2026, 10:00 AM",
      type: "human"
    },
    { 
      id: 2, 
      patientName: "Travis Trimble (Owner of Bruno)", 
      patientImg: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100", 
      doctorName: "Dr. Darren Elder",
      doctorImg: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4,
      comment: "Good service for my dog, but the waiting time was a bit long.",
      date: "15 Jan 2026, 05:30 PM",
      type: "pet"
    },
    { 
      id: 3, 
      patientName: "Carl Kelly", 
      patientImg: "https://randomuser.me/api/portraits/men/45.jpg",
      doctorName: "Dr. Deborah Angel",
      doctorImg: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      comment: "Dr. Deborah is a lifesaver. Best cardiologist in town.",
      date: "20 Jan 2026, 09:15 AM",
      type: "human"
    },
    { 
      id: 4, 
      patientName: "Gina Moore (Owner of Milo)", 
      patientImg: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100",
      doctorName: "Dr. Sofia Brient",
      doctorImg: "https://randomuser.me/api/portraits/women/65.jpg",
      rating: 2,
      comment: "Not satisfied. The diagnosis felt rushed.",
      date: "22 Jan 2026, 02:00 PM",
      type: "pet"
    },
    { 
      id: 5, 
      patientName: "Elsie Gilley", 
      patientImg: "https://randomuser.me/api/portraits/women/12.jpg",
      doctorName: "Dr. Katharine Berthold",
      doctorImg: "https://randomuser.me/api/portraits/women/33.jpg",
      rating: 5,
      comment: "Very professional and clean clinic.",
      date: "05 Feb 2026, 11:45 AM",
      type: "human"
    },
    { 
      id: 6, 
      patientName: "Joan Gardner", 
      patientImg: "https://randomuser.me/api/portraits/women/55.jpg",
      doctorName: "Dr. Linda Tobin",
      doctorImg: "https://randomuser.me/api/portraits/women/20.jpg",
      rating: 4,
      comment: "The staff is very helpful.",
      date: "08 Feb 2026, 03:20 PM",
      type: "human"
    },
    { 
      id: 7, 
      patientName: "Daniel Griffing", 
      patientImg: "https://randomuser.me/api/portraits/men/66.jpg",
      doctorName: "Dr. Paul Richard",
      doctorImg: "https://randomuser.me/api/portraits/men/11.jpg",
      rating: 3,
      comment: "Average experience. Could be better.",
      date: "10 Feb 2026, 09:00 AM",
      type: "human"
    },
    { 
      id: 8, 
      patientName: "Walter Roberson (Owner of Max)", 
      patientImg: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=100&h=100",
      doctorName: "Dr. Marvin Campbell",
      doctorImg: "https://randomuser.me/api/portraits/men/51.jpg",
      rating: 5,
      comment: "Max is feeling much better now! Thanks doc.",
      date: "14 Feb 2026, 06:15 PM",
      type: "pet"
    },
    { 
      id: 9, 
      patientName: "Robert Rhodes", 
      patientImg: "https://randomuser.me/api/portraits/men/77.jpg",
      doctorName: "Dr. Olga Barlow",
      doctorImg: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 4,
      comment: "Good consultation.",
      date: "18 Feb 2026, 12:30 PM",
      type: "human"
    },
    { 
      id: 10, 
      patientName: "Harry Williams", 
      patientImg: "https://randomuser.me/api/portraits/men/15.jpg",
      doctorName: "Dr. Ruby Perrin",
      doctorImg: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment: "Best dentist ever!",
      date: "20 Feb 2026, 10:00 AM",
      type: "human"
    },
    { 
      id: 11, 
      patientName: "Sarah Connor (Owner of Kitty)", 
      patientImg: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=100&h=100",
      doctorName: "Dr. Darren Elder",
      doctorImg: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      comment: "Very kind to my cat.",
      date: "25 Feb 2026, 04:00 PM",
      type: "pet"
    },
    { 
      id: 12, 
      patientName: "Mike Ross", 
      patientImg: "https://randomuser.me/api/portraits/men/88.jpg",
      doctorName: "Dr. Deborah Angel",
      doctorImg: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4,
      comment: "Professional approach.",
      date: "28 Feb 2026, 11:00 AM",
      type: "human"
    }
  ]);

  // --- PAGINATION LOGIC ---
  
  // 1. Filter Data first (Search)
  const filteredReviews = reviews.filter(
    (review) =>
      review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
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


  // --- HANDLERS ---
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill={i < rating ? "#facc15" : "none"} className={i < rating ? "text-yellow-400" : "text-slate-300"} />
    ));
  };

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
            <h1 className="text-2xl font-bold text-slate-800">Reviews (2026)</h1>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
                <Search size={18} className="absolute top-2.5 left-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search Patient or Doctor..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
                    className="w-full border border-slate-300 rounded-full pl-10 pr-4 py-2 focus:border-emerald-500 outline-none text-sm font-medium"
                />
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden p-6">
            
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
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
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
                      <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.patientImg} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                            <div>
                                <span className="font-bold text-slate-700 block text-sm">{review.patientName}</span>
                                {review.type === 'pet' ? (
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit"><Dog size={10} /> Owner</span>
                                ) : (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit"><User size={10} /> Patient</span>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.doctorImg} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                            <div>
                                <span className="font-bold text-slate-700 block text-sm">{review.doctorName}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Stethoscope size={10} /> Doctor</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                            <div className="flex gap-0.5 mb-1">{renderStars(review.rating)}</div>
                            <span className="text-xs font-bold text-slate-500">{review.rating}.0</span>
                        </td>

                        <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{review.comment}</p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                            {review.date}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(review.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">
                            <div className="flex flex-col items-center gap-2">
                                <MessageSquare size={30} className="opacity-20" /> No reviews found.
                            </div>
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION FOOTER (1 to N) --- */}
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
                    
                    {/* Page Numbers (1, 2, 3...) */}
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

          </div>

        </main>
      </div>
    </div>
  );
};

export default Reviews;