import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid, 
  Users, 
  UserPlus, 
  User, 
  Star, 
  BarChart, 
  Settings, 
  FileText, 
  ChevronRight,
  Lock,
  LogOut
} from 'lucide-react';

const AdminSidebar = ({ closeSidebar }) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState('');

  // Helper to toggle submenus (like Reports/Authentication)
  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? '' : name);
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-[#192a56] text-white flex flex-col overflow-y-auto font-sans scrollbar-hide border-r border-slate-700/30">
      
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 mb-4">
        <span className="text-xl font-bold tracking-tight">Doccure <span className="text-[#00d0f1]">Admin</span></span>
      </div>

      <div className="flex-1 py-4">
        {/* --- MAIN SECTION --- */}
        <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Main
        </div>
        
        <ul className="space-y-1 mb-6">
          <SidebarItem 
            icon={Home} 
            label="Dashboard" 
            path="/admin/dashboard" 
            active={isActive('/admin/dashboard')} 
          />
          <SidebarItem 
            icon={LayoutGrid} 
            label="Appointments" 
            path="/admin/appointments" 
            active={isActive('/admin/appointments')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Specialities" 
            path="/admin/specialities" 
            active={isActive('/admin/specialities')} 
          />
          <SidebarItem 
            icon={UserPlus} 
            label="Doctors" 
            path="/admin/doctors" 
            active={isActive('/admin/doctors')} 
          />
          <SidebarItem 
            icon={User} 
            label="Patients" 
            path="/admin/patients" 
            active={isActive('/admin/patients')} 
          />
          <SidebarItem 
            icon={Star} 
            label="Reviews" 
            path="/admin/reviews" 
            active={isActive('/admin/reviews')} 
          />
          <SidebarItem 
            icon={BarChart} 
            label="Transactions" 
            path="/admin/transactions" 
            active={isActive('/admin/transactions')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            path="/admin/settings" 
            active={isActive('/admin/settings')} 
          />
          

        </ul>

        {/* --- PAGES SECTION --- */}
        <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Pages
        </div>

        <ul className="space-y-1 pb-10">
          <SidebarItem 
            icon={User} 
            label="Profile" 
            path="/admin/profile" 
            active={isActive('/admin/profile')} 
          />
          
          {/* Item with Submenu (Authentication) */}
          <li className="px-3">
            <button 
              onClick={() => toggleSubmenu('auth')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span className="text-sm font-medium">Authentication</span>
              </div>
              <ChevronRight size={16} className={`transition-transform ${openSubmenu === 'auth' ? 'rotate-90' : ''}`} />
            </button>
            
            {/* Dropdown Content */}
            {openSubmenu === 'auth' && (
              <div className="pl-10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <Link to="/login" className="block text-sm text-slate-400 hover:text-[#00d0f1] py-1">Login</Link>
                <Link to="/signup" className="block text-sm text-slate-400 hover:text-[#00d0f1] py-1">Register</Link>
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Logout Footer (Optional but nice) */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors w-full px-3">
          <LogOut size={18} />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};

// --- Reusable Sidebar Item Component ---
const SidebarItem = ({ icon: Icon, label, path, active }) => {
  return (
    <li className="px-3">
      <Link 
        to={path} 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
          active 
            ? 'bg-[#00d0f1] text-white shadow-lg shadow-cyan-500/20' 
            : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
};

export default AdminSidebar;