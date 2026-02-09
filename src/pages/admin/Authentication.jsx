import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Shield, Smartphone, Key, Globe, LogOut, Save, CheckCircle, 
  AlertTriangle, Lock, Users, ToggleLeft, ToggleRight 
} from 'lucide-react';

const Authentication = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // --- STATE WITH LOCAL STORAGE ---
  // Default Settings
  const defaultSettings = {
    twoFactor: true,
    socialLogin: false,
    emailVerification: true,
    minPasswordLength: 8,
    loginRetries: 3,
    sessionTimeout: 30 // minutes
  };

  // Load Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('authSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Dummy Active Sessions
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome (Windows)", ip: "192.168.1.45", location: "Bangalore, India", status: "Current", active: true },
    { id: 2, device: "Safari (iPhone 14)", ip: "103.45.22.12", location: "Mumbai, India", status: "Active 5m ago", active: true },
    { id: 3, device: "Firefox (MacBook)", ip: "45.12.33.99", location: "Delhi, India", status: "Active 1h ago", active: true },
  ]);

  // --- SAVE LOGIC ---
  useEffect(() => {
    localStorage.setItem('authSettings', JSON.stringify(settings));
  }, [settings]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // --- HANDLERS ---
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRevoke = (id) => {
    if(window.confirm("Are you sure you want to log out this device?")) {
      setSessions(sessions.filter(s => s.id !== id));
    }
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
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Authentication & Security</h1>
              <p className="text-slate-500 text-sm">Manage system access and security protocols.</p>
            </div>
            <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${isSaved ? 'bg-emerald-500 text-white' : 'bg-[#192a56] text-white hover:bg-blue-900'}`}
            >
              {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
              {isSaved ? 'Settings Saved' : 'Save Configuration'}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- COLUMN 1: SECURITY POLICIES --- */}
            <div className="xl:col-span-2 space-y-8">
                
                {/* 2FA & Login Options */}
                <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Shield className="text-emerald-500" size={20} /> Login Protocols
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Toggle Item */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full h-fit"><Smartphone size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Two-Factor Authentication (2FA)</h4>
                                    <p className="text-xs text-slate-500">Require OTP for all admin logins.</p>
                                </div>
                            </div>
                            <button onClick={() => toggleSetting('twoFactor')} className="text-2xl text-slate-300 hover:text-emerald-500 transition-colors">
                                {settings.twoFactor ? <ToggleRight size={40} className="text-emerald-500" /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-full h-fit"><Globe size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Social Login Integration</h4>
                                    <p className="text-xs text-slate-500">Allow login via Google & Facebook.</p>
                                </div>
                            </div>
                            <button onClick={() => toggleSetting('socialLogin')} className="text-2xl text-slate-300 hover:text-emerald-500 transition-colors">
                                {settings.socialLogin ? <ToggleRight size={40} className="text-emerald-500" /> : <ToggleLeft size={40} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-full h-fit"><Lock size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Force Email Verification</h4>
                                    <p className="text-xs text-slate-500">New users must verify email before access.</p>
                                </div>
                            </div>
                            <button onClick={() => toggleSetting('emailVerification')} className="text-2xl text-slate-300 hover:text-emerald-500 transition-colors">
                                {settings.emailVerification ? <ToggleRight size={40} className="text-emerald-500" /> : <ToggleLeft size={40} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Policy */}
                <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Key className="text-blue-500" size={20} /> Password Policy
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Password Length</label>
                            <input 
                                type="number" 
                                value={settings.minPasswordLength}
                                onChange={(e) => setSettings({...settings, minPasswordLength: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Login Retries</label>
                            <input 
                                type="number" 
                                value={settings.loginRetries}
                                onChange={(e) => setSettings({...settings, loginRetries: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Session Timeout (Mins)</label>
                            <input 
                                type="number" 
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold text-slate-700"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* --- COLUMN 2: ACTIVE SESSIONS --- */}
            <div className="xl:col-span-1">
                <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm h-full">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="text-amber-500" size={20} /> Active Sessions
                    </h3>
                    
                    <div className="space-y-4">
                        {sessions.length > 0 ? (
                            sessions.map((session) => (
                                <div key={session.id} className="p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-700 text-sm">{session.device}</h4>
                                        {session.status === 'Current' ? (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Current</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleRevoke(session.id)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" 
                                                title="Revoke Access"
                                            >
                                                <LogOut size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <p className="flex items-center gap-2"><Globe size={12}/> {session.ip}</p>
                                        <p>{session.location}</p>
                                        <p className="text-slate-400 italic mt-1">{session.status}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <AlertTriangle size={30} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No active sessions found.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                            <LogOut size={16} /> Sign Out All Devices
                        </button>
                    </div>
                </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Authentication;