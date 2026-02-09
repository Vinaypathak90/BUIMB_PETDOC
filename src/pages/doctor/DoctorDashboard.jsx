import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import {
  Menu, Bell, Search, Calendar, Users, DollarSign,
  Clock, MoreHorizontal, CheckCircle, XCircle, Video,
  FileText, Activity, ChevronRight, X, Phone, Mail,
  MapPin, Stethoscope, ArrowUpRight, AlertCircle
} from 'lucide-react';

const DoctorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- CORE DATA STATE ---
  const [appointments, setAppointments] = useState([]);
  
  // --- DERIVED STATE (Updates automatically) ---
  const [stats, setStats] = useState({ patients: 0, appointments: 0, income: 0 });
  const [nextPatient, setNextPatient] = useState(null);

  // --- MODAL STATE ---
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- MOCK DATA (Fallback) ---
  const mockAppointments = [
    {
      id: 101, patientName: "Hendrita Hayes", type: "Human", age: "32", gender: "Female",
      date: "2026-02-08", time: "10:00 AM", status: "Upcoming",
      symptoms: "Severe Toothache, Swollen Gum",
      history: "Root Canal (2022), Penicillin Allergy",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      phone: "+1 555-0123", email: "hendrita@example.com"
    },
    {
      id: 102, patientName: "Bruno (Dog)", ownerName: "Rahul Verma", type: "Pet", age: "4", gender: "Male",
      date: "2026-02-08", time: "11:30 AM", status: "Pending",
      symptoms: "Limping left leg, Loss of appetite",
      history: "Vaccination Up to date, Previous fracture (2024)",
      img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80",
      phone: "+91 9876543210", email: "rahul@example.com"
    },
    {
      id: 103, patientName: "Adrian Marshall", type: "Human", age: "28", gender: "Male",
      date: "2026-02-09", time: "09:00 AM", status: "Upcoming",
      symptoms: "General Checkup, Mild Fever",
      history: "No significant history",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      phone: "+1 555-0987", email: "adrian@example.com"
    },
    {
      id: 104, patientName: "Kelly Joseph", type: "Human", age: "45", gender: "Female",
      date: "2026-02-09", time: "11:00 AM", status: "Upcoming",
      symptoms: "Migraine",
      history: "Chronic Migraine since 2018",
      img: "https://randomuser.me/api/portraits/women/65.jpg",
      phone: "+1 555-1122", email: "kelly@example.com"
    }
  ];

  // --- 1. INITIAL LOAD (Runs Once) ---
  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem('myAppointments')) || [];
    let combinedData = [...localData, ...mockAppointments];
    
    // Remove duplicates
    combinedData = combinedData.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);

    // Sort by Date & Time (Simple Sort)
    // Note: In a real app, use full Date objects. Here we roughly sort by ID/order for demo.
    combinedData.sort((a, b) => a.id - b.id);

    setAppointments(combinedData);
  }, []);

  // --- 2. AUTO-UPDATE LOGIC (Runs whenever 'appointments' changes) ---
  useEffect(() => {
    // A. Update "Next Patient" (Find the first 'Upcoming' one)
    const upcoming = appointments.find(a => a.status === 'Upcoming');
    setNextPatient(upcoming || null);

    // B. Update Statistics
    setStats({
      patients: appointments.length + 850, // Mock base count
      appointments: appointments.filter(a => a.status === 'Upcoming' || a.status === 'Pending').length,
      // Calculate income based on completed + upcoming (projected)
      income: appointments.filter(a => a.status !== 'Cancelled').length * 500 
    });

  }, [appointments]);

  // --- HANDLERS ---
  const handleStatusChange = (id, newStatus) => {
    const updatedList = appointments.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    setAppointments(updatedList);
    localStorage.setItem('myAppointments', JSON.stringify(updatedList));
  };

  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative font-sans">

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">

        {/* Header */}
        <header className="bg-white sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <div className="hidden md:block">
              <h2 className="text-xl font-black text-[#192a56]">Dr. Edalin Hendry</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dental Specialist</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute top-3 left-3 text-slate-400" />
              <input type="text" placeholder="Search patients..." className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#192a56]/20 w-64 transition-all" />
            </div>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="Doctor" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-[1600px] mx-auto">

          {/* =========================================================
              SECTION 1: NEXT PATIENT HERO CARD (Top Priority)
             ========================================================= */}
          {nextPatient ? (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-gradient-to-r from-[#192a56] to-blue-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d0f1] rounded-full blur-[80px] opacity-20 -mt-20 -mr-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[60px] opacity-20 -mb-20 -ml-20 pointer-events-none"></div>

                {/* Left: Patient Info */}
                <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                  <div className="relative">
                    <img src={nextPatient.img} alt="" className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-lg" />
                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-[#192a56] shadow-sm animate-pulse">Live</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#00d0f1] text-[#192a56] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Next Up</span>
                      <span className="text-white/60 text-xs font-bold flex items-center gap-1"><Clock size={12}/> Today, {nextPatient.time}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-1">{nextPatient.patientName}</h2>
                    <p className="text-blue-200 text-lg font-medium flex items-center gap-2">
                      <Stethoscope size={18} /> {nextPatient.symptoms || "General Consultation"}
                    </p>
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex gap-8 border-l border-white/10 pl-8 hidden lg:flex">
                  <div>
                    <p className="text-blue-300 text-xs font-bold uppercase mb-1">Patient ID</p>
                    <p className="text-xl font-black">#APT00{nextPatient.id}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-bold uppercase mb-1">Type</p>
                    <p className="text-xl font-black">{nextPatient.type} Visit</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-bold uppercase mb-1">History</p>
                    <p className="text-sm font-medium max-w-[150px] leading-tight opacity-80">{nextPatient.history}</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10">
                  <button className="bg-[#00d0f1] hover:bg-white hover:text-[#192a56] text-[#192a56] px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transform hover:scale-105">
                    <Video size={20} /> Start Call
                  </button>
                  <button onClick={() => openPatientDetails(nextPatient)} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                    <FileText size={20} /> View Profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Fallback if no upcoming appointments
            <div className="mb-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32}/>
               </div>
               <h3 className="text-2xl font-black text-slate-800">All Caught Up!</h3>
               <p className="text-slate-500">You have no upcoming appointments scheduled for today.</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

            {/* --- LEFT COLUMN --- */}
            <div className="xl:col-span-3 space-y-8">

              {/* 2. Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Patients</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{stats.patients}</h3>
                    <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">↑ 15% <span className="text-slate-400 font-medium">from last week</span></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar size={20} /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Appointments</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{stats.appointments}</h3>
                    <p className="text-xs text-orange-500 font-bold mt-1 flex items-center gap-1">● Today <span className="text-slate-400 font-medium">Pending</span></p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><DollarSign size={20} /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">₹{stats.income.toLocaleString()}</h3>
                    <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">↑ 20% <span className="text-slate-400 font-medium">increase</span></p>
                  </div>
                </div>
              </div>

              {/* 3. Upcoming Appointments List */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Appointment Queue</h3>
                  <div className="flex gap-2">
                    <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100">
                      <option>Today</option><option>This Week</option><option>Next Week</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {appointments.filter(a => a.status !== 'Cancelled').map((app) => (
                    <div key={app.id} className={`flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all bg-white group ${app.id === nextPatient?.id ? 'border-[#00d0f1] shadow-md bg-blue-50/30' : 'border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative cursor-pointer" onClick={() => openPatientDetails(app)}>
                          <img src={app.img || "https://www.w3schools.com/howto/img_avatar.png"} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                          {app.type === 'Pet' && (<span className="absolute -bottom-2 -right-2 bg-orange-100 text-orange-600 p-1 rounded-full border-2 border-white"><Activity size={12} /></span>)}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-lg font-bold text-slate-800 cursor-pointer hover:text-[#00d0f1] transition-colors" onClick={() => openPatientDetails(app)}>{app.patientName}</h4>
                          <p className="text-xs text-slate-500 font-medium">ID: #APT00{app.id}</p>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1"><Clock size={14} className="text-[#00d0f1]" /> {app.date} <span className="text-slate-400">|</span> {app.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                          <p className="text-sm font-bold text-slate-700 mt-1">{app.type} Visit</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Disease / Issue</p>
                          <p className="text-sm font-bold text-slate-700 mt-1 truncate max-w-[120px]">{app.symptoms || "General Checkup"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto justify-end">
                        {app.status === 'Pending' || app.status === 'Upcoming' ? (
                          <>
                            <button onClick={() => handleStatusChange(app.id, 'Approved')} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Accept"><CheckCircle size={20} /></button>
                            <button onClick={() => handleStatusChange(app.id, 'Cancelled')} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Cancel"><XCircle size={20} /></button>
                          </>
                        ) : (
                          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1"><CheckCircle size={14}/> {app.status}</span>
                        )}
                        <button onClick={() => openPatientDetails(app)} className="px-4 py-2 bg-[#192a56] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-all shadow-md">View Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="xl:col-span-1 space-y-8">

              {/* Weekly Overview (Bar Chart) */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Overview</h3>
                <div className="flex items-end justify-between h-48 px-2 gap-2">
                  {[40, 65, 30, 85, 50, 60, 90].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                      <div className="w-full bg-slate-100 rounded-t-lg relative h-full flex items-end overflow-hidden">
                        <div className={`w-full rounded-t-lg transition-all duration-1000 group-hover:opacity-80 ${i === 3 ? 'bg-[#00d0f1]' : 'bg-[#192a56]'}`} style={{ height: `${h}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between text-xs font-bold">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#192a56]"></span> Patients</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00d0f1]"></span> Revenue</div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* --- PATIENT DETAILS MODAL (SAAS STYLE) --- */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#192a56]/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

            <button onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors z-20">
              <X size={20} />
            </button>

            {/* Left: Patient Profile */}
            <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col items-center text-center overflow-y-auto">
              <img src={selectedPatient.img || "https://www.w3schools.com/howto/img_avatar.png"} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
              <h2 className="text-2xl font-black text-slate-800">{selectedPatient.patientName}</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">ID: #PT00{selectedPatient.id}</p>

              <div className="w-full space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">Gender</span><span className="text-sm font-bold text-slate-700">{selectedPatient.gender}</span></div>
                <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">Age</span><span className="text-sm font-bold text-slate-700">{selectedPatient.age} Years</span></div>
                <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">Phone</span><span className="text-sm font-bold text-slate-700">{selectedPatient.phone || 'N/A'}</span></div>
                {selectedPatient.type === 'Pet' && (<div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold text-slate-400">Owner</span><span className="text-sm font-bold text-slate-700">{selectedPatient.ownerName}</span></div>)}
              </div>

              <div className="mt-auto w-full flex gap-3 pt-6">
                <button className="flex-1 py-3 rounded-xl bg-[#192a56] text-white text-xs font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"><Phone size={14} /> Call</button>
                <button className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"><Mail size={14} /> Email</button>
              </div>
            </div>

            {/* Right: Medical Details */}
            <div className="w-full md:w-2/3 p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={20} className="text-[#00d0f1]" />
                <h3 className="text-xl font-black text-slate-800">Medical Record</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                  <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-2">Current Symptoms</h4>
                  <p className="text-sm font-medium text-slate-700">{selectedPatient.symptoms || "No specific symptoms recorded."}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16} /> Past History</h4>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedPatient.history || "No medical history available."}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Last Vitals Readings</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"><p className="text-xs text-slate-400 font-bold uppercase">Heart Rate</p><p className="text-lg font-black text-slate-800">82 <span className="text-[10px] text-slate-400">bpm</span></p></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"><p className="text-xs text-slate-400 font-bold uppercase">Body Temp</p><p className="text-lg font-black text-slate-800">98.6 <span className="text-[10px] text-slate-400">F</span></p></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"><p className="text-xs text-slate-400 font-bold uppercase">Glucose</p><p className="text-lg font-black text-slate-800">92 <span className="text-[10px] text-slate-400">mg/dl</span></p></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Attached Reports</h4>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><FileText size={14} /></div>
                      <div><p className="text-xs font-bold text-slate-700">Blood_Report.pdf</p><p className="text-[10px] text-slate-400">12th Oct 2025</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;