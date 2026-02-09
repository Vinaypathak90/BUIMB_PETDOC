import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, Search, Filter, Download, FileText, 
  RotateCcw, Eye, Star, Calendar, Clock, CheckCircle, XCircle,
  MapPin, Shield, DollarSign, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PastAppointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  
  // --- MODAL STATES ---
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ratingModal, setRatingModal] = useState(null); // Stores appointment ID to rate

  const navigate = useNavigate();

  // --- MOCK DATA (Merged with LocalStorage) ---
  const mockHistory = [
    { 
      id: 101, doctorName: "Dr. Ruby Perrin", speciality: "Dentist", 
      date: "2023-10-12", time: "10:00 AM", status: "Completed", 
      patient: "Vinay Pathak", fee: 500, rating: 5, type: "Myself",
      prescription: { meds: ["Paracetamol - 500mg (2x)", "Amoxicillin - 250mg"], note: "Take rest for 2 days. Avoid cold water.", followUp: "2023-10-20" }
    },
    { 
      id: 102, doctorName: "Dr. Darren Elder", speciality: "Pet Surgery", 
      date: "2023-09-25", time: "02:30 PM", status: "Cancelled", 
      patient: "Bruno (Dog)", fee: 800, rating: 0, type: "Pet",
      prescription: null 
    },
    { 
      id: 103, doctorName: "Dr. Sofia Brient", speciality: "Urology", 
      date: "2023-08-14", time: "11:00 AM", status: "Completed", 
      patient: "Vinay Pathak", fee: 600, rating: 0, type: "Myself", // Rating 0 means not rated yet
      prescription: { meds: ["Cital - Syrup (10ml)", "Urimax - 0.4mg"], note: "Drink plenty of water.", followUp: "No need" }
    }
  ];

  // --- LOAD DATA ---
  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem('myAppointments')) || [];
    // Combine mock data with local data for demo
    setAppointments([...localData, ...mockHistory]);
  }, []);

  // --- HANDLERS ---
  const handleRateDoctor = (id, stars) => {
    // Update local state to reflect rating
    const updatedList = appointments.map(app => 
      app.id === id ? { ...app, rating: stars } : app
    );
    setAppointments(updatedList);
    setRatingModal(null);
    alert("Thank you for your feedback!");
  };

  const filteredList = appointments.filter(app => {
    const matchStatus = activeTab === 'all' ? true : app.status?.toLowerCase() === activeTab;
    const matchSearch = app.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || app.speciality?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-slate-800">Medical History</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. FILTERS & TABS */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto max-w-full">
                    {['all', 'upcoming', 'completed', 'cancelled'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                activeTab === tab ? 'bg-[#192a56] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full xl:w-80 group">
                    <Search size={18} className="absolute top-3.5 left-3.5 text-slate-400 group-focus-within:text-[#00d0f1] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search doctor, speciality..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:border-[#00d0f1] outline-none font-medium text-slate-700 text-sm shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* 2. APPOINTMENT CARDS */}
            <div className="space-y-5">
                {filteredList.length > 0 ? (
                    filteredList.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                            {/* Status Bar */}
                            <div className={`absolute top-0 left-0 h-full w-1.5 ${
                                app.status === 'Completed' ? 'bg-emerald-500' : app.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pl-4">
                                
                                {/* Doctor Info */}
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <img src={app.doctorImg || `https://ui-avatars.com/api/?name=${app.doctorName}&background=random`} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100" />
                                        <span className={`absolute -bottom-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-white text-[10px] border-2 border-white ${
                                            app.status === 'Completed' ? 'bg-emerald-500' : app.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}>
                                            {app.status === 'Completed' ? <CheckCircle size={12}/> : app.status === 'Cancelled' ? <XCircle size={12}/> : <Clock size={12}/>}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">{app.doctorName}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{app.speciality}</p>
                                        <p className="text-xs text-slate-400 mt-1">Patient: <span className="font-bold text-slate-600">{app.patient}</span></p>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-600">
                                        <Calendar size={16} className="text-slate-400"/>
                                        <span className="font-bold">{app.date}</span>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-600">
                                        <Clock size={16} className="text-slate-400"/>
                                        <span className="font-bold">{app.time}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                                    
                                    {/* Rate Button (If Completed & Not Rated) */}
                                    {app.status === 'Completed' && (!app.rating || app.rating === 0) && (
                                        <button onClick={() => setRatingModal(app.id)} className="px-4 py-2 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100 transition-colors flex items-center gap-2">
                                            <Star size={14}/> Rate Visit
                                        </button>
                                    )}

                                    {/* Rated Badge */}
                                    {app.rating > 0 && (
                                        <div className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-100">
                                            <Star size={14} fill="currentColor"/> {app.rating}.0
                                        </div>
                                    )}

                                    {/* Invoice */}
                                    <button onClick={() => setSelectedInvoice(app)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors tooltip" title="Invoice">
                                        <DollarSign size={18}/>
                                    </button>

                                    {/* Prescription (Only if Completed) */}
                                    {app.status === 'Completed' && (
                                        <button onClick={() => setSelectedPrescription({ ...app.prescription, doctor: app.doctorName, date: app.date })} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-[#00d0f1] transition-colors flex items-center gap-2">
                                            <Eye size={14}/> View Rx
                                        </button>
                                    )}

                                    {/* Book Again */}
                                    <button onClick={() => navigate('/user/book-appointment')} className="px-5 py-2 bg-[#192a56] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-all shadow-md shadow-blue-900/10 flex items-center gap-2">
                                        <RotateCcw size={14}/> Book Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300">
                        <FileText size={64} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No appointments found.</h3>
                        <p className="text-sm text-slate-300 mt-1">Try changing the filters or book a new appointment.</p>
                        <button onClick={() => navigate('/user/book-appointment')} className="mt-6 text-[#00d0f1] font-bold hover:underline">Book Now</button>
                    </div>
                )}
            </div>

          </div>
        </main>
      </div>

      {/* --- 1. PRESCRIPTION MODAL --- */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="bg-[#192a56] p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={18}/> Digital Prescription</h3>
                        <p className="text-xs text-blue-200 opacity-80 mt-1">Dr. {selectedPrescription.doctor} • {selectedPrescription.date}</p>
                    </div>
                    <button onClick={() => setSelectedPrescription(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Medicines Prescribed</h4>
                        <ul className="space-y-3">
                            {selectedPrescription.meds?.map((med, i) => (
                                <li key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">{i+1}</div>
                                    <span className="text-sm font-bold text-slate-700">{med}</span>
                                </li>
                            )) || <p className="text-sm text-slate-400 italic">No medicines recorded.</p>}
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2">Doctor's Note</h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedPrescription.note || "No notes available."}</p>
                    </div>

                    <button className="w-full bg-[#00d0f1] text-[#192a56] py-3.5 rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- 2. INVOICE MODAL --- */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-800">Invoice Details</h3>
                    <button onClick={() => setSelectedInvoice(null)}><X size={20} className="text-slate-400 hover:text-slate-800"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Consultation Fee</span><span className="font-bold text-slate-800">₹{selectedInvoice.fee}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Booking Charges</span><span className="font-bold text-slate-800">₹50</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">GST (18%)</span><span className="font-bold text-slate-800">₹{Math.round(selectedInvoice.fee * 0.18)}</span></div>
                    <div className="border-t border-dashed border-slate-300 pt-4 flex justify-between text-lg">
                        <span className="font-bold text-slate-800">Total Paid</span>
                        <span className="font-black text-emerald-600">₹{selectedInvoice.fee + 50 + Math.round(selectedInvoice.fee * 0.18)}</span>
                    </div>
                    <button className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900">
                        <Download size={16} /> Download Receipt
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- 3. RATING MODAL --- */}
      {ratingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2">Rate your experience</h3>
                <p className="text-sm text-slate-500 mb-6">How was your appointment with the doctor?</p>
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleRateDoctor(ratingModal, star)} className="p-2 hover:scale-110 transition-transform">
                            <Star size={32} className="text-slate-200 hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                        </button>
                    ))}
                </div>
                <button onClick={() => setRatingModal(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold underline">Skip for now</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default PastAppointments;