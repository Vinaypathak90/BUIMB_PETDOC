import React from 'react';
import { 
  LayoutDashboard, CalendarPlus, MapPin, MonitorPlay, 
  BrainCircuit, History, CreditCard, Settings, LogOut, 
  ChevronRight 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const UserSidebar = ({ closeSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  const SidebarItem = ({ icon: Icon, label, path, active, badge }) => (
    <Link 
        to={path} 
        onClick={closeSidebar} 
        className={`flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all group font-medium relative ${
            active 
            ? 'bg-[#00d0f1] text-[#192a56] shadow-lg shadow-cyan-500/30 font-bold' 
            : 'text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon size={20} className={active ? "text-[#192a56]" : "group-hover:text-white transition-colors"} />
      <span className="flex-1">{label}</span>
      
      {/* Optional: Right Arrow for non-active items */}
      {!active && <ChevronRight size={16} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
      
      {/* Optional: Live Badge for Tracking */}
      {badge && (
        <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      )}
    </Link>
  );

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    navigate('/'); 
  };


  return (
    <div className="h-full flex flex-col bg-[#192a56] text-white">
      
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/10 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-white">PetDoc<span className="text-[#00d0f1]">.</span></h1>
      </div>

      {/* Navigation Links - LOGICAL SEQUENCE */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        
        {/* 1. Main Overview */}
        <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            path="/user/dashboard" 
            active={isActive('/user/dashboard')} 
        />

        {/* 2. Core Action: Booking */}
        <SidebarItem 
            icon={CalendarPlus} 
            label="Take Appointment" 
            path="/user/book-appointment" 
            active={isActive('/user/book-appointment')} 
        />

        {/* 3. Live Actions */}
        <SidebarItem 
            icon={MapPin} 
            label="Track Appointment" 
            path="/user/track-appointment" 
            active={isActive('/user/track-appointment')} 
            badge={true} // Red dot for live feel
        />

        

        {/* 4. Advanced AI */}
        <SidebarItem 
            icon={BrainCircuit} 
            label="AI Disease Analysis" 
            path="/user/ai-analysis" 
            active={isActive('/user/ai-analysis')} 
        />

        <div className="my-4 border-t border-white/10 mx-4"></div> {/* Divider */}

        {/* 5. Records & History */}
        <SidebarItem 
            icon={History} 
            label="Past Appointments" 
            path="/user/appointment-history" 
            active={isActive('/user/appointment-history')} 
        />

        <SidebarItem 
            icon={CreditCard} 
            label="Transaction History" 
            path="/user/transactions" 
            active={isActive('/user/transactions')} 
        />

        {/* 6. System */}
        <SidebarItem 
            icon={Settings} 
            label="Settings" 
            path="/user/settings" 
            active={isActive('/user/settings')} 
        />

      </nav>

      {/* Logout Button */}
<div className="p-4 border-t border-white/10 bg-[#152347] shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} /> <span className="truncate">Sign Out</span>
          </button>
        </div>

    </div>
  );
};

export default UserSidebar;