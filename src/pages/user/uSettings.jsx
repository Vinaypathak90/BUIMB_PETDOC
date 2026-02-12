import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, User, Lock, Moon, Sun, BellRing, 
  Shield, Key, Smartphone, Palette, Save, CheckCircle, Camera, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- STATES ---
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', bio: '', img: ''
  });
  const [theme, setTheme] = useState('light');
  const [colorTheme, setColorTheme] = useState('blue');
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, promo: false
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchSettings = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      if (!storedData) { navigate('/login'); return; }

      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setProfile({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            bio: data.bio || '',
            img: data.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          });
          setTheme(data.themePreference || 'light');
          setColorTheme(data.accentColor || 'blue');
          setNotifications(data.notificationPreferences || notifications);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [navigate]);

  // --- 2. HANDLE SAVE (PROFILE & PREFERENCES) ---
  const handleSave = async () => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedData.token}` 
        },
        body: JSON.stringify({
          ...profile,
          avatar: profile.img,
          themePreference: theme,
          accentColor: colorTheme,
          notificationPreferences: notifications
        })
      });

      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      alert("Failed to save changes");
    }
  };

  // --- 3. HANDLE PASSWORD CHANGE ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
      const res = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedData.token}` 
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Security update failed");
    }
  };

  // Handle Profile Image Upload (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, img: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
        activeTab === id ? 'bg-[#192a56] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-900" size={40} />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-slate-800">Account Settings</h2>
            </div>
            <Bell className="text-slate-500" size={20} />
        </header>
        
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border p-4 shadow-sm sticky top-24">
                    <div className="space-y-1">
                        <TabButton id="profile" label="Profile Details" icon={User} />
                        <TabButton id="appearance" label="Appearance" icon={Palette} />
                        <TabButton id="security" label="Security & Login" icon={Shield} />
                        <TabButton id="notifications" label="Notifications" icon={BellRing} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
                {showToast && (
                    <div className="fixed top-24 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-50">
                        <CheckCircle size={20}/> <span>Settings saved successfully!</span>
                    </div>
                )}

                {/* --- TAB 1: PROFILE --- */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Personal Information</h3>
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
                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <input type="email" value={profile.email} disabled className="w-full border bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio / Medical History Summary</label>
                                <textarea rows="3" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="Write a short bio..."></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: APPEARANCE --- */}
                {activeTab === 'appearance' && (
                    <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Look & Feel</h3>
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Interface Theme</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${theme === 'light' ? 'border-[#00d0f1] bg-blue-50' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-3"><Sun size={20} className="text-amber-500"/><span className="font-bold text-sm">Light Mode</span></div>
                                    {theme === 'light' && <CheckCircle size={20} className="text-[#00d0f1]"/>}
                                </button>
                                <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${theme === 'dark' ? 'border-[#00d0f1] bg-slate-900 text-white' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-3"><Moon size={20} className="text-blue-400"/><span className="font-bold text-sm">Dark Mode</span></div>
                                    {theme === 'dark' && <CheckCircle size={20} className="text-[#00d0f1]"/>}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Primary Accent</label>
                            <div className="flex gap-4">
                                {['blue', 'emerald', 'violet', 'orange'].map(color => (
                                    <button key={color} onClick={() => setColorTheme(color)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 bg-${color === 'blue' ? '[#00d0f1]' : color === 'emerald' ? 'emerald-500' : color === 'violet' ? 'violet-500' : 'orange-500'}`}>
                                        {colorTheme === color && <CheckCircle size={20} className="text-white"/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: SECURITY --- */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate} className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Security & Password</h3>
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                                <div className="relative"><Lock size={18} className="absolute top-3.5 left-3 text-slate-400"/><input type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label><input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New</label><input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" /></div>
                            </div>
                            <button type="submit" className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all">Update Password</button>
                        </div>
                    </form>
                )}

                {/* --- TAB 4: NOTIFICATIONS --- */}
                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-[2rem] border p-8 shadow-sm animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Preferences</h3>
                        <div className="space-y-4">
                            {Object.keys(notifications).map((key) => (
                                <div key={key} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                                    <span className="font-bold text-slate-700 text-sm capitalize">{key} Notifications</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications[key]} onChange={() => setNotifications({...notifications, [key]: !notifications[key]})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#00d0f1] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab !== 'security' && (
                  <div className="flex justify-end pt-4">
                      <button onClick={handleSave} className="bg-[#192a56] hover:bg-blue-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"><Save size={18} /> Save All Changes</button>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;