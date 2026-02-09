import React from 'react';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';

const AdminHeader = ({ toggleSidebar }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 transition-all shadow-sm">
      
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
          <Menu />
        </button>
        
        {/* Doccure Style Rounded Search Bar */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 px-6 py-2.5 rounded-full w-full max-w-md border border-transparent focus-within:border-emerald-200 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search doctors, patients..." 
            className="bg-transparent border-none outline-none text-sm font-semibold text-slate-700 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer group">
          <div className="p-2.5 bg-slate-50 group-hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
        </div>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="Admin" 
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-none">Vinay Pathak</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Super Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;
