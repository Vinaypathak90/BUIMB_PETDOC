import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, Calendar, Clock, CheckCircle, 
  User, Phone, MessageSquare, AlertCircle, Navigation,
  CalendarPlus, Download, Shield, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackAppointment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState(null);

  // --- HELPER: SIMULATE LIVE STATUS ---
  // In a real app, this status would come from the backend or a WebSocket
  const calculateLiveStatus = (app) => {
      if (!app) return null;
      
      const isToday = new Date(app.date).toDateString() === new Date().toDateString();
      
      return {
        step: isToday ? 2 : 1, // 1: Confirmed (Future), 2: Waiting (Today)
        currentToken: isToday ? 14 : 0,
        yourToken: 18,
        estimatedWait: isToday ? "25 Mins" : "Scheduled",
        room: "Room 304 (2nd Floor)",
        hospitalLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.969802796123!2d77.22744331508193!3d28.60068498242969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2db961be393%3A0xf6c7ef5ee6dd10ae!2sIndia%20Gate!5e0!3m2!1sen!2sin!4v1626162391294!5m2!1sen!2sin"
      };
  };

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchLatest = async () => {
        const storedData = JSON.parse(localStorage.getItem('user_token'));
        if (!storedData) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/appointments/latest', {
                headers: { 'Authorization': `Bearer ${storedData.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setActiveAppointment(data);
                setLiveStatus(calculateLiveStatus(data));
            } else {
                setActiveAppointment(null); // No bookings found
            }
        } catch (error) {
            console.error("Error fetching tracking data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchLatest();
  }, [navigate]);

  if (isLoading) {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#192a56] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold animate-pulse">Syncing with Hospital...</p>
              </div>
          </div>
      );
  }

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
                <div>
                    <h2 className="text-xl font-black text-slate-800">Live Tracker</h2>
                    {activeAppointment && <p className="text-xs text-slate-500 font-medium">Booking ID: #{activeAppointment._id.slice(-6).toUpperCase()}</p>}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/user/book-appointment')} 
                    className="hidden sm:flex items-center gap-2 bg-[#192a56] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-md"
                >
                    <CalendarPlus size={18} /> New Booking
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          
          {activeAppointment && liveStatus ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- LEFT COLUMN: TRACKING STATUS --- */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* 1. Live Status Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-slate-800">Appointment Status</h3>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Live Updates
                            </span>
                        </div>

                        {/* Visual Timeline */}
                        <div className="relative flex justify-between mb-12 px-2">
                            {/* Connecting Line */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-10">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-1000 rounded-full" 
                                    style={{ width: liveStatus.step === 2 ? '66%' : '33%' }}
                                ></div>
                            </div>

                            {/* Step 1: Confirmed */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 border-4 border-white shadow-md flex items-center justify-center text-white">
                                    <CheckCircle size={18} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-800">Confirmed</p>
                                </div>
                            </div>

                            {/* Step 2: Doctor Assigned */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white ${liveStatus.step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <User size={18} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-800">Doctor Ready</p>
                                </div>
                            </div>

                            {/* Step 3: Waiting (Active) */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center ${liveStatus.step === 2 ? 'bg-[#00d0f1] text-[#192a56] animate-bounce' : 'bg-slate-200 text-white'}`}>
                                    <Clock size={18} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold ${liveStatus.step === 2 ? 'text-[#00d0f1]' : 'text-slate-400'}`}>In Queue</p>
                                </div>
                            </div>

                            {/* Step 4: Consultation */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white shadow-inner flex items-center justify-center text-slate-300">
                                    <CheckCircle size={18} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400">Consultation</p>
                                </div>
                            </div>
                        </div>

                        {/* Token Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase">Your Token</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">{liveStatus.yourToken}</p>
                            </div>
                            <div className="bg-[#00d0f1]/10 p-4 rounded-2xl border border-[#00d0f1]/20 text-center">
                                <p className="text-xs font-bold text-blue-800 uppercase">Current Token</p>
                                <p className="text-3xl font-black text-[#00d0f1] mt-1">{liveStatus.currentToken}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 text-center">
                                <p className="text-xs font-bold text-orange-800 uppercase">Est. Wait</p>
                                <p className="text-xl font-black text-orange-600 mt-2">{liveStatus.estimatedWait}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center flex flex-col justify-center items-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Room No.</p>
                                <p className="text-lg font-bold text-slate-800">{liveStatus.room}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Map Location */}
                    <div className="bg-white rounded-[2rem] p-1 shadow-sm border border-slate-200 overflow-hidden relative group">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Live Hospital Location
                        </div>
                        
                        <iframe 
                            src={liveStatus.hospitalLocation}
                            width="100%" 
                            height="320" 
                            style={{ border: 0, borderRadius: '1.8rem' }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            title="Hospital Map"
                            className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                        ></iframe>

                        <div className="absolute bottom-4 right-4 z-10">
                            <button className="bg-[#192a56] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-blue-900 transition-all">
                                <Navigation size={14} /> Get Directions
                            </button>
                        </div>
                    </div>

                </div>

                {/* --- RIGHT COLUMN: INFO & ACTIONS --- */}
                <div className="xl:col-span-1 space-y-6">
                    
                    {/* Doctor Profile Card */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Assigned Doctor</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <img 
                                src={activeAppointment.doctorImg || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                                alt="" 
                                className="w-16 h-16 rounded-2xl object-cover shadow-sm" 
                            />
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{activeAppointment.doctorName}</h3>
                                <p className="text-sm text-slate-500 font-medium">{activeAppointment.speciality}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-md">Online</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                                <Phone size={16} /> Call
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors">
                                <MessageSquare size={16} /> Chat
                            </button>
                        </div>
                    </div>

                    {/* Visit Details */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Visit Details</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <span className="text-sm text-slate-500">Patient</span>
                                <span className="text-sm font-bold text-slate-800">{activeAppointment.patientName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <span className="text-sm text-slate-500">Date</span>
                                <span className="text-sm font-bold text-slate-800">{activeAppointment.date}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Fee Paid</span>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold flex items-center gap-1">
                                    <Shield size={10}/> ₹{activeAppointment.fee}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Help Box */}
                    <div className="bg-[#192a56] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 bg-[#00d0f1] w-24 h-24 rounded-full blur-2xl opacity-20"></div>
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><AlertCircle size={20}/> Need Help?</h4>
                        <p className="text-blue-200 text-xs mb-4">Can't find the room? Call our reception desk.</p>
                        <p className="font-mono text-xl font-bold tracking-wide">+1 234 567 890</p>
                    </div>

                </div>

            </div>
          ) : (
            // EMPTY STATE (If no bookings exist)
            <div className="h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Calendar size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No Active Booking</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-md">You don't have any ongoing appointments. Book one to see the live status.</p>
                <button 
                    onClick={() => navigate('/user/book-appointment')} 
                    className="bg-[#00d0f1] text-[#192a56] px-8 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                >
                    <CalendarPlus size={20} /> Book Now
                </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default TrackAppointment;