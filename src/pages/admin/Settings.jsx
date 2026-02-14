import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Save, Globe, Bell, Lock, Moon, Sun, Monitor, Type, 
  Smartphone, Mail, Check, Layout, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- SETTINGS STATE ---
  const [siteInfo, setSiteInfo] = useState({
    name: '',
    email: '',
    phone: '',
    copyright: ''
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'normal');

  const [notifications, setNotifications] = useState({
    emailOrder: true,
    smsOrder: false,
    promoEmails: true
  });

  // --- 1. FETCH SETTINGS FROM BACKEND ---
  useEffect(() => {
    const fetchSettings = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      if (!storedData) { navigate('/login'); return; }

      try {
        const res = await fetch('http://localhost:5000/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setSiteInfo({
            name: data.siteName,
            email: data.supportEmail,
            phone: data.contactPhone,
            copyright: data.copyrightText
          });
          setTheme(data.theme);
          setFontSize(data.fontSize);
          setNotifications({
            emailOrder: data.emailOrder,
            smsOrder: data.smsOrder,
            promoEmails: data.promoEmails
          });
        }
      } catch (err) {
        console.error("Failed to load platform settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [navigate]);

  // --- 2. APPLY THEME & FONT TO DOM ---
  useEffect(() => {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode', 'blue-mode');
    body.classList.add(`${theme}-mode`);
    localStorage.setItem('theme', theme);

    const html = document.documentElement;
    html.classList.remove('font-small', 'font-normal', 'font-large');
    html.classList.add(`font-${fontSize}`);
    localStorage.setItem('fontSize', fontSize);
  }, [theme, fontSize]);

  // --- 3. SAVE SETTINGS HANDLER ---
  const handleSave = async () => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    const payload = {
      siteName: siteInfo.name,
      supportEmail: siteInfo.email,
      contactPhone: siteInfo.phone,
      copyrightText: siteInfo.copyright,
      theme,
      fontSize,
      ...notifications
    };

    try {
      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedData.token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        alert("Failed to update settings");
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#192a56]" size={40} />
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Config...</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 
        theme === 'blue' ? 'bg-[#1e293b] text-white' : 
        'bg-slate-50 text-slate-800'
    }`}>
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Platform Settings</h1>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              {isSaved ? <Check size={20} /> : <Save size={20} />}
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* NAVIGATION TABS */}
            <div className={`w-full xl:w-64 flex-shrink-0 p-4 rounded-2xl h-fit border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
                <nav className="space-y-1">
                    <TabButton icon={Globe} label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} theme={theme} />
                    <TabButton icon={Layout} label="Appearance" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} theme={theme} />
                    <TabButton icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} theme={theme} />
                    <TabButton icon={Lock} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} theme={theme} />
                </nav>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1">
                
                {/* 1. GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <SectionCard title="Website Information" description="Manage basic site details and SEO." theme={theme}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Website Name" value={siteInfo.name} onChange={(e) => setSiteInfo({...siteInfo, name: e.target.value})} theme={theme} />
                            <InputGroup label="Support Email" value={siteInfo.email} onChange={(e) => setSiteInfo({...siteInfo, email: e.target.value})} theme={theme} />
                            <InputGroup label="Contact Phone" value={siteInfo.phone} onChange={(e) => setSiteInfo({...siteInfo, phone: e.target.value})} theme={theme} />
                            <InputGroup label="Copyright Text" value={siteInfo.copyright} onChange={(e) => setSiteInfo({...siteInfo, copyright: e.target.value})} theme={theme} />
                        </div>
                    </SectionCard>
                )}

                {/* 2. APPEARANCE SETTINGS */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <SectionCard title="Interface Theme" description="Select the color scheme for the dashboard." theme={theme}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ThemeOption label="Light Mode" icon={Sun} selected={theme === 'light'} onClick={() => setTheme('light')} bgColor="bg-slate-100" textColor="text-slate-800" />
                                <ThemeOption label="Dark Mode" icon={Moon} selected={theme === 'dark'} onClick={() => setTheme('dark')} bgColor="bg-slate-900" textColor="text-slate-100" />
                                <ThemeOption label="Midnight Blue" icon={Monitor} selected={theme === 'blue'} onClick={() => setTheme('blue')} bgColor="bg-[#1e293b]" textColor="text-blue-100" />
                            </div>
                        </SectionCard>

                        <SectionCard title="Text Visibility (Font Size)" description="Adjust the text size for readability." theme={theme}>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <FontSizeOption label="Small" size="small" selected={fontSize === 'small'} onClick={() => setFontSize('small')} theme={theme} />
                                <FontSizeOption label="Normal" size="normal" selected={fontSize === 'normal'} onClick={() => setFontSize('normal')} theme={theme} />
                                <FontSizeOption label="Large" size="large" selected={fontSize === 'large'} onClick={() => setFontSize('large')} theme={theme} />
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-emerald-50/10 border border-emerald-500/20 text-emerald-500">
                                <p className={`transition-all duration-300 ${fontSize === 'large' ? 'text-lg' : fontSize === 'small' ? 'text-xs' : 'text-sm'}`}>
                                    Preview: The quick brown fox jumps over the lazy dog. 
                                </p>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* 3. NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                    <SectionCard title="Alerts & Notifications" description="Control system automated alerts." theme={theme}>
                        <div className="space-y-4">
                            <ToggleItem label="Email for new appointments" checked={notifications.emailOrder} onChange={() => setNotifications({...notifications, emailOrder: !notifications.emailOrder})} theme={theme} />
                            <ToggleItem label="SMS for confirmations" checked={notifications.smsOrder} onChange={() => setNotifications({...notifications, smsOrder: !notifications.smsOrder})} theme={theme} />
                            <ToggleItem label="Receive promotional newsletters" checked={notifications.promoEmails} onChange={() => setNotifications({...notifications, promoEmails: !notifications.promoEmails})} theme={theme} />
                        </div>
                    </SectionCard>
                )}

                {/* 4. SECURITY */}
                {activeTab === 'security' && (
                    <SectionCard title="Security Settings" description="Update password and security preferences." theme={theme}>
                        <div className="space-y-4 max-w-md">
                            <InputGroup label="Current Password" type="password" placeholder="••••••••" theme={theme} />
                            <InputGroup label="New Password" type="password" placeholder="••••••••" theme={theme} />
                            <button className="bg-[#192a56] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-900 transition-all">Update Password</button>
                        </div>
                    </SectionCard>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS (STATED BELOW FOR CLARITY) ---

const TabButton = ({ icon: Icon, label, active, onClick, theme }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-emerald-500 text-white shadow-md' : theme === 'light' ? 'text-slate-500 hover:bg-slate-50' : 'text-slate-400 hover:bg-slate-700'}`}>
        <Icon size={18} /> {label}
    </button>
);

const SectionCard = ({ title, description, children, theme }) => (
    <div className={`p-6 rounded-2xl border mb-6 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
        <div className="mb-6 pb-4 border-b border-slate-200/20">
            <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{title}</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
        </div>
        {children}
    </div>
);

const InputGroup = ({ label, value, onChange, type="text", placeholder, theme }) => (
    <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full border rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none font-medium transition-colors ${theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'}`} />
    </div>
);

const ThemeOption = ({ label, icon: Icon, selected, onClick, bgColor, textColor }) => (
    <button onClick={onClick} className={`relative p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent hover:border-slate-300'} ${bgColor}`}>
        <Icon className={`w-8 h-8 ${textColor}`} />
        <span className={`text-sm font-bold ${textColor}`}>{label}</span>
        {selected && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full"></div>}
    </button>
);

const FontSizeOption = ({ label, size, selected, onClick, theme }) => (
    <button onClick={onClick} className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${selected ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : theme === 'light' ? 'border-slate-200 hover:border-slate-300 text-slate-600' : 'border-slate-600 hover:border-slate-500 text-slate-300'}`}>
        <Type size={size === 'small' ? 14 : size === 'large' ? 24 : 18} />
        <span className="font-bold text-sm">{label}</span>
    </button>
);

const ToggleItem = ({ label, checked, onChange, theme }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50/5">
        <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{label}</span>
        <button onClick={onChange} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

export default Settings;