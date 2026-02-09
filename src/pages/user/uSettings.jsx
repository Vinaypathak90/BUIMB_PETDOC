import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, User, Lock, Moon, Sun, BellRing, 
  Shield, Key, Smartphone, Palette, Save, CheckCircle, LogOut, Camera
} from 'lucide-react';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, appearance, notifications
  const [showToast, setShowToast] = useState(false);

  // --- STATE FOR SETTINGS ---
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', bio: '', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  });

  const [theme, setTheme] = useState('light'); // light, dark
  const [colorTheme, setColorTheme] = useState('blue'); // blue, emerald, violet, orange
  
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, promo: false
  });

  // --- LOAD DATA ---
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    setProfile(prev => ({ ...prev, ...savedProfile }));
    
    // Load Theme Preferences
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setTheme(savedTheme);
  }, []);

  // --- HANDLERS ---
  const handleSave = () => {
    // Simulate Saving
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('appTheme', theme);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onloadend = () => setProfile({ ...profile, img: reader.result });
        reader.readAsDataURL(file);
    }
  };

  // --- COMPONENT: SIDEBAR TAB BUTTON ---
  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
        activeTab === id 
        ? 'bg-[#192a56] text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

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
                <h2 className="text-xl font-black text-slate-800">Account Settings</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 1. SETTINGS NAVIGATION (Left) */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-24">
                    <div className="space-y-1">
                        <TabButton id="profile" label="Profile Details" icon={User} />
                        <TabButton id="appearance" label="Appearance" icon={Palette} />
                        <TabButton id="security" label="Security & Login" icon={Shield} />
                        <TabButton id="notifications" label="Notifications" icon={BellRing} />
                    </div>
                </div>
            </div>

            {/* 2. SETTINGS CONTENT (Right) */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* --- TOAST NOTIFICATION --- */}
                {showToast && (
                    <div className="fixed top-24 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-50">
                        <CheckCircle size={20}/> <span>Settings saved successfully!</span>
                    </div>
                )}

                {/* --- TAB 1: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Personal Information</h3>
                        
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group">
                                <img src={profile.img} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100" />
                                <label className="absolute bottom-0 right-0 bg-[#192a56] text-white p-2 rounded-full cursor-pointer hover:bg-blue-900 transition-colors shadow-md">
                                    <Camera size={14} />
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Profile Photo</p>
                                <p className="text-xs text-slate-400 mt-1">Accepts JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio / Medical Condition</label>
                                <textarea rows="3" value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="Write a short bio or medical history summary..."></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: APPEARANCE (THEME) --- */}
                {activeTab === 'appearance' && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Customize Look & Feel</h3>
                        
                        {/* Theme Mode */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Interface Theme</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setTheme('light')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${theme === 'light' ? 'border-[#00d0f1] bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500"><Sun size={20}/></div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800 text-sm">Light Mode</p>
                                            <p className="text-xs text-slate-400">Default bright look</p>
                                        </div>
                                    </div>
                                    {theme === 'light' && <CheckCircle size={20} className="text-[#00d0f1]"/>}
                                </button>

                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${theme === 'dark' ? 'border-[#00d0f1] bg-slate-900 text-white' : 'border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-blue-400"><Moon size={20}/></div>
                                        <div className="text-left">
                                            <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Dark Mode</p>
                                            <p className="text-xs text-slate-400">Easy on the eyes</p>
                                        </div>
                                    </div>
                                    {theme === 'dark' && <CheckCircle size={20} className="text-[#00d0f1]"/>}
                                </button>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Primary Accent Color</label>
                            <div className="flex gap-4">
                                {['blue', 'emerald', 'violet', 'orange'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setColorTheme(color)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                                            color === 'blue' ? 'bg-[#00d0f1]' : 
                                            color === 'emerald' ? 'bg-emerald-500' : 
                                            color === 'violet' ? 'bg-violet-500' : 'bg-orange-500'
                                        }`}
                                    >
                                        {colorTheme === color && <CheckCircle size={20} className="text-white"/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: SECURITY --- */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Security & Password</h3>
                        
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute top-3.5 left-3 text-slate-400"/>
                                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New</label>
                                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><Smartphone size={18}/> Two-Factor Authentication</h4>
                                    <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 4: NOTIFICATIONS --- */}
                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Notification Preferences</h3>
                        
                        <div className="space-y-4">
                            {['Email Notifications', 'SMS Messages', 'Browser Push', 'Promotional Offers'].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                                    <span className="font-bold text-slate-700 text-sm">{item}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={idx !== 1} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d0f1]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SAVE BUTTON FOOTER */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        className="bg-[#192a56] hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Settings;