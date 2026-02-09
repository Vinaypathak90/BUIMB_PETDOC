import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  User, Lock, Shield, Camera, Mail, Phone, MapPin, Calendar, 
  Save, Edit2, Key, Users, CheckCircle, Activity, Image as ImageIcon, Check
} from 'lucide-react';

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);

  // --- INITIAL DATA (Default agar kuch saved na ho) ---
  const defaultProfile = {
    name: "Vinay Pathak",
    role: "Super Admin",
    email: "vinay@petdoc.com",
    phone: "+91 98765 43210",
    dob: "1998-08-15",
    address: "123, Tech Park, Bangalore, India",
    bio: "Lead developer and administrator for PetDoc AI system.",
    img: "https://randomuser.me/api/portraits/men/75.jpg",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000" 
  };

  // --- STATE WITH LOCAL STORAGE ---
  const [profile, setProfile] = useState(() => {
    // Check if data exists in LocalStorage
    const savedData = localStorage.getItem('adminProfile');
    return savedData ? JSON.parse(savedData) : defaultProfile;
  });

  // --- SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('adminProfile', JSON.stringify(profile));
  }, [profile]);

  // --- HANDLERS ---
  
  // 1. Profile Pic Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file); // Convert to Base64 string for LocalStorage
    }
  };

  // 2. Cover Photo Change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, cover: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Save Button Animation
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    // Data is already saved via useEffect, just show feedback
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen relative">
      
      {/* Sidebar & Header */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          
          {/* --- PROFILE HEADER CARD --- */}
          <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden mb-8 border border-slate-200 relative group">
             
             {/* Cover Image Section */}
             <div className="h-64 w-full relative">
                <img src={profile.cover} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Change Cover Button */}
                <label className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-black/70 transition-all flex items-center gap-2 border border-white/20 shadow-lg">
                    <ImageIcon size={16} />
                    <span className="text-xs font-bold">Change Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                </label>
             </div>

             {/* Profile Info Section */}
             <div className="px-8 pb-6 relative flex flex-col md:flex-row items-end md:items-end gap-6">
                
                {/* Avatar */}
                <div className="-mt-16 relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100 relative z-10">
                        <img src={profile.img} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    {/* Camera Icon */}
                    <label className="absolute bottom-1 right-1 bg-emerald-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-emerald-600 transition-all z-20 border-2 border-white">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>

                {/* Name & Role */}
                <div className="flex-1 mb-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                                <span className="text-slate-500 font-bold text-sm">{profile.role}</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 border border-blue-200">
                                    <CheckCircle size={10} /> Verified Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* --- TABS & CONTENT --- */}
          <div className="flex flex-col xl:flex-row gap-8">
             
             {/* Left: Navigation Tabs */}
             <div className="w-full xl:w-72 flex-shrink-0 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <nav className="space-y-1">
                        <TabButton icon={User} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton icon={Lock} label="Password & Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                        <TabButton icon={Users} label="Admin Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                    </nav>
                </div>

                {/* Quick Info Widget */}
                <div className="bg-gradient-to-br from-[#192a56] to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={18}/> Login Activity</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span>Last Login</span>
                            <span className="text-white font-mono">Today, 10:20 AM</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Device</span>
                            <span className="text-white">Chrome (Windows)</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Right: Main Content */}
             <div className="flex-1">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Personal Details</h2>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Full Name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} icon={User} />
                            <InputGroup label="Email ID" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} icon={Mail} />
                            <InputGroup label="Phone Number" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} icon={Phone} />
                            <InputGroup label="Date of Birth" value={profile.dob} onChange={(e) => setProfile({...profile, dob: e.target.value})} type="date" icon={Calendar} />
                            <div className="md:col-span-2">
                                <InputGroup label="Address" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} icon={MapPin} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Bio</label>
                                <textarea 
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-medium text-slate-700 min-h-[100px]"
                                    value={profile.bio}
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2 mt-2">
                                <button type="submit" className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-[#192a56] text-white hover:bg-blue-900'}`}>
                                    {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                                    {isSaved ? 'Details Saved!' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 2. SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Change Password</h2>
                        <div className="space-y-6 max-w-lg">
                            <InputGroup label="Current Password" type="password" placeholder="••••••••" icon={Key} />
                            <InputGroup label="New Password" type="password" placeholder="••••••••" icon={Lock} />
                            <InputGroup label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} />
                            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                                Update Password
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. TEAM TAB */}
                {activeTab === 'team' && (
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Admin Team</h2>
                            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">+ Invite New</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AdminCard name="Ryan Taylor" role="Manager" status="active" img="https://randomuser.me/api/portraits/men/32.jpg" />
                            <AdminCard name="Sarah Connor" role="Support" status="active" img="https://randomuser.me/api/portraits/women/44.jpg" />
                        </div>
                    </div>
                )}

             </div>
          </div>

        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TabButton = ({ icon: Icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${
            active 
            ? 'bg-[#192a56] text-white shadow-lg shadow-blue-900/20' 
            : 'text-slate-500 hover:bg-slate-50'
        }`}
    >
        <Icon size={18} className={active ? "text-[#00d0f1]" : "text-slate-400"} /> 
        {label}
    </button>
);

const InputGroup = ({ label, value, onChange, type="text", placeholder, icon: Icon }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <div className="relative">
            {Icon && <Icon size={18} className="absolute top-3 left-4 text-slate-400" />}
            <input 
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full border border-slate-300 rounded-xl py-2.5 focus:border-emerald-500 outline-none font-medium text-slate-700 ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
            />
        </div>
    </div>
);

const AdminCard = ({ name, role, status, img }) => (
    <div className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all flex items-center gap-4 bg-slate-50">
        <img src={img} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
        <div className="flex-1">
            <h4 className="font-bold text-slate-800">{name}</h4>
            <p className="text-xs text-slate-500 font-medium">{role}</p>
        </div>
        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700">
            {status}
        </span>
    </div>
);

export default Profile;