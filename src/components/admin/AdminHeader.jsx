import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar }) => {
  const [profile, setProfile] = useState({
    name: 'Admin',
    role: 'Super Admin',
    img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' // Default fallback
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // --- 1. FETCH ADMIN PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      if (!storedData || !storedData.token) return;

      try {
        const res = await fetch('http://localhost:5000/api/user/admin-profile', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setProfile({
            name: data.name,
            role: data.role === 'admin' ? 'Super Admin' : data.role,
            img: data.img || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          });
        }
      } catch (err) {
        console.error("Failed to load header profile");
      }
    };

    fetchProfile();
  }, []);

  // --- 2. LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 transition-all shadow-sm">
      
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
          <Menu />
        </button>
        
        {/* Search Bar */}
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
        
        {/* Notification Bell */}
        <div className="relative cursor-pointer group">
          <div className="p-2.5 bg-slate-50 group-hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </div>
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
            <div 
                className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
            <img 
                src={profile.img} 
                alt="Admin" 
                className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100"
            />
            <div className="hidden sm:block text-left">
                <p className="text-sm font-extrabold text-slate-800 leading-none">{profile.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{profile.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <button 
                        onClick={() => navigate('/admin/profile')}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                        <User size={16} /> My Profile
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;