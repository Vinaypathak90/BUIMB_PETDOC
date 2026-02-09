import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Search, Filter, Calendar, Clock, 
  CheckCircle, XCircle, MoreVertical, Edit3, 
  Phone, Mail, Video, MapPin, Play, Plus, Trash2, Save,
  Thermometer, Activity, Weight, Ruler, FileText, ChevronLeft,
  X, Grid, List, Home, Layout, ExternalLink, Navigation,
  Mic, MicOff, Camera, CameraOff, Monitor, Share2, Clipboard
} from 'lucide-react';

const DoctorAppointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewState, setViewState] = useState('grid'); // 'grid', 'list', 'consultation'
  const [activeTab, setActiveTab] = useState('upcoming'); 
  const [appointments, setAppointments] = useState([]);
  const [filterType, setFilterType] = useState('All'); // All, Clinic, Home, Video
  
  // --- CONSULTATION STATE ---
  const [currentPatient, setCurrentPatient] = useState(null);
  const [sessionTime, setSessionTime] = useState(0); 
  const [medications, setMedications] = useState([]); 
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '', height: '', spo2: '' });
  const [clinicalNotes, setClinicalNotes] = useState({ symptoms: '', diagnosis: '', advice: '' });

  // --- EXTENSIVE MOCK DATA ---
  const mockData = [
    { 
      id: 101, patientName: "Aarav Sharma", type: "Video", age: "28", gender: "Male",
      date: "2026-02-11", time: "10:30 AM", status: "Upcoming", 
      email: "aarav.s@gmail.com", phone: "+91 98765 43210",
      symptoms: "High Fever, Chills", purpose: "General Follow Up",
      meetingLink: "meet.google.com/abc-xyz-123",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    },
    { 
      id: 102, patientName: "Priya Mehta", type: "Clinic", age: "34", gender: "Female",
      date: "2026-02-11", time: "11:15 AM", status: "Upcoming", 
      email: "priya.m@hotmail.com", phone: "+91 87654 32109",
      symptoms: "Tooth Sensitivity", purpose: "Root Canal",
      token: "A-12", room: "302",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    { 
      id: 103, patientName: "Ramesh Gupta", type: "Home", age: "65", gender: "Male",
      date: "2026-02-11", time: "02:00 PM", status: "Upcoming", 
      email: "ramesh.g@yahoo.com", phone: "+91 76543 21098",
      symptoms: "Post-Surgery Care", purpose: "Routine Checkup",
      address: "Flat 402, Green Valley Apts, Bandra West, Mumbai",
      coordinates: "19.0760, 72.8777",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    { 
      id: 104, patientName: "Sonia Fernandez", type: "Clinic", age: "24", gender: "Female",
      date: "2026-02-12", time: "09:30 AM", status: "Upcoming", 
      email: "sonia.f@gmail.com", phone: "+1 555 019 2834",
      symptoms: "Skin Rash", purpose: "Dermatology Consult",
      token: "B-05", room: "101",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    },
    { 
      id: 105, patientName: "Vinay Pathak", type: "clinic", age: "40", gender: "Male",
      date: "2026-02-12", time: "04:00 PM", status: "Upcoming", 
      email: "vikram.singh@corp.com", phone: "+91 99887 76655",
      symptoms: "Anxiety & Stress", purpose: "Mental Health",
      meetingLink: "zoom.us/j/9988776655",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    { 
      id: 106, patientName: "Grandma Rosie", type: "Home", age: "78", gender: "Female",
      date: "2026-02-13", time: "10:00 AM", status: "Pending", 
      email: "rosie.care@family.com", phone: "+1 202 555 0178",
      symptoms: "Arthritis Pain", purpose: "Physiotherapy",
      address: "78, Sunset Boulevard, Lokhandwala, Andheri",
      coordinates: "19.1300, 72.8200",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80"
    }
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    // Ideally merge with localStorage here
    setAppointments(mockData);
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (viewState === 'consultation') {
        interval = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---
  const handleStartAppointment = (app) => {
    setCurrentPatient(app);
    setViewState('consultation');
    setSessionTime(0);
    setMedications([]);
    setVitals({ temp: '', bp: '', pulse: '', weight: '', height: '', spo2: '' });
    setClinicalNotes({ symptoms: app.symptoms, diagnosis: '', advice: '' });
  };

  const handleEndAppointment = () => {
    const updatedList = appointments.map(app => 
        app.id === currentPatient.id ? { ...app, status: "Completed" } : app
    );
    setAppointments(updatedList);
    // localStorage.setItem('myAppointments', JSON.stringify(updatedList)); 
    setViewState('grid'); 
    setCurrentPatient(null);
    alert("Session Ended. Prescription Saved successfully!");
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', type: 'Tablet', dosage: '1-0-1', duration: '3 Days' }]);
  };

  const removeMedicationRow = (index) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const filteredList = appointments.filter(app => {
      const matchesTab = activeTab === 'all' ? true : app.status.toLowerCase() === activeTab;
      const matchesType = filterType === 'All' ? true : app.type === filterType;
      return matchesTab && matchesType;
  });

  return (
    <div className="bg-[#f0f4f8] min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">
                    {viewState === 'consultation' ? 'Live Session' : 'Appointments Manager'}
                </h2>
            </div>
            
            {viewState !== 'consultation' && (
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
                        {['All', 'Clinic', 'Video', 'Home'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === type ? 'bg-white shadow text-[#192a56]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="bg-slate-100 p-1 rounded-lg flex">
                        <button onClick={() => setViewState('grid')} className={`p-2 rounded-md transition-all ${viewState === 'grid' ? 'bg-white shadow text-[#00d0f1]' : 'text-slate-400'}`}><Grid size={18}/></button>
                        <button onClick={() => setViewState('list')} className={`p-2 rounded-md transition-all ${viewState === 'list' ? 'bg-white shadow text-[#00d0f1]' : 'text-slate-400'}`}><List size={18}/></button>
                    </div>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
                </div>
            )}
        </header>
        
        <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
          
          {/* =========================================================
              VIEW 1: DASHBOARD (GRID & LIST)
             ========================================================= */}
          {viewState !== 'consultation' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['upcoming', 'completed', 'cancelled'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                                activeTab === tab 
                                ? 'bg-[#192a56] text-white shadow-lg' 
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-[#00d0f1] hover:text-[#00d0f1]'
                            }`}
                        >
                            {tab}
                            <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                                {appointments.filter(a => a.status.toLowerCase() === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* GRID VIEW */}
                {viewState === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredList.map((app) => (
                            <div key={app.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                
                                {/* Type Badge */}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                                    app.type === 'Video' ? 'bg-purple-50 text-purple-600' :
                                    app.type === 'Home' ? 'bg-orange-50 text-orange-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {app.type === 'Video' && <Video size={12}/>}
                                    {app.type === 'Home' && <Home size={12}/>}
                                    {app.type === 'Clinic' && <Layout size={12}/>}
                                    {app.type}
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <img src={app.img} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-100" />
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">{app.patientName}</h3>
                                        <p className="text-xs text-slate-500 font-bold">ID: #APT00{app.id}</p>
                                        <p className="text-xs text-slate-400 mt-1">{app.age} Yrs • {app.gender}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Calendar size={16} className="text-[#00d0f1]"/> 
                                        <span className="font-bold">{app.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Clock size={16} className="text-[#00d0f1]"/> 
                                        <span className="font-bold">{app.time}</span>
                                    </div>
                                    {/* Conditional Address/Link Display */}
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        {app.type === 'Home' ? (
                                            <>
                                                <MapPin size={16} className="text-orange-500"/>
                                                <span className="truncate w-48 text-xs">{app.address}</span>
                                            </>
                                        ) : app.type === 'Video' ? (
                                            <>
                                                <Video size={16} className="text-purple-500"/>
                                                <span className="truncate w-48 text-xs">Online Call</span>
                                            </>
                                        ) : (
                                            <>
                                                <Layout size={16} className="text-blue-500"/>
                                                <span className="truncate w-48 text-xs">Room {app.room} • Token {app.token}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-6">
                                    {app.status === 'Upcoming' || app.status === 'Pending' ? (
                                        <>
                                            <button 
                                                onClick={() => handleStartAppointment(app)}
                                                className="flex-1 bg-[#192a56] text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-900 transition-colors shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <Play size={14} fill="currentColor"/> Start Now
                                            </button>
                                            <button className="p-3 border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <button className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-bold cursor-default flex items-center justify-center gap-2">
                                            <CheckCircle size={16}/> {app.status}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LIST VIEW */}
                {viewState === 'list' && (
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Patient</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Type</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Schedule</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Location Info</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img src={app.img} className="w-10 h-10 rounded-full object-cover" alt=""/>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{app.patientName}</p>
                                                <p className="text-[10px] text-slate-400">#APT00{app.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                app.type === 'Video' ? 'bg-purple-100 text-purple-700' :
                                                app.type === 'Home' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{app.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700 text-sm">{app.date}</p>
                                            <p className="text-xs text-slate-400">{app.time}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                            {app.type === 'Home' ? app.address : app.type === 'Video' ? 'Remote Call' : `Room ${app.room}`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {app.status === 'Upcoming' ? (
                                                <button onClick={() => handleStartAppointment(app)} className="text-xs bg-[#192a56] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-900">Start</button>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400">{app.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          )}

          {/* =========================================================
              VIEW 2: LIVE CONSULTATION (Dynamic based on Type)
             ========================================================= */}
          {viewState === 'consultation' && currentPatient && (
            <div className="animate-in zoom-in-95 duration-300 space-y-6">
                
                {/* 1. Header & Timer */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewState('grid')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={24}/></button>
                        <div>
                            <h2 className="text-lg font-black text-slate-800">{currentPatient.patientName}</h2>
                            <p className="text-xs text-slate-500">ID: #APT00{currentPatient.id} • {currentPatient.age} Yrs • {currentPatient.gender}</p>
                        </div>
                    </div>
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        {formatTime(sessionTime)}
                    </div>
                </div>

                {/* 2. DYNAMIC ACTION AREA (Video / Map / Clinic Token) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* -- LEFT: The "Context" Area -- */}
                    <div className="lg:col-span-2">
                        
                        {/* CONDITIONAL RENDER START */}
                        {currentPatient.type === 'Video' && (
                            <div className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-lg mb-6 group">
                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs">High Quality</div>
                                <img src={currentPatient.img} className="w-24 h-24 rounded-full border-4 border-white mb-4" alt=""/>
                                <h3 className="text-white text-xl font-bold">{currentPatient.patientName}</h3>
                                <p className="text-white/60 text-sm">Waiting in lobby...</p>
                                
                                <div className="absolute bottom-6 flex gap-4">
                                    <button className="p-4 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all"><MicOff size={20}/></button>
                                    <button className="p-4 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 animate-pulse"><Video size={24}/></button>
                                    <button className="p-4 bg-slate-700 rounded-full text-white hover:bg-slate-600 transition-all"><CameraOff size={20}/></button>
                                </div>
                            </div>
                        )}

                        {currentPatient.type === 'Home' && (
                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Home size={20} className="text-orange-600"/>
                                        <h3 className="text-lg font-black text-orange-800">Home Visit Required</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium mb-1">{currentPatient.address}</p>
                                    <p className="text-xs text-slate-400">Coords: {currentPatient.coordinates}</p>
                                    <div className="flex gap-3 mt-4">
                                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                                            <Navigation size={16}/> Start Navigation
                                        </button>
                                        <button className="bg-white text-orange-600 border border-orange-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50">
                                            Copy Address
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full md:w-48 h-32 bg-orange-200 rounded-xl flex items-center justify-center">
                                    <span className="text-orange-800 font-bold text-xs">Map Placeholder</span>
                                </div>
                            </div>
                        )}

                        {currentPatient.type === 'Clinic' && (
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-blue-900 mb-1">In-Clinic Visit</h3>
                                    <p className="text-sm text-blue-700">Patient has checked in at reception.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-blue-400 uppercase">Token Number</p>
                                    <p className="text-4xl font-black text-blue-600">{currentPatient.token}</p>
                                    <p className="text-xs font-bold text-blue-400 mt-1">Room: {currentPatient.room}</p>
                                </div>
                            </div>
                        )}
                        {/* CONDITIONAL RENDER END */}

                        {/* Clinical Inputs */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-[#00d0f1]"/> Vitals Check</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[{l:'Temp (F)', p:'98.6'}, {l:'BP', p:'120/80'}, {l:'Pulse', p:'72'}, {l:'Weight', p:'70'}].map((v,i) => (
                                    <div key={i}>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{v.l}</label>
                                        <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold focus:border-[#00d0f1] outline-none" placeholder={v.p} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} className="text-[#00d0f1]"/> Assessment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Chief Complaints</label>
                                    <input type="text" value={clinicalNotes.symptoms} onChange={(e)=>setClinicalNotes({...clinicalNotes, symptoms: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Diagnosis</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none" placeholder="Enter diagnosis..." />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* -- RIGHT: PRESCRIPTIONS & ACTIONS -- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800">Rx / Medicine</h3>
                                <button onClick={addMedicationRow} className="text-xs bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 font-bold">+ Add</button>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                                {medications.map((med, index) => (
                                    <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                                        <button onClick={() => removeMedicationRow(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X size={14}/></button>
                                        <input type="text" placeholder="Medicine Name" className="bg-transparent w-full text-sm font-bold text-slate-800 outline-none mb-2" />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="1-0-1" className="bg-white w-1/2 p-1 text-xs border border-slate-200 rounded text-center outline-none" />
                                            <input type="text" placeholder="5 Days" className="bg-white w-1/2 p-1 text-xs border border-slate-200 rounded text-center outline-none" />
                                        </div>
                                    </div>
                                ))}
                                {medications.length === 0 && <div className="text-center text-slate-400 text-xs py-10">No medicines added</div>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Patient Documents</label>
                            <div className="flex gap-2 mb-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-100"><Clipboard size={18}/></div>
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-100"><FileText size={18}/></div>
                            </div>
                            <button 
                                onClick={handleEndAppointment}
                                className="w-full bg-[#192a56] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-lg"
                            >
                                <Save size={18}/> Save & Finish
                            </button>
                        </div>
                    </div>

                </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DoctorAppointments;
