import React, { useState, useEffect, useRef } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Save, UploadCloud, User, MapPin, 
  Briefcase, GraduationCap, Award, Globe, Lock, Shield,
  Trash2, Plus, X, Stethoscope, Building, Share2, 
  Sparkles, CheckCircle, FileText, CreditCard, Camera, 
  Smartphone, AlertCircle, Eye, EyeOff, Layout
} from 'lucide-react';

const DoctorProfileSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. COMPLEX STATE MANAGEMENT ---

  // Basic Info
  const [profile, setProfile] = useState({
    firstName: "Edalin", lastName: "Hendry",
    email: "edalin@petdoc.com", phone: "+1 823-901-2345",
    gender: "Male", dob: "1985-04-12",
    category: "Human", // 'Human' or 'Pet'
    title: "Dr.",
    bio: "Experienced Surgeon with a demonstrated history of working in the medical practice industry. Skilled in Dentistry, Oral Surgery, and Medical Education.",
    img: "https://randomuser.me/api/portraits/men/85.jpg"
  });

  // Contact & Location
  const [address, setAddress] = useState({
    line1: "350 Willow Lane", line2: "Suite 402",
    city: "New York", state: "NY", country: "USA", zip: "10012"
  });

  // Pricing
  const [pricing, setPricing] = useState({
    type: "custom", // 'free' or 'custom'
    consultationFee: 500,
    videoFee: 350,
    followUpFee: 200
  });

  // Dynamic Lists (The LinkedIn Part)
  const [education, setEducation] = useState([
    { id: 1, degree: "BDS", college: "American Dental Medical University", year: "2003" },
    { id: 2, degree: "MDS", college: "American Dental Medical University", year: "2005" }
  ]);

  const [experience, setExperience] = useState([
    { id: 1, hospital: "Glowing Smiles Family Dental", from: "2010", to: "Present", designation: "Senior Surgeon" },
    { id: 2, hospital: "Comfort Care Dental Clinic", from: "2007", to: "2010", designation: "Junior Doctor" }
  ]);

  const [awards, setAwards] = useState([
    { id: 1, name: "Humanitarian Award", year: "2008", description: "For service in rural areas" }
  ]);

  const [registrations, setRegistrations] = useState([
    { id: 1, registration: "A-45312", council: "American Dental Council", year: "2006" }
  ]);

  const [memberships, setMemberships] = useState([
    { id: 1, name: "American Dental Association" }
  ]);

  const [clinics, setClinics] = useState([
    { id: 1, name: "Sofi's Clinic", address: "85 Green St, London", img: null }
  ]);

  // Tags & AI Suggestions
  const [services, setServices] = useState(["Tooth cleaning", "Implants", "Root Canal"]);
  const [specializations, setSpecializations] = useState(["Dentist", "Oral Surgery"]);
  const [tagInput, setTagInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Social & Security
  const [socials, setSocials] = useState({ website: "", facebook: "", twitter: "", linkedin: "" });
  const [security, setSecurity] = useState({ 
    currentPass: "", newPass: "", confirmPass: "", twoFactor: true,
    loginHistory: [
        { device: "Chrome - Windows", date: "Today at 10:45 AM", location: "New York, USA", active: true },
        { device: "Safari - iPhone 14", date: "Yesterday at 08:30 PM", location: "New York, USA", active: false }
    ]
  });

  // --- LOGIC & HANDLERS ---

  const handleSave = () => {
    setLoading(true);
    // Simulation of API delay
    setTimeout(() => {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, img: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Row Generic Handlers
  const addRow = (setter, template) => setter(prev => [...prev, { ...template, id: Date.now() }]);
  const removeRow = (setter, id) => setter(prev => prev.filter(item => item.id !== id));
  const handleRowChange = (setter, id, field, value) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // AI Smart Suggestion Engine
  useEffect(() => {
    if (!tagInput) { setAiSuggestions([]); return; }
    const lowerInput = tagInput.toLowerCase();
    let suggestions = [];
    
    // Logic switches based on Category (Pet vs Human)
    if(profile.category === 'Pet') {
        if (lowerInput.includes('dog') || lowerInput.includes('surg')) suggestions = ["Canine Surgery", "Pet Dermatology", "Vaccination"];
        else if (lowerInput.includes('groom')) suggestions = ["Pet Grooming", "Nail Trimming"];
    } else {
        if (lowerInput.includes('dent') || lowerInput.includes('tooth')) suggestions = ["Teeth Whitening", "Orthodontics", "Invisalign"];
        else if (lowerInput.includes('cardio')) suggestions = ["Cardiology", "ECG", "Heart Surgery"];
    }
    setAiSuggestions(suggestions);
  }, [tagInput, profile.category]);

  const addTag = (tag, listSetter, list) => {
    if (!list.includes(tag)) listSetter([...list, tag]);
    setTagInput("");
    setAiSuggestions([]);
  };

  // Profile Strength Calculator
  const calculateStrength = () => {
    let score = 0;
    if (profile.firstName && profile.lastName) score += 10;
    if (profile.bio.length > 20) score += 10;
    if (address.city) score += 10;
    if (education.length > 0) score += 15;
    if (experience.length > 0) score += 15;
    if (registrations.length > 0) score += 10;
    if (services.length > 0) score += 10;
    if (socials.linkedin) score += 10;
    if (pricing.consultationFee) score += 10;
    return Math.min(score, 100);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative font-sans">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right z-[100]">
            <div className="p-2 bg-white/20 rounded-full"><CheckCircle size={24} className="text-white"/></div>
            <div>
                <h4 className="font-bold text-sm">Profile Updated Successfully!</h4>
                <p className="text-xs text-emerald-100 mt-0.5">Your changes are now live on your public profile.</p>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="bg-white sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">Profile Settings</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-slate-400 font-bold uppercase">Last Saved</span>
                    <span className="text-xs font-bold text-slate-700">Today, 10:45 AM</span>
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          
          {/* 1. Profile Strength Bar */}
          <div className="bg-gradient-to-r from-[#192a56] to-blue-900 p-8 rounded-[2rem] shadow-xl text-white mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-end relative z-10 gap-4">
                  <div>
                      <h3 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-yellow-400 fill-yellow-400"/> Profile Strength: {calculateStrength()}%</h3>
                      <p className="text-blue-200 text-sm mt-2 max-w-lg">
                          Your profile is <strong>{calculateStrength() < 50 ? 'Weak' : calculateStrength() < 80 ? 'Good' : 'Excellent'}</strong>. 
                          Complete profiles rank 70% higher in search results and build more trust with patients.
                      </p>
                  </div>
                  <div className="w-full md:w-64">
                      <div className="flex justify-between text-xs font-bold mb-1 opacity-80">
                          <span>Progress</span>
                          <span>{calculateStrength()}/100</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${calculateStrength() === 100 ? 'bg-emerald-400' : 'bg-[#00d0f1]'}`} 
                            style={{ width: `${calculateStrength()}%` }}
                          ></div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* --- LEFT NAVIGATION --- */}
            <div className="xl:col-span-1 space-y-2 sticky top-24 h-fit">
                {[
                    { id: 'general', label: 'Basic Information', icon: User },
                    { id: 'professional', label: 'Professional Details', icon: Stethoscope },
                    { id: 'clinic', label: 'Clinic & Pricing', icon: Building },
                    { id: 'history', label: 'Education & Awards', icon: GraduationCap },
                    { id: 'security', label: 'Security & Login', icon: Shield },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all border-l-4 ${
                            activeTab === tab.id 
                            ? 'bg-white border-[#192a56] text-[#192a56] shadow-md' 
                            : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'text-[#00d0f1]' : ''}/> {tab.label}
                    </button>
                ))}
            </div>

            {/* --- RIGHT CONTENT AREA --- */}
            <div className="xl:col-span-3 space-y-6">
                
                {/* -------------------- GENERAL TAB -------------------- */}
                {activeTab === 'general' && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User size={20} className="text-[#00d0f1]"/> Personal Information
                        </h3>
                        
                        {/* Photo Upload */}
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <div className="relative group">
                                <img src={profile.img} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={24} className="text-white"/>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*"/>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="font-bold text-slate-700">Profile Picture</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3">PNG, JPG or GIF. Max size 2MB.</p>
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <label className="bg-[#192a56] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-900 transition-colors">
                                        Upload New
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*"/>
                                    </label>
                                    <button onClick={() => setProfile({...profile, img: null})} className="bg-white border border-slate-200 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50">Delete</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Username / Title</label>
                                <div className="flex gap-2">
                                    <select className="p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none w-24">
                                        <option>Dr.</option>
                                        <option>Mr.</option>
                                        <option>Ms.</option>
                                    </select>
                                    <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="flex-1 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Last Name</label>
                                <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone Number</label>
                                <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label>
                                <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Gender</label>
                                <select className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1] bg-white">
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Specialist Category (AI Trigger)</label>
                                <select 
                                    value={profile.category} 
                                    onChange={(e) => setProfile({...profile, category: e.target.value})} 
                                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1] bg-white"
                                >
                                    <option value="Human">Human Specialist</option>
                                    <option value="Pet">Veterinarian (Pet Specialist)</option>
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <h4 className="font-bold text-slate-800 mb-4 mt-8">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Address Line 1</label>
                                <input type="text" value={address.line1} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label>
                                <input type="text" value={address.city} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">State / Province</label>
                                <input type="text" value={address.state} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Country</label>
                                <input type="text" value={address.country} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Postal Code</label>
                                <input type="text" value={address.zip} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Professional Biography</label>
                            <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-medium text-slate-600 outline-none focus:border-[#00d0f1] h-32 resize-none"></textarea>
                        </div>
                    </div>
                )}

                {/* -------------------- PROFESSIONAL TAB -------------------- */}
                {activeTab === 'professional' && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Sparkles size={20} className="text-purple-500"/> Specialization & Services
                        </h3>
                        
                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Services Offered</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {services.map((s, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-in zoom-in">
                                        {s} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => { setServices(services.filter(t => t !== s)) }}/>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder={profile.category === 'Pet' ? "Type e.g. 'Dog Surgery'..." : "Type e.g. 'Dental'..."}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput, setServices, services)}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#00d0f1]"
                                />
                                {aiSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-2 z-10 p-2">
                                        <p className="text-[10px] font-bold text-purple-500 px-2 mb-1 flex items-center gap-1"><Sparkles size={10}/> AI Suggestions</p>
                                        {aiSuggestions.map((sug, i) => (
                                            <div key={i} onClick={() => addTag(sug, setServices, services)} className="px-3 py-2 hover:bg-slate-50 cursor-pointer rounded-lg text-sm font-medium text-slate-700">
                                                + {sug}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Specializations</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {specializations.map((s, i) => (
                                    <span key={i} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                        {s} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => { setSpecializations(specializations.filter(t => t !== s)) }}/>
                                    </span>
                                ))}
                            </div>
                            <input type="text" placeholder="Press enter to add..." className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#00d0f1]" onKeyDown={(e) => e.key === 'Enter' && addTag(e.target.value, setSpecializations, specializations)}/>
                        </div>
                    </div>
                )}

                {/* -------------------- CLINIC & PRICING TAB -------------------- */}
                {activeTab === 'clinic' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard className="text-[#00d0f1]"/> Pricing & Fees</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 border border-slate-200 rounded-2xl hover:border-[#00d0f1] transition-all">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Consultation Fee</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-400">$</span>
                                        <input type="number" value={pricing.consultationFee} onChange={(e) => setPricing({...pricing, consultationFee: e.target.value})} className="w-full font-black text-xl text-slate-800 outline-none"/>
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-200 rounded-2xl hover:border-[#00d0f1] transition-all">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Video Consult</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-400">$</span>
                                        <input type="number" value={pricing.videoFee} onChange={(e) => setPricing({...pricing, videoFee: e.target.value})} className="w-full font-black text-xl text-slate-800 outline-none"/>
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-200 rounded-2xl hover:border-[#00d0f1] transition-all">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Follow-up</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-400">$</span>
                                        <input type="number" value={pricing.followUpFee} onChange={(e) => setPricing({...pricing, followUpFee: e.target.value})} className="w-full font-black text-xl text-slate-800 outline-none"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Building className="text-[#00d0f1]"/> Clinic Info</h3>
                                <button className="text-sm font-bold text-[#00d0f1]">+ Add Clinic</button>
                            </div>
                            
                            {clinics.map((clinic, index) => (
                                <div key={clinic.id} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Clinic Name</label>
                                            <input type="text" value={clinic.name} className="w-full p-2 bg-transparent border-b border-slate-300 font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Address</label>
                                            <input type="text" value={clinic.address} className="w-full p-2 bg-transparent border-b border-slate-300 font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
                                            <UploadCloud size={20} className="text-slate-500"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* -------------------- HISTORY TAB (Education etc) -------------------- */}
                {activeTab === 'history' && (
                    <div className="space-y-6 animate-in fade-in">
                        
                        {/* EDUCATION */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><GraduationCap className="text-[#00d0f1]"/> Education</h3>
                            {education.map((edu) => (
                                <div key={edu.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-50">
                                    <div><label className="text-[10px] uppercase font-bold text-slate-400">Degree</label><input type="text" value={edu.degree} onChange={(e) => handleRowChange(setEducation, edu.id, 'degree', e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" /></div>
                                    <div><label className="text-[10px] uppercase font-bold text-slate-400">College</label><input type="text" value={edu.college} onChange={(e) => handleRowChange(setEducation, edu.id, 'college', e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" /></div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400">Year</label><input type="text" value={edu.year} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" /></div>
                                        <button onClick={() => removeRow(setEducation, edu.id)} className="p-3 bg-red-50 text-red-500 rounded-xl mb-[2px]"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addRow(setEducation, { degree: "", college: "", year: "" })} className="text-[#00d0f1] font-bold text-sm hover:underline">+ Add Education</button>
                        </div>

                        {/* EXPERIENCE */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Briefcase className="text-[#00d0f1]"/> Work Experience</h3>
                            {experience.map((exp) => (
                                <div key={exp.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4 pb-4 border-b border-slate-50">
                                    <div className="md:col-span-3"><input type="text" value={exp.hospital} placeholder="Hospital" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" /></div>
                                    <div className="md:col-span-2"><input type="text" value={exp.designation} placeholder="Designation" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" /></div>
                                    <div className="md:col-span-1"><input type="text" value={exp.from} placeholder="From" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" /></div>
                                    <div className="md:col-span-1 flex gap-2 items-end">
                                        <input type="text" value={exp.to} placeholder="To" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" />
                                        <button onClick={() => removeRow(setExperience, exp.id)} className="p-3 bg-red-50 text-red-500 rounded-xl mb-[2px]"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addRow(setExperience, { hospital: "", designation: "", from: "", to: "" })} className="text-[#00d0f1] font-bold text-sm hover:underline">+ Add Experience</button>
                        </div>

                        {/* REGISTRATIONS & AWARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} className="text-[#00d0f1]"/> Registrations</h3>
                                {registrations.map((reg) => (
                                    <div key={reg.id} className="flex gap-2 mb-3">
                                        <input type="text" value={reg.registration} placeholder="Reg No." className="w-1/3 p-2 border border-slate-200 rounded-lg text-sm font-bold outline-none" />
                                        <input type="text" value={reg.council} placeholder="Council" className="flex-1 p-2 border border-slate-200 rounded-lg text-sm outline-none" />
                                        <button onClick={() => removeRow(setRegistrations, reg.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button onClick={() => addRow(setRegistrations, { registration: "", council: "" })} className="text-xs font-bold text-[#00d0f1]">+ Add Registration</button>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award size={18} className="text-[#00d0f1]"/> Awards</h3>
                                {awards.map((award) => (
                                    <div key={award.id} className="flex gap-2 mb-3">
                                        <input type="text" value={award.name} placeholder="Award Name" className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-bold outline-none" />
                                        <input type="text" value={award.year} placeholder="Year" className="w-20 p-2 border border-slate-200 rounded-lg text-sm outline-none" />
                                        <button onClick={() => removeRow(setAwards, award.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button onClick={() => addRow(setAwards, { name: "", year: "" })} className="text-xs font-bold text-[#00d0f1]">+ Add Award</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* -------------------- SECURITY TAB -------------------- */}
                {activeTab === 'security' && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Shield className="text-[#00d0f1]"/> Security & Login</h3>
                        
                        {/* Change Password */}
                        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-4">Change Password</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">New Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Confirm Password</label>
                                    <input type="password" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Login History */}
                        <h4 className="font-bold text-slate-700 mb-4">Active Sessions</h4>
                        <div className="space-y-3">
                            {security.loginHistory.map((login, index) => (
                                <div key={index} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-full">
                                            {login.device.includes('iPhone') ? <Smartphone size={20} className="text-slate-500"/> : <Layout size={20} className="text-slate-500"/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{login.device}</p>
                                            <p className="text-xs text-slate-500">{login.location} • {login.date}</p>
                                        </div>
                                    </div>
                                    {login.active ? (
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active Now</span>
                                    ) : (
                                        <button className="text-xs font-bold text-red-500 hover:underline">Log Out</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Save Button (Fixed at bottom right) */}
                <div className="flex justify-end pt-6 pb-12">
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className={`bg-[#192a56] text-white px-10 py-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl transition-all transform hover:scale-105 active:scale-95 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorProfileSettings;