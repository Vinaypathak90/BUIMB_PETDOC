import React, { useState, useEffect, useRef } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, Bell, User, MapPin, Mail, Phone, Calendar, 
  Edit3, Activity, Heart, Clock, Save, Globe, Flag, Droplet, ChevronDown,
  CalendarPlus, Thermometer, Weight, ArrowRight, FileText,Loader2
} from 'lucide-react';

const UserDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- COUNTRY LIST FOR SEARCH ---
  const countriesList = [
    "India", "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Japan", "China", "Brazil", "Russia", 
    "South Africa", "UAE", "Singapore", "Italy", "Spain"
  ];

  // --- FORM STATE ---
  const initialForm = {
    name: '', dob: '', gender: 'Male', bloodGroup: '', 
    email: '', phone: '', address: '', city: '', state: '', 
    country: '', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  const [formData, setFormData] = useState(initialForm);
  const [userProfile, setUserProfile] = useState(null);
  const [appointments, setAppointments] = useState([]); 
  const [recentReports, setRecentReports] = useState([]); 
  const [healthVitals, setHealthVitals] = useState(null); // Dynamic Vitals
  
  // --- DROPDOWN STATE ---
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countriesList);
  const countryRef = useRef(null);

  // --- 1. LOAD DATA FROM BACKEND ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      
      if (!storedData || !storedData.token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/user/dashboard', {
          headers: {
            'Authorization': `Bearer ${storedData.token}`
          }
        });

        if (response.status === 401) {
            navigate('/login'); 
            return;
        }

        const data = await response.json();

        // 1. Profile Logic
        if (data.profile) {
          setUserProfile(data.profile);
          setFormData(data.profile); // Populate edit form
        } else {
          // No profile? Open modal and prepopulate basic Auth data
          setFormData(prev => ({ 
             ...prev, 
             name: storedData.name || '', 
             email: storedData.email || '' 
          }));
          setIsModalOpen(true);
        }

        // 2. Set other data
        setAppointments(data.appointments || []);
        setRecentReports(data.reports || []);
        setHealthVitals(data.vitals || null);

      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Click outside handler
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  // --- HANDLERS ---
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, country: val });
    setFilteredCountries(countriesList.filter(c => c.toLowerCase().includes(val.toLowerCase())));
    setShowCountryDropdown(true);
  };

  const selectCountry = (country) => {
    setFormData({ ...formData, country: country });
    setShowCountryDropdown(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, img: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- 2. SAVE PROFILE TO BACKEND ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const storedData = JSON.parse(localStorage.getItem('user_token'));

    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedData.token}`
            },
            body: JSON.stringify(formData)
        });

        const updatedProfile = await response.json();

        if (response.ok) {
            setUserProfile(updatedProfile);
            setIsModalOpen(false);
        } else {
            alert("Failed to save profile.");
        }
    } catch (error) {
        console.error("Error saving profile:", error);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
  };

  // Helper to structure vitals from backend data
  const getVitalsDisplay = () => [
    { label: "Heart Rate", value: healthVitals?.heartRate || "N/A", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
    { label: "Body Temp", value: healthVitals?.temp || "N/A", icon: Thermometer, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Glucose", value: healthVitals?.glucose || "N/A", icon: Activity, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Blood Pressure", value: healthVitals?.bp || "N/A", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "BMI", value: healthVitals?.bmi || "N/A", icon: Weight, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "SpO2", value: healthVitals?.spo2 || "N/A", icon: Droplet, color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

 if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <Loader2 size={40} className="text-[#00d0f1] animate-spin mb-4" />
                  <h3 className="text-lg font-black text-slate-800">Loading Appointments...</h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">Fetching your medical history securely</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            
            <div className="flex items-center gap-4 ml-auto">
                <button onClick={() => navigate('/user/book-appointment')} className="hidden sm:flex items-center gap-2 bg-[#00d0f1] text-[#192a56] px-5 py-2.5 rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-md">
                    <CalendarPlus size={18} /> Book Appointment
                </button>

                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                {userProfile && (
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700">{userProfile.name}</p>
                            <p className="text-xs text-slate-500">Member</p>
                        </div>
                        <img src={userProfile.img} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" />
                    </div>
                )}
            </div>
        </header>
        
        <main className="p-8 max-w-7xl mx-auto">
          
          {/* Main Dashboard Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-2 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {userProfile ? `Welcome back, ${userProfile.name}! 👋` : 'Welcome back!'}
                        </h1>
                        <p className="text-slate-500 text-sm">Here's your health overview.</p>
                    </div>
                    <button onClick={() => navigate('/user/book-appointment')} className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#00d0f1] text-[#192a56] px-5 py-3 rounded-xl font-bold">
                        <CalendarPlus size={18} /> Book Appointment
                    </button>
                </div>
                
                {/* 1. Profile Summary Card */}
                {userProfile && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <img src={userProfile.img} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                            <div>
                                <h1 className="text-2xl font-black text-slate-800">{userProfile.name}</h1>
                                <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><User size={14}/> {userProfile.gender}, {calculateAge(userProfile.dob)} Yrs</span>
                                    <span className="flex items-center gap-1"><MapPin size={14}/> {userProfile.city}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => {setFormData(userProfile); setIsModalOpen(true);}} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-bold border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <Edit3 size={16} /> Edit Profile
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* 2. Stats & Upcoming Appointments */}
                    <div className="xl:col-span-2 space-y-8">
                        
                        {/* Dynamic Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {getVitalsDisplay().map((v, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${v.bg} ${v.color}`}><v.icon size={20}/></div>
                                    <div><p className="text-lg font-black text-slate-800">{v.value}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{v.label}</p></div>
                                </div>
                            ))}
                        </div>

                        {/* Appointments List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">My Appointments</h3>
                                {appointments.length > 0 && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{appointments.length} Upcoming</span>}
                            </div>

                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
                                        <div key={apt._id} className="flex flex-col md:flex-row items-center gap-4 p-5 border border-slate-100 rounded-2xl hover:border-[#00d0f1] transition-all bg-slate-50/50">
                                            <img
                                                src={apt.doctorImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctorName)}&background=random`}
                                                alt={apt.doctorName}
                                                className="w-16 h-16 rounded-xl object-cover shadow-sm"
                                            />
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="font-bold text-slate-800 text-lg">{apt.doctorName}</h4>
                                                <p className="text-sm text-slate-500 font-medium mb-1">{apt.speciality}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase">{apt.status}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-center md:items-end gap-1">
                                                <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                                                    <Calendar size={14}/> {apt.date}
                                                </span>
                                                <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-[#00d0f1] flex items-center gap-2">
                                                    <Clock size={14}/> {apt.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar size={40} className="mx-auto text-slate-300 mb-2"/>
                                    <p className="text-slate-400 font-medium">No upcoming appointments.</p>
                                    <button onClick={() => navigate('/user/book-appointment')} className="text-[#00d0f1] font-bold underline mt-2">Book Your First Appointment</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Right Sidebar */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        {/* Health Score */}
                        <div className="bg-gradient-to-br from-[#192a56] to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center items-center text-center shadow-xl min-h-[200px]">
                            <Activity size={80} className="mb-6 opacity-20 absolute top-4 left-4" />
                            <h3 className="text-2xl font-black mb-2 relative z-10">Health Score</h3>
                            <div className="text-6xl font-black text-[#00d0f1] mb-2 relative z-10">92%</div>
                            <p className="text-blue-200 text-sm relative z-10">Based on your recent vitals.</p>
                        </div>

                        {/* Recent Reports */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Activity className="text-emerald-500" size={20}/> Recent Diagnosis
                                </h3>
                                <Link to="/user/ai-analysis" className="text-xs font-bold text-blue-600 hover:underline">New Analysis</Link>
                            </div>

                            <div className="space-y-4">
                                {recentReports.length > 0 ? (
                                    recentReports.slice(0, 3).map((report) => (
                                        <div key={report._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{report.disease}</h4>
                                                    <p className="text-[10px] text-slate-500">{report.date}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    report.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {report.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{report.findings}</p>
                                            <Link to="/user/book-appointment" className="text-[10px] font-bold text-[#192a56] flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Book {report.doctorType} <ArrowRight size={12}/>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400"><FileText size={20}/></div>
                                        <p className="text-sm font-bold text-slate-400">No reports yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>

      {/* --- MODAL (EDIT PROFILE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#192a56]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between sticky top-0 z-10">
                 <div><h2 className="text-2xl font-black text-slate-800">Setup Your Profile</h2><p className="text-slate-500 text-sm">Please provide accurate details.</p></div>
                 <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">1/1</div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                 <form onSubmit={handleSaveProfile} className="space-y-8">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer w-28 h-28">
                            <img src={formData.img} alt="Upload" className="w-full h-full rounded-full object-cover border-4 border-slate-100 shadow-md group-hover:border-blue-100 transition-all" />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">Change</div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">Upload Profile Picture</p>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                <div className="relative"><User size={18} className="absolute top-3 left-3 text-slate-400"/><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                                <div className="relative"><Calendar size={18} className="absolute top-3 left-3 text-slate-400"/><input type="date" name="dob" required value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700 text-sm" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700 bg-white"><option>Male</option><option>Female</option><option>Other</option></select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                                <div className="relative"><Droplet size={18} className="absolute top-3 left-3 text-red-400"/><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700 bg-white"><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <div className="relative"><Mail size={18} className="absolute top-3 left-3 text-slate-400"/><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <div className="relative"><Phone size={18} className="absolute top-3 left-3 text-slate-400"/><input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="relative" ref={countryRef}>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                                <div className="relative">
                                    <Globe size={18} className="absolute top-3 left-3 text-slate-400"/>
                                    <input type="text" name="country" value={formData.country} onChange={handleCountryChange} onFocus={() => setShowCountryDropdown(true)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" autoComplete="off" />
                                    <ChevronDown size={16} className="absolute top-3 right-3 text-slate-400 pointer-events-none" />
                                </div>
                                {showCountryDropdown && (
                                    <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                                        {filteredCountries.map((c, i) => (
                                            <li key={i} onClick={() => selectCountry(c)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0">{c}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State</label>
                                <div className="relative"><Flag size={18} className="absolute top-3 left-3 text-slate-400"/><input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                                <div className="relative"><MapPin size={18} className="absolute top-3 left-3 text-slate-400"/><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-bold text-slate-700" /></div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Address</label>
                                <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 outline-none font-bold text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-[#192a56] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl flex items-center justify-center gap-2">
                            <Save size={20} /> Save Profile
                        </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;