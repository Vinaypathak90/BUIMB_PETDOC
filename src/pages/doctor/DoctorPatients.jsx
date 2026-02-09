import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Search, Filter, MapPin, Phone, Mail, 
  Calendar, Clock, MoreHorizontal, FileText, ChevronRight, 
  User, Droplet, Activity, CreditCard, CheckCircle, X, ChevronLeft,
  Video, Home, Layout, MessageSquare, Plus, Download, Printer, Share2, 
  File, UploadCloud, Trash2, Edit
} from 'lucide-react';

const DoctorPatients = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- STATES ---
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, appointments, billing
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // --- FORM STATE FOR NEW PATIENT ---
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    location: ''
  });

  // --- MOCK DATA (Initial Fallback) ---
  const mockPatients = [
    {
      id: "PT001", name: "Charlene Reed", age: "28", gender: "Female", bloodGroup: "A+",
      phone: "+1 23 456 7890", email: "charlene@example.com", location: "North Carolina, USA",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      lastVisit: "20 Oct 2023", totalPaid: 1200, status: "Active",
      vitals: { bp: "120/80", heartRate: "72", glucose: "90", temp: "98.6" },
      history: [
        { id: 101, date: "14 Nov 2023", time: "10:00 AM", purpose: "General Checkup", type: "Clinic", status: "Completed", fee: 200 },
        { id: 102, date: "12 Nov 2023", time: "11:00 AM", purpose: "Fever Consultation", type: "Video", status: "Completed", fee: 150 },
      ],
      bills: [
        { id: "INV-001", date: "14 Nov 2023", amount: 200, status: "Paid" },
        { id: "INV-002", date: "12 Nov 2023", amount: 150, status: "Paid" },
      ],
      records: [
        { id: 1, date: "14 Nov 2023", title: "Blood Test Report", type: "Lab", doctor: "Dr. Edalin" },
        { id: 2, date: "10 Oct 2023", title: "Dental X-Ray", type: "X-Ray", doctor: "Dr. Smith" }
      ]
    },
    {
      id: "PT002", name: "Travis Trimble", age: "35", gender: "Male", bloodGroup: "B+",
      phone: "+1 50 234 5678", email: "travis@example.com", location: "Maine, USA",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      lastVisit: "01 Nov 2023", totalPaid: 450, status: "Active",
      vitals: { bp: "130/85", heartRate: "80", glucose: "110", temp: "99.1" },
      history: [], bills: [], records: []
    }
  ];

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
    const savedData = localStorage.getItem('doctorPatients');
    if (savedData) {
        setPatients(JSON.parse(savedData));
    } else {
        setPatients(mockPatients);
        localStorage.setItem('doctorPatients', JSON.stringify(mockPatients));
    }
  }, []);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatientSubmit = (e) => {
    e.preventDefault();
    
    // Basic Validation
    if(!newPatient.firstName || !newPatient.phone) {
        alert("Please fill in at least Name and Phone number.");
        return;
    }

    const patientData = {
        id: `PT${Math.floor(Math.random() * 10000)}`,
        name: `${newPatient.firstName} ${newPatient.lastName}`,
        age: newPatient.age || "N/A",
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: newPatient.phone,
        email: newPatient.email,
        location: newPatient.location || "Unknown City",
        img: `https://ui-avatars.com/api/?name=${newPatient.firstName}+${newPatient.lastName}&background=random&color=fff`,
        lastVisit: "Just Added",
        totalPaid: 0,
        status: "Active",
        vitals: { bp: "-", heartRate: "-", glucose: "-", temp: "-" },
        history: [],
        bills: [],
        records: []
    };

    const updatedList = [patientData, ...patients];
    setPatients(updatedList);
    localStorage.setItem('doctorPatients', JSON.stringify(updatedList));
    
    setShowAddPatientModal(false);
    setNewPatient({ firstName: '', lastName: '', email: '', phone: '', age: '', gender: 'Male', bloodGroup: 'O+', location: '' }); // Reset form
    alert("Patient Added Successfully!");
  };

  const handleDeletePatient = (id, e) => {
      e.stopPropagation(); // Prevent opening profile when clicking delete
      if(window.confirm("Are you sure you want to delete this patient profile? This action cannot be undone.")) {
          const updatedList = patients.filter(p => p.id !== id);
          setPatients(updatedList);
          localStorage.setItem('doctorPatients', JSON.stringify(updatedList));
          if(selectedPatient && selectedPatient.id === id) {
              setSelectedPatient(null);
          }
      }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if(selectedPatient) {
        const newRecord = { 
            id: Date.now(), 
            date: new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}), 
            title: "New Medical Document", 
            type: "Rx", 
            doctor: "You" 
        };
        
        // Update in main list
        const updatedList = patients.map(p => {
            if(p.id === selectedPatient.id) {
                return { ...p, records: [newRecord, ...p.records] };
            }
            return p;
        });

        setPatients(updatedList);
        localStorage.setItem('doctorPatients', JSON.stringify(updatedList));
        
        // Update currently selected view
        setSelectedPatient(prev => ({ ...prev, records: [newRecord, ...prev.records] }));
        
        alert("Record added successfully!");
    }
    setShowAddRecordModal(false);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalPatients = patients.length;
  const newThisMonth = patients.filter(p => p.lastVisit.includes("Oct") || p.lastVisit === "Just Added").length; // Mock logic
  const totalEarnings = patients.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

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
                <h2 className="text-xl font-black text-[#192a56]">Patient Management</h2>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setShowAddPatientModal(true)} className="hidden md:flex bg-[#192a56] text-white px-4 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all">
                    <Plus size={18}/> Add New Patient
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8">
          
          {/* --- TOP STATS BAR (SaaS Feel) --- */}
          {!selectedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Total Patients</p>
                          <h3 className="text-2xl font-black text-slate-800">{totalPatients}</h3>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><User size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">New This Month</p>
                          <h3 className="text-2xl font-black text-slate-800">+{newThisMonth}</h3>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><Plus size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Critical Cases</p>
                          <h3 className="text-2xl font-black text-slate-800">3</h3>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 text-red-600"><Activity size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p>
                          <h3 className="text-2xl font-black text-slate-800">${totalEarnings}</h3>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><CreditCard size={24}/></div>
                  </div>
              </div>
          )}

          {/* =========================================================
              VIEW 1: PATIENTS GRID
             ========================================================= */}
          {!selectedPatient && (
            <>
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute top-3 left-3 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Search by name, ID or location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none shadow-sm" 
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2"><Filter size={16}/> Filter</button>
                        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2"><Download size={16}/> Export</button>
                    </div>
                </div>

                {/* Grid */}
                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {filteredPatients.map((patient) => (
                            <div key={patient.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                
                                {/* Action Menu */}
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button 
                                        onClick={(e) => handleDeletePatient(patient.id, e)}
                                        className="p-2 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Patient"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative mb-3">
                                        <img src={patient.img} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                                        <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${patient.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">{patient.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold">{patient.id} • {patient.location.split(',')[0]}</p>
                                </div>

                                <div className="flex justify-between border-t border-b border-slate-100 py-4 mb-4">
                                    <div className="text-center w-1/3 border-r border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold">Blood</p>
                                        <p className="text-sm font-black text-slate-700">{patient.bloodGroup}</p>
                                    </div>
                                    <div className="text-center w-1/3 border-r border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold">Age</p>
                                        <p className="text-sm font-black text-slate-700">{patient.age}</p>
                                    </div>
                                    <div className="text-center w-1/3">
                                        <p className="text-xs text-slate-400 font-bold">Paid</p>
                                        <p className="text-sm font-black text-emerald-600">${patient.totalPaid}</p>
                                    </div>
                                </div>

                                <button onClick={() => setSelectedPatient(patient)} className="w-full bg-[#f8faff] text-[#192a56] border border-[#192a56]/10 py-3 rounded-xl font-bold text-sm hover:bg-[#192a56] hover:text-white transition-all">View Profile</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={40} className="text-slate-400"/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-600">No Patients Found</h3>
                        <p className="text-slate-400 text-sm">Try adding a new patient or adjust search.</p>
                    </div>
                )}

                {/* Pagination */}
                {filteredPatients.length > 0 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-sm font-bold">Prev</button>
                        <button className="w-10 h-10 rounded-lg bg-[#192a56] text-white text-sm font-bold">1</button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold">2</button>
                        <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-sm font-bold">Next</button>
                    </div>
                )}
            </>
          )}

          {/* =========================================================
              VIEW 2: PATIENT 360 PROFILE
             ========================================================= */}
          {selectedPatient && (
            <div className="animate-in zoom-in-95 duration-300">
                <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-slate-500 hover:text-[#192a56] font-bold mb-6 transition-colors">
                    <ChevronLeft size={20}/> Back to Patient List
                </button>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* --- LEFT SIDEBAR --- */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-[#192a56]"></div>
                            <img src={selectedPatient.img} alt="" className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4" />
                            <h2 className="text-2xl font-black text-slate-800">{selectedPatient.name}</h2>
                            <p className="text-sm text-slate-500 font-medium mb-6">Patient ID: #{selectedPatient.id}</p>

                            <div className="flex justify-center gap-3 mb-8">
                                <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100" title="Call"><Phone size={20}/></button>
                                <button className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100" title="Email"><Mail size={20}/></button>
                                <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100" title="Chat"><MessageSquare size={20}/></button>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Gender</span><span className="font-bold text-slate-700">{selectedPatient.gender}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Age</span><span className="font-bold text-slate-700">{selectedPatient.age} Years</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Blood Group</span><span className="font-bold text-slate-700">{selectedPatient.bloodGroup}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Phone</span><span className="font-bold text-slate-700">{selectedPatient.phone}</span></div>
                            </div>
                        </div>

                        {/* Vitals */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Last Vitals</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedPatient.vitals).map(([key, val]) => (
                                    <div key={key} className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{key}</p>
                                        <p className="text-lg font-black text-slate-800">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT CONTENT --- */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
                            
                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 p-4 gap-2 overflow-x-auto">
                                {[{id:'timeline', l:'Medical Records', i:FileText}, {id:'appointments', l:'Appointments', i:Calendar}, {id:'billing', l:'Billing', i:CreditCard}].map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => setActiveTab(t.id)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#192a56] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <t.i size={16}/> {t.l}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 flex-1 bg-[#fcfcfc]">
                                
                                {/* --- TAB: MEDICAL RECORDS (TIMELINE) --- */}
                                {activeTab === 'timeline' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-800">Medical History</h3>
                                            <button onClick={() => setShowAddRecordModal(true)} className="bg-[#00d0f1] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-cyan-500">
                                                <Plus size={16}/> Add Record
                                            </button>
                                        </div>

                                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                                            {selectedPatient.records && selectedPatient.records.length > 0 ? (
                                                selectedPatient.records.map((rec) => (
                                                    <div key={rec.id} className="relative pl-8">
                                                        <span className="absolute -left-[9px] top-0 w-4 h-4 bg-[#00d0f1] rounded-full border-4 border-white shadow-sm"></span>
                                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-bold text-slate-800 text-md">{rec.title}</h4>
                                                                    <p className="text-xs text-slate-500">Prescribed by <span className="font-bold">{rec.doctor}</span></p>
                                                                </div>
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{rec.date}</span>
                                                            </div>
                                                            <div className="flex gap-2 mt-4">
                                                                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><File size={14}/> View</button>
                                                                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><Download size={14}/> Download</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="pl-8 text-slate-400 text-sm">No medical records found. Add one to start history.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* --- TAB: APPOINTMENTS --- */}
                                {activeTab === 'appointments' && (
                                    <div className="space-y-4">
                                        {selectedPatient.history && selectedPatient.history.length > 0 ? (
                                            selectedPatient.history.map(apt => (
                                                <div key={apt.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${apt.type === 'Video' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                            {apt.type === 'Video' ? <Video size={20}/> : <Home size={20}/>}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{apt.purpose}</h4>
                                                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1"><Calendar size={12}/> {apt.date} • {apt.time}</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Completed</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-400 py-10">No past appointment history</div>
                                        )}
                                    </div>
                                )}

                                {/* --- TAB: BILLING --- */}
                                {activeTab === 'billing' && (
                                    <div>
                                        <div className="flex justify-end mb-4 gap-2">
                                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><Printer size={16}/> Print All</button>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><Share2 size={16}/> Email</button>
                                        </div>
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-l-lg">ID</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Amount</th>
                                                    <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {selectedPatient.bills && selectedPatient.bills.length > 0 ? (
                                                    selectedPatient.bills.map(bill => (
                                                        <tr key={bill.id} className="border-b border-slate-50 hover:bg-slate-50">
                                                            <td className="px-4 py-4 font-bold text-[#00d0f1]">#{bill.id}</td>
                                                            <td className="px-4 py-4 text-slate-600">{bill.date}</td>
                                                            <td className="px-4 py-4 font-black">${bill.amount}</td>
                                                            <td className="px-4 py-4 text-right">
                                                                <button className="text-xs font-bold text-blue-600 hover:underline">Download</button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="4" className="text-center py-6 text-slate-400">No billing history</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </main>
      </div>

      {/* --- ADD PATIENT MODAL --- */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">Add New Patient</h3>
                    <button onClick={() => setShowAddPatientModal(false)}><X size={24} className="text-slate-400 hover:text-slate-800"/></button>
                </div>
                <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" value={newPatient.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" required />
                        <input type="text" name="lastName" value={newPatient.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" name="email" value={newPatient.email} onChange={handleInputChange} placeholder="Email Address" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" />
                        <input type="text" name="phone" value={newPatient.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input type="number" name="age" value={newPatient.age} onChange={handleInputChange} placeholder="Age" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" />
                        <select name="gender" value={newPatient.gender} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1] bg-white">
                            <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                        <select name="bloodGroup" value={newPatient.bloodGroup} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1] bg-white">
                            <option>A+</option><option>O+</option><option>B+</option><option>AB+</option>
                        </select>
                    </div>
                    <input type="text" name="location" value={newPatient.location} onChange={handleInputChange} placeholder="Location (City, Country)" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00d0f1]" />
                    
                    <button type="submit" className="w-full bg-[#192a56] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg">Create Patient Profile</button>
                </form>
            </div>
        </div>
      )}

      {/* --- ADD RECORD MODAL --- */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2">Upload Medical Record</h3>
                <p className="text-sm text-slate-500 mb-6">Upload Lab reports, X-rays or Prescriptions</p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <UploadCloud size={40} className="mx-auto text-slate-300 mb-2 group-hover:text-[#00d0f1] transition-colors"/>
                    <p className="text-xs text-slate-400 font-bold">Click to browse or drag file here</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowAddRecordModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleAddRecord} className="flex-1 py-3 bg-[#00d0f1] text-white rounded-xl font-bold text-sm hover:bg-cyan-500 shadow-md">Upload Now</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default DoctorPatients;