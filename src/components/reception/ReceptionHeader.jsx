import React from 'react';
import { Menu, Search, Bell, Mail } from 'lucide-react';

const ReceptionHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shadow-sm relative z-10">
        
        {/* Left: Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-[#00d0f1] rounded-xl transition-colors"
            >
                <Menu size={24}/>
            </button>
            
            <div className="hidden md:block relative w-full max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search Patient, ID, or Doctor..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:ring-4 focus:ring-[#00d0f1]/10 transition-all"
                />
            </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors relative">
                <Mail size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
            </button>

            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-[#00d0f1] rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800">Reception Desk</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">● Active Now</p>
                </div>
            </div>
        </div>
    </header>
  );
};

export default ReceptionHeader;