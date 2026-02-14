import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  User, Lock, Camera, Mail, Phone, MapPin, Calendar, 
  Save, CheckCircle, Activity, Image as ImageIcon, Loader2, Users, Key, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState({}); // Current Admin Profile
  const [team, setTeam] = useState([]);       // List of All Admins
  const [isSaved, setIsSaved] = useState(false);

  // Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // --- 1. FETCH INITIAL DATA (Profile & Team) ---
  const fetchAllData = async () => {
    setIsLoading(true);
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    // Redirect if no token
    if (!storedData || !storedData.token) { 
        navigate('/login'); 
        return; 
    }

    const token = storedData.token;

    try {
      // Parallel Fetching for Speed
      const [profileRes, teamRes] = await Promise.all([
        fetch('http://localhost:5000/api/user/admin-profile', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch('http://localhost:5000/api/user/admins', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
      ]);

      if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
      }
      
      if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
      }

    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [navigate]);

  // --- 2. HANDLER: UPDATE PROFILE ---
  const handleProfileSave = async (e) => {
    e.preventDefault();
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    try {
      const res = await fetch('http://localhost:5000/api/user/admin-profile', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${storedData.token}` 
        },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        alert("Failed to save profile.");
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  // --- 3. HANDLER: UPDATE PASSWORD ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    // Validation
    if (passwords.new !== passwords.confirm) {
        setPassMessage({ type: 'error', text: "New passwords do not match!" });
        return;
    }
    if (passwords.new.length < 6) {
        setPassMessage({ type: 'error', text: "Password must be at least 6 characters." });
        return;
    }

    const storedData = JSON.parse(localStorage.getItem('user_token'));

    try {
        const res = await fetch('http://localhost:5000/api/user/update-password', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${storedData.token}` 
            },
            body: JSON.stringify({ 
                currentPassword: passwords.current, 
                newPassword: passwords.new 
            })
        });

        const data = await res.json();

        if (res.ok) {
            setPassMessage({ type: 'success', text: "Password changed successfully!" });
            setPasswords({ current: '', new: '', confirm: '' });
        } else {
            setPassMessage({ type: 'error', text: data.message });
        }
    } catch (err) {
        setPassMessage({ type: 'error', text: "Server Connection Error" });
    }
  };

  // --- IMAGE HELPER (Base64) ---
  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, [field]: reader.result });
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#192a56]" size={40} />
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Admin Data...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      
      {/* Sidebar & Header */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          
          {/* 🚨 Profile Completion Alert */}
          {!profile.isProfileComplete && (
            <div className="bg-blue-600 text-white p-5 rounded-2xl mb-8 flex justify-between items-center shadow-xl shadow-blue-100 border-b-4 border-blue-800">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md"><Activity size={24}/></div>
                    <div>
                        <h4 className="font-black text-lg">Action Required</h4>
                        <p className="text-blue-100 text-sm font-medium">Please complete your profile (Phone & Address) to access all features.</p>
                    </div>
                </div>
                <div className="hidden md:block px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-widest">Pending Setup</div>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden mb-8 border border-slate-200">
             <div className="h-64 w-full relative">
                <img src={profile.cover || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000"} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <label className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl text-white px-5 py-2.5 rounded-xl cursor-pointer hover:bg-black/60 transition-all flex items-center gap-2 border border-white/20 shadow-2xl">
                    <ImageIcon size={18} /><span className="text-xs font-bold uppercase tracking-widest">Update Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
                </label>
             </div>

             <div className="px-10 pb-8 flex flex-col md:flex-row gap-8 items-end -mt-20 relative">
                <div className="relative group">
                    <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 relative z-10">
                        <img src={profile.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl cursor-pointer shadow-2xl hover:bg-emerald-600 transition-all z-20 border-4 border-white hover:scale-110 active:scale-95">
                        <Camera size={20}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'img')} />
                    </label>
                </div>
                <div className="flex-1 pb-4 text-center md:text-left">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider border border-slate-200">{profile.role || 'Admin'}</span>
                        <span className="text-emerald-500 flex items-center gap-1 font-bold text-xs uppercase tracking-widest"><CheckCircle size={14}/> Verified Account</span>
                    </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Left Tabs */}
            <div className="w-full xl:w-72 flex-shrink-0">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <TabButton icon={User} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton icon={Lock} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    <TabButton icon={Users} label="Admin Team" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                </div>
            </div>

            {/* Right Content */}
            <div className="flex-1">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">Personal Credentials</h2>
                        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputGroup label="Display Name" value={profile.name || ''} onChange={(e) => setProfile({...profile, name: e.target.value})} icon={User} />
                            <InputGroup label="Official Email" value={profile.email || ''} disabled icon={Mail} />
                            <InputGroup label="Phone Number" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} icon={Phone} placeholder="+91 XXXX XXXX" />
                            <InputGroup label="Date of Birth" type="date" value={profile.dob || ''} onChange={(e) => setProfile({...profile, dob: e.target.value})} icon={Calendar} />
                            <div className="md:col-span-2">
                                <InputGroup label="Residential Address" value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})} icon={MapPin} placeholder="Suite, Street, City" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Bio / Responsibility</label>
                                <textarea 
                                    className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 focus:border-[#192a56] focus:bg-white outline-none font-bold text-slate-700 min-h-[120px] transition-all" 
                                    value={profile.bio || ''} 
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                                />
                            </div>
                            <button type="submit" className={`md:col-span-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-[#192a56] text-white hover:bg-blue-900 shadow-blue-100'}`}>
                                {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
                                {isSaved ? 'Data Synchronized' : 'Save Profile Data'}
                            </button>
                        </form>
                    </div>
                )}

                {/* 2. SECURITY TAB (Password Change) */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-8">Change Password</h2>
                        
                        {passMessage.text && (
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 font-bold text-sm ${passMessage.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {passMessage.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                                {passMessage.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                            <InputGroup label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} icon={Key} />
                            <InputGroup label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} icon={Lock} />
                            <InputGroup label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} icon={Lock} />
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg w-full flex justify-center">Update Password</button>
                        </form>
                    </div>
                )}

                {/* 3. TEAM TAB (Fetch Admins) */}
                {activeTab === 'team' && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-800">Admin Team ({team.length})</h2>
                            <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">+ Add New</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {team.length > 0 ? (
                                team.map((admin) => (
                                    <div key={admin._id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all flex items-center gap-4 bg-slate-50/50">
                                        <img src={admin.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={admin.name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-lg">{admin.name} {admin._id === profile._id && "(You)"}</h4>
                                            <p className="text-xs text-slate-500 font-medium mb-2">{admin.email}</p>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${admin.isProfileComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {admin.isProfileComplete ? 'Active' : 'Pending Setup'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400">No other admins found.</p>
                            )}
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

// --- REUSABLE COMPONENTS ---

const TabButton = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${active ? 'bg-[#192a56] text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>
        <Icon size={18} className={active ? "text-[#00d0f1]" : "text-slate-300"} /> {label}
    </button>
);

const InputGroup = ({ label, value, onChange, disabled, icon: Icon, type="text", placeholder }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label}</label>
        <div className="relative group">
            {Icon && <Icon size={18} className="absolute top-3.5 left-5 text-slate-300 group-focus-within:text-[#192a56] transition-colors" />}
            <input type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full border-2 border-slate-100 bg-slate-50/50 rounded-2xl py-3.5 pl-14 pr-5 outline-none font-bold text-slate-700 transition-all focus:border-[#192a56] focus:bg-white disabled:bg-slate-100 disabled:text-slate-400`} />
        </div>
    </div>
);

export default Profile;