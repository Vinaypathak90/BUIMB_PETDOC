import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Calendar, Users, MessageSquare, 
  Clock, Settings, LogOut, FileText, Star, 
  Power, X, Stethoscope 
} from 'lucide-react';

// 🚨 Yahan LogoutModal import kiya gaya hai (Agar dusre folder me hai to path change karein, e.g., '../LogoutModal')
import LogoutModal from './DoctorLogoutModal'; 

const DoctorSidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState({
    name: "Loading...",
    img: "",
    qualification: "",
    status: "off duty"
  });

  // 🚨 Logout Modal ki state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 🧠 Token Helper
  const getToken = () => {
    try {
        const uToken = JSON.parse(localStorage.getItem('user_token'));
        if (uToken?.token) return uToken.token;
        const uInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (uInfo?.token) return uInfo.token;
        return localStorage.getItem('token');
    } catch (e) { return null; }
  };

  // --- 1. Load Initial Profile Data ---
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/doctor/sidebar-profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setDoctor({
            name: data.name,
            img: data.img,
            qualification: data.qualification || data.speciality || "Specialist",
            status: data.status || "off duty"
          });
        }
      } catch (err) {
        console.error("Sidebar fetch error", err);
      }
    };
    fetchSidebarData();
  }, [location.pathname]);

  // --- 2. ACTUAL API CALL FOR TOGGLE ---
  const toggleAvailability = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/doctor/toggle-status', {
        method: 'PATCH',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDoctor(prev => ({ ...prev, status: data.status }));
      } else {
        alert("Status change failed at server.");
      }
    } catch (err) {
      alert("Failed to update status. Check connection.");
    }
  };

  // 🚨 Actual Logout Function (Jo modal confirm hone pe chalega)
  const handleConfirmLogout = () => {
    localStorage.clear();
    setIsLogoutModalOpen(false); // Modal band karo
    navigate('/'); // Login screen pe bhejo
  };

  const isAvailable = doctor.status === 'on duty';

  const navLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutGrid },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', path: '/doctor/patients', icon: Users },
    { name: 'Specialties & Services', path: '/doctor/specialties', icon: Stethoscope },
    { name: 'Schedule Timings', path: '/doctor/schedule', icon: Clock },
    { name: 'Invoices', path: '/doctor/invoices', icon: FileText },
    { name: 'Reviews', path: '/doctor/reviews', icon: Star },
    { name: 'Chat', path: '/doctor/messages', icon: MessageSquare },
    { name: 'Profile Settings', path: '/doctor/profile-settings', icon: Settings },
  ];

  return (
    <>
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* SIDEBAR MAIN CONTAINER */}
      <div className="h-full w-full bg-[#192a56] text-white flex flex-col shadow-2xl overflow-y-auto no-scrollbar relative">
        
        <button onClick={closeSidebar} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white lg:hidden z-50 transition-all">
            <X size={20} />
        </button>

        {/* PROFILE SECTION */}
        <div className="pt-10 pb-6 px-4 text-center bg-[#1e3a8a]/20 border-b border-white/10 shrink-0">
          <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer" onClick={() => navigate('/doctor/profile-settings')}>
            <img 
              src={doctor.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random&color=fff`} 
              alt="Doctor" 
              className={`w-full h-full rounded-full object-cover border-4 transition-all duration-500 ${isAvailable ? 'border-emerald-400' : 'border-slate-500 grayscale'}`}
            />
            <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-[#192a56] rounded-full transition-all duration-300 ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
          </div>

          <h3 className="text-lg font-black tracking-wide truncate px-2">{doctor.name}</h3>
          <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-1 truncate px-2 opacity-80">{doctor.qualification}</p>

          <button 
            onClick={toggleAvailability}
            className={`mt-5 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 mx-auto transition-all duration-300 shadow-lg w-full max-w-[180px] ${
              isAvailable 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-slate-700 text-slate-300 border border-slate-600'
            }`}
          >
            <Power size={14} />
            {isAvailable ? "AVAILABLE / ON DUTY" : "OFFLINE / OFF DUTY"}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                ${isActive 
                  ? 'bg-[#00d0f1] text-[#192a56] shadow-lg shadow-cyan-500/20 translate-x-1' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }
              `}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT BUTTON IN SIDEBAR */}
        <div className="p-4 border-t border-white/10 bg-[#152347] shrink-0">
          <button 
            onClick={() => setIsLogoutModalOpen(true)} // 🚨 Seedha logout karne ki jagah Modal open hoga
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-xs font-black text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} /> <span className="truncate uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>

      {/* 🚨 YAHAN HUM APNE MODAL COMPONENT KO USE KAR RAHE HAIN 🚨 */}
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />
      
    </>
  );
};

export default DoctorSidebar;