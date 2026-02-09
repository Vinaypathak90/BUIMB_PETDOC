import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, Ticket, 
  Stethoscope, UserPlus, CreditCard, Bell, 
  FileBarChart, User, LogOut, X 
} from 'lucide-react';
import LogoutModal from './LogoutModal';

const ReceptionSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  
  // ✅ 1. State for Logout Modal
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // ✅ 2. Handle Logout Action
  const handleLogout = () => {
    // Clear session/local storage
    localStorage.removeItem('user_token'); 
    localStorage.removeItem('reception_data'); // Optional: Clear data if needed
    
    // Redirect to Login
    window.location.href = '/'; 
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients List', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'queue', label: 'Live Queue', icon: Ticket },
    { id: 'doctors', label: 'Doctors Status', icon: Stethoscope },
    { id: 'walkin', label: 'Walk-In Entry', icon: UserPlus },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Daily Reports', icon: FileBarChart },
    { type: 'divider' },
    { id: 'profile', label: 'My Profile', icon: User },
    
    { id: 'logout', label: 'Logout', icon: LogOut, danger: true },
  ];

  return (
    <>
      <aside 
        className={`fixed md:relative z-30 h-full bg-[#1e293b] text-white border-r border-slate-700 transition-all duration-300 flex flex-col
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
        `}
      >
        {/* --- A. Logo Section --- */}
        <div className="h-20 flex items-center px-5 border-b border-slate-700 relative">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#00d0f1] to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 shrink-0">
              P
          </div>
          
          {isSidebarOpen && (
              <div className="ml-3 animate-in fade-in duration-300">
                  <h1 className="font-bold text-lg tracking-tight text-white">PetDoc<span className="text-[#00d0f1]">Pro</span></h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reception</p>
              </div>
          )}

          {/* Mobile Close Button */}
          <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden absolute right-4 text-slate-400 hover:text-white"
          >
              <X size={20}/>
          </button>
        </div>

        {/* --- B. Menu Items --- */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <ul className="space-y-1">
              {menuItems.map((item, index) => {
                  if (item.type === 'divider') {
                      return isSidebarOpen ? <li key={index} className="my-4 border-t border-slate-700 mx-2"></li> : null;
                  }

                  return (
                      <li key={item.id}>
                          <button
                              onClick={() => {
                                  // ✅ 3. Check for Logout ID
                                  if (item.id === 'logout') {
                                      setIsLogoutOpen(true);
                                  } else {
                                      setActiveTab(item.id);
                                  }
                                  // Close sidebar on mobile
                                  if(window.innerWidth < 768) setIsSidebarOpen(false); 
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative
                                  ${activeTab === item.id 
                                      ? 'bg-[#00d0f1] text-[#1e293b] shadow-lg shadow-cyan-500/20' 
                                      : item.danger 
                                          ? 'text-red-400 hover:bg-red-500/10' 
                                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                  }
                              `}
                          >
                              <item.icon 
                                  size={20} 
                                  strokeWidth={activeTab === item.id ? 2.5 : 2}
                                  className={activeTab === item.id ? 'animate-pulse' : ''}
                              />
                              
                              {isSidebarOpen && <span className="truncate">{item.label}</span>}

                              {/* Tooltip for collapsed mode */}
                              {!isSidebarOpen && (
                                  <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none border border-slate-700">
                                      {item.label}
                                  </div>
                              )}
                          </button>
                      </li>
                  );
              })}
          </ul>
        </nav>

        {/* --- C. Footer Profile --- */}
        <div className="p-4 border-t border-slate-700 bg-[#0f172a]">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-slate-600 border-2 border-slate-500 overflow-hidden shrink-0">
                  <img src="https://ui-avatars.com/api/?name=Vinay+P&background=random" alt="User" />
              </div>
              {isSidebarOpen && (
                  <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">Vinay Pathak</p>
                      <p className="text-[10px] text-slate-400 uppercase">Online</p>
                  </div>
              )}
          </div>
        </div>
      </aside>

      {/* ✅ 4. Render Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
};

export default ReceptionSidebar;