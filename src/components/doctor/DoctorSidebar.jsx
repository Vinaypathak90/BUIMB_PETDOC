import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Calendar, Users, MessageSquare, 
  Clock, CreditCard, Settings, LogOut, FileText, Star, Share2, Lock,
  Power, X, Stethoscope // <--- Added Stethoscope Icon
} from 'lucide-react';

const DoctorSidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);

  const handleLogout = () => {
    navigate('/'); 
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutGrid },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', path: '/doctor/patients', icon: Users },
    { name: 'Specialties & Services', path: '/doctor/specialties', icon: Stethoscope }, // <--- Added Here
    { name: 'Schedule Timings', path: '/doctor/schedule', icon: Clock },
    { name: 'Invoices', path: '/doctor/invoices', icon: FileText },
    { name: 'Reviews', path: '/doctor/reviews', icon: Star },
    { name: 'Chat', path: '/doctor/messages', icon: MessageSquare },
    { name: 'Profile Settings', path: '/doctor/profile-settings', icon: Settings },
    ];

  return (
    <>
      {/* CSS to Hide Scrollbar but keep functionality */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      {/* Main Sidebar Container */}
      <div className="h-full w-full bg-[#192a56] text-white flex flex-col shadow-2xl overflow-y-auto no-scrollbar relative">
        
        {/* --- MOBILE CLOSE BUTTON --- */}
        <button 
            onClick={closeSidebar} 
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 lg:hidden z-50 transition-all"
        >
            <X size={20} />
        </button>

        {/* --- PROFILE SECTION --- */}
        <div className="pt-10 pb-6 px-4 text-center bg-[#1e3a8a]/20 border-b border-white/10 shrink-0">
          
          <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
            <img 
              src="https://randomuser.me/api/portraits/men/85.jpg" 
              alt="Doctor" 
              className={`w-full h-full rounded-full object-cover border-4 transition-all duration-300 ${isAvailable ? 'border-emerald-400' : 'border-slate-500 grayscale'}`}
            />
            <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-[#192a56] rounded-full transition-all duration-300 ${isAvailable ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
          </div>

          <h3 className="text-lg font-bold tracking-wide truncate px-2">Dr. Edalin Hendry</h3>
          <p className="text-xs text-blue-200 font-medium uppercase tracking-wider mt-1 truncate px-2">BDS, MDS - Oral Surgery</p>

          <button 
            onClick={toggleAvailability}
            className={`mt-5 px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-all duration-300 shadow-lg w-full max-w-[180px] ${
              isAvailable 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white' 
              : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-600 hover:text-white'
            }`}
          >
            <Power size={14} className={isAvailable ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : ""} />
            {isAvailable ? "Available" : "Offline"}
          </button>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          <p className="px-4 text-[10px] font-black text-blue-300/50 uppercase tracking-[2px] mb-2">Menu</p>
          
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group
                ${isActive 
                  ? 'bg-[#00d0f1] text-[#192a56] shadow-lg shadow-cyan-500/20 translate-x-1' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`shrink-0 ${isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} 
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* --- LOGOUT --- */}
        <div className="p-4 border-t border-white/10 bg-[#152347] shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} /> <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DoctorSidebar;