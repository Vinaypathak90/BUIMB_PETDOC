import React, { useState, useRef, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Activity, Heart, Bone,  Dog, User, MapPin, Clock, 
  Search, Plus, Stethoscope, Brain, Edit3, Trash2, X, 
  Save, Camera, ChevronDown, Check
} from 'lucide-react';

const Specialities = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- DROPDOWN STATE ---
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // --- DATA LISTS ---
  const humanSpecialties = [
    "Cardiology", "Dentist", "Neurology", "Urology", "Orthopaedics", 
    "Dermatology", "Pediatrics", "General Physician", "Ophthalmology"
  ];

  const vetSpecialties = [
    "Pet Surgery", "Canine Specialist", "Feline Specialist", "Avian Vet", 
    "Reptile Specialist", "Equine Vet", "Pet Dermatology", "Animal Nutrition"
  ];

  // --- INITIAL FORM STATE ---
  const initialFormState = {
    id: null,
    name: '',
    type: 'human', // 'human' or 'pet'
    speciality: '',
    status: 'available', // 'available', 'busy', 'break'
    currentTask: '',
    location: '',
    nextFree: '',
    img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  const [currentSpecialist, setCurrentSpecialist] = useState(initialFormState);

  // --- LIVE DATA STATE ---
  const [specialists, setSpecialists] = useState([
    { 
      id: 1, name: "Dr. Darren Elder", type: "pet", speciality: "Pet Surgery", status: "busy", 
      currentTask: "Performing Surgery on 'Bruno'", location: "Operation Theatre 2", nextFree: "02:30 PM", 
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    { 
      id: 2, name: "Dr. Ruby Perrin", type: "human", speciality: "Dentist", status: "available", 
      currentTask: "Waiting for next patient", location: "Cabin 4 (Dental Wing)", nextFree: "Now", 
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    { 
      id: 3, name: "Dr. Deborah Angel", type: "human", speciality: "Cardiology", status: "busy", 
      currentTask: "Consulting with Mr. Kelly", location: "Consultation Room 12", nextFree: "11:45 AM", 
      img: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    { 
      id: 4, name: "Dr. Marvin Campbell", type: "pet", speciality: "Orthopaedics", status: "break", 
      currentTask: "Lunch Break", location: "Staff Cafeteria", nextFree: "01:00 PM", 
      img: "https://randomuser.me/api/portraits/men/51.jpg"
    },
    { 
      id: 5, name: "Dr. Sofia Brient", type: "human", speciality: "Urology", status: "available", 
      currentTask: "Reviewing Reports", location: "Cabin 8", nextFree: "Now", 
      img: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ]);

  // --- DYNAMIC COUNTS ---
  const getCount = (term) => specialists.filter(s => s.speciality.toLowerCase().includes(term.toLowerCase())).length;
  
  const categories = [
    { name: "Cardiology", icon: Heart, count: getCount('Cardiology'), type: "human" },
    { name: "Pet Surgery", icon: Dog, count: getCount('Surgery'), type: "pet" },
    { name: "Orthopaedics", icon: Bone, count: getCount('Orthopaedics'), type: "mixed" },
    { name: "Neurology", icon: Brain, count: getCount('Neurology'), type: "human" },
    { name: "General", icon: Stethoscope, count: getCount('Dentist') + getCount('Urology'), type: "mixed" },
  ];

  // --- HANDLERS ---
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSpecDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => { setCurrentSpecialist(initialFormState); setIsModalOpen(true); };
  const handleEdit = (doc) => { setCurrentSpecialist(doc); setIsModalOpen(true); };
  const handleDelete = (id) => { if(window.confirm("Remove this specialist?")) setSpecialists(specialists.filter(doc => doc.id !== id)); };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentSpecialist.id) {
      setSpecialists(specialists.map(doc => doc.id === currentSpecialist.id ? currentSpecialist : doc));
    } else {
      setSpecialists([...specialists, { ...currentSpecialist, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setCurrentSpecialist({ ...currentSpecialist, img: URL.createObjectURL(file) });
  };

  // Select Speciality from Dropdown
  const handleSpecSelect = (spec) => {
    setCurrentSpecialist({ ...currentSpecialist, speciality: spec });
    setShowSpecDropdown(false);
  };

  // Filtered List for Dropdown
  const activeList = currentSpecialist.type === 'human' ? humanSpecialties : vetSpecialties;
  const filteredSpecs = activeList.filter(s => s.toLowerCase().includes(currentSpecialist.speciality.toLowerCase()));

  // Filter Logic for Main Table
  const filteredSpecialists = specialists.filter(doc => {
    const matchesTab = activeTab === 'all' ? true : doc.type === activeTab;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen relative">
      
      {/* Sidebar & Header */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Specialist Live Tracker</h1>
              <p className="text-slate-500 text-sm">Monitor doctor locations and current activity.</p>
            </div>
            <button onClick={handleAdd} className="bg-[#192a56] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg">
                <Plus size={18} /> Add Specialist to Tracker
            </button>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {categories.map((cat, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${index % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}><cat.icon size={20} /></div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{cat.count} Active</span>
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                </div>
            ))}
          </div>

          {/* Tracker Grid */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>All View</button>
                    <button onClick={() => setActiveTab('human')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'human' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><User size={14}/> Human Docs</button>
                    <button onClick={() => setActiveTab('pet')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'pet' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}><Dog size={14}/> Pet Vets</button>
                </div>
                <div className="relative w-full md:w-72">
                    <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                    <input type="text" placeholder="Find specialist, room or activity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none font-medium text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSpecialists.map((doc) => (
                    <div key={doc.id} className="border border-slate-200 rounded-2xl p-5 relative hover:shadow-lg transition-all bg-slate-50/50 group">
                        <div className="absolute top-5 right-5 flex items-center gap-2">
                            <span className={`relative flex h-3 w-3`}><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${doc.status === 'busy' ? 'bg-red-400' : doc.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span><span className={`relative inline-flex rounded-full h-3 w-3 ${doc.status === 'busy' ? 'bg-red-500' : doc.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span></span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${doc.status === 'busy' ? 'text-red-600' : doc.status === 'available' ? 'text-emerald-600' : 'text-amber-600'}`}>{doc.status === 'busy' ? 'In Procedure' : doc.status}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <img src={doc.img} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                            <div><h3 className="font-bold text-slate-800">{doc.name}</h3><div className="flex items-center gap-2 text-xs text-slate-500"><span className="font-medium text-blue-600">{doc.speciality}</span><span>•</span>{doc.type === 'pet' ? <Dog size={12} /> : <User size={12} />}</div></div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4 shadow-sm"><div className="flex items-start gap-3"><Activity size={16} className="text-slate-400 mt-0.5" /><div><p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Current Activity</p><p className="text-sm font-semibold text-slate-700 leading-snug">{doc.currentTask}</p></div></div></div>
                        <div className="grid grid-cols-2 gap-3 text-xs"><div className="bg-slate-100 p-2 rounded-lg flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-slate-400" /><span className="font-bold truncate">{doc.location}</span></div><div className={`p-2 rounded-lg flex items-center gap-2 font-bold ${doc.status === 'available' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><Clock size={14} className={doc.status === 'available' ? 'text-emerald-500' : 'text-slate-400'} /><span>Free: {doc.nextFree}</span></div></div>
                        <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"><button onClick={() => handleEdit(doc)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"><Edit3 size={14} /></button><button onClick={() => handleDelete(doc.id)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"><Trash2 size={14} /></button></div>
                    </div>
                ))}
            </div>
          </div>
        </main>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#192a56] p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">{currentSpecialist.id ? 'Update Status' : 'Add Specialist'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div className="flex items-center gap-4">
                 <div className="relative group w-20 h-20 flex-shrink-0 cursor-pointer">
                    <img src={currentSpecialist.img} alt="Profile" className="w-full h-full rounded-xl object-cover border-2 border-slate-100" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 text-white text-xs">Change</div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <input type="text" required placeholder="Doctor Name" value={currentSpecialist.name} onChange={(e) => setCurrentSpecialist({...currentSpecialist, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                    
                    {/* --- SMART SPECIALITY DROPDOWN (Fixed) --- */}
                    <div className="relative" ref={dropdownRef}>
                        <input 
                            type="text" 
                            placeholder="Speciality (e.g. Surgery)" 
                            value={currentSpecialist.speciality} 
                            onClick={() => setShowSpecDropdown(true)}
                            onChange={(e) => {
                                setCurrentSpecialist({...currentSpecialist, speciality: e.target.value});
                                setShowSpecDropdown(true);
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" 
                        />
                        <ChevronDown size={16} className="absolute top-2.5 right-3 text-slate-400 pointer-events-none" />
                        
                        {/* Dropdown List */}
                        {showSpecDropdown && (
                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                                {filteredSpecs.length > 0 ? (
                                    filteredSpecs.map((spec, i) => (
                                        <li 
                                            key={i} 
                                            onClick={() => handleSpecSelect(spec)}
                                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex justify-between items-center"
                                        >
                                            {spec}
                                            {currentSpecialist.speciality === spec && <Check size={14} className="text-emerald-500" />}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-2 text-xs text-slate-400 italic">No match found. Type to add custom.</li>
                                )}
                            </ul>
                        )}
                    </div>
                 </div>
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Status</label>
                    <select value={currentSpecialist.status} onChange={(e) => setCurrentSpecialist({...currentSpecialist, status: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white">
                        <option value="available">Available (Green)</option>
                        <option value="busy">In Procedure (Red)</option>
                        <option value="break">On Break (Amber)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Doctor Type</label>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button type="button" onClick={() => { setCurrentSpecialist({...currentSpecialist, type: 'human', speciality: ''}); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${currentSpecialist.type === 'human' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Human</button>
                        <button type="button" onClick={() => { setCurrentSpecialist({...currentSpecialist, type: 'pet', speciality: ''}); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${currentSpecialist.type === 'pet' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}>Pet</button>
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Activity / Task</label>
                 <div className="relative"><Activity size={16} className="absolute top-2.5 left-3 text-slate-400" /><input type="text" required placeholder="e.g. Performing Surgery on Bruno" value={currentSpecialist.currentTask} onChange={(e) => setCurrentSpecialist({...currentSpecialist, currentTask: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Location</label>
                    <div className="relative"><MapPin size={16} className="absolute top-2.5 left-3 text-slate-400" /><input type="text" required placeholder="Room No / OT" value={currentSpecialist.location} onChange={(e) => setCurrentSpecialist({...currentSpecialist, location: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none" /></div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Next Free Time</label>
                    <div className="relative"><Clock size={16} className="absolute top-2.5 left-3 text-slate-400" /><input type="text" required placeholder="e.g. 02:30 PM" value={currentSpecialist.nextFree} onChange={(e) => setCurrentSpecialist({...currentSpecialist, nextFree: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none" /></div>
                 </div>
              </div>

              <button type="submit" className="w-full bg-[#192a56] text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                <Save size={18} /> {currentSpecialist.id ? 'Update Status' : 'Add to Tracker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specialities;