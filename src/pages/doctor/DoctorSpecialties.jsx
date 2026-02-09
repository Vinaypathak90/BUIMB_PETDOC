import React, { useState } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Plus, Trash2, Save, ChevronDown, CheckCircle, 
  Stethoscope, IndianRupee, FileText, Activity, Layers, Zap, Sparkles
} from 'lucide-react';

const DoctorSpecialties = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // --- MOCK DATA ---
  const [specialties, setSpecialties] = useState([
    { 
      id: 1, 
      name: "Cardiology", 
      services: [
        { id: 101, name: "Consultation", price: "800", description: "General heart checkup and initial diagnosis." },
        { id: 102, name: "ECG Test", price: "1200", description: "Electrocardiogram test for heart rhythm." }
      ] 
    },
    { 
      id: 2, 
      name: "Neurology", 
      services: [
        { id: 201, name: "Brain MRI Analysis", price: "2500", description: "Detailed analysis of MRI reports." }
      ] 
    }
  ]);

  // --- AUTO-SUGGESTION STATE ---
  const [activeSuggestion, setActiveSuggestion] = useState({ specId: null, svcId: null, list: [] });

  // Pre-defined Service Database (For Auto-Complete)
  const serviceDatabase = [
    "General Consultation", "Video Consultation", "Follow-up Visit", "Emergency Visit",
    "ECG (Electrocardiogram)", "Echocardiogram", "Stress Test", "Holter Monitoring",
    "Root Canal Treatment", "Teeth Cleaning", "Dental Implant", "Teeth Whitening",
    "MRI Scan", "CT Scan", "X-Ray", "Ultrasound",
    "Blood Sugar Test", "Complete Blood Count (CBC)", "Lipid Profile", "Thyroid Test",
    "Vaccination", "Dressing", "Suture Removal", "Nebulization"
  ];

  // Dropdown Options for Specialty
  const specialityOptions = [
    "Cardiology", "Neurology", "Dentist", "Orthopedic", 
    "Pediatrics", "Dermatology", "Gynecology", "General Surgery"
  ];

  // --- HANDLERS ---

  // 1. Service Input Change with Auto-Suggest Logic
  const handleServiceInputChange = (specId, svcId, value) => {
    // Update Value
    handleUpdateService(specId, svcId, 'name', value);

    // Filter Suggestions
    if (value.length > 0) {
        const filtered = serviceDatabase.filter(s => 
            s.toLowerCase().includes(value.toLowerCase())
        );
        setActiveSuggestion({ specId, svcId, list: filtered });
    } else {
        setActiveSuggestion({ specId: null, svcId: null, list: [] });
    }
  };

  // 2. Select a Suggestion
  const handleSelectSuggestion = (specId, svcId, value) => {
    handleUpdateService(specId, svcId, 'name', value);
    setActiveSuggestion({ specId: null, svcId: null, list: [] }); // Hide list
  };

  const handleAddSpecialty = () => {
    const newSpec = {
      id: Date.now(),
      name: "",
      services: [{ id: Date.now() + 1, name: "", price: "", description: "" }]
    };
    setSpecialties([newSpec, ...specialties]);
  };

  const handleRemoveSpecialty = (id) => {
    if(window.confirm("Delete this entire specialty?")) {
        setSpecialties(specialties.filter(s => s.id !== id));
    }
  };

  const handleUpdateSpecialtyName = (id, newName) => {
    setSpecialties(specialties.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleAddService = (specId) => {
    const newService = { id: Date.now(), name: "", price: "", description: "" };
    setSpecialties(specialties.map(s => 
        s.id === specId ? { ...s, services: [...s.services, newService] } : s
    ));
  };

  const handleRemoveService = (specId, serviceId) => {
    setSpecialties(specialties.map(s => 
        s.id === specId ? { ...s, services: s.services.filter(svc => svc.id !== serviceId) } : s
    ));
  };

  const handleUpdateService = (specId, serviceId, field, value) => {
    setSpecialties(specialties.map(s => 
        s.id === specId ? { 
            ...s, 
            services: s.services.map(svc => svc.id === serviceId ? { ...svc, [field]: value } : svc)
        } : s
    ));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculations
  const totalSpecialties = specialties.length;
  const totalServices = specialties.reduce((acc, curr) => acc + curr.services.length, 0);

  return (
    <div className="bg-[#f0f4f8] min-h-screen relative font-sans">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 right-10 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right z-[60]">
            <CheckCircle size={24} className="text-white"/>
            <div>
                <h4 className="font-bold">Updates Saved!</h4>
                <p className="text-xs text-emerald-100">Your service catalog has been updated.</p>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">Specialties & Services</h2>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleSave} className="bg-[#192a56] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20 transform hover:scale-105 active:scale-95">
                    <Save size={18}/> Save Changes
                </button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-6xl mx-auto">
          
          {/* 1. Quick Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
              <div className="bg-gradient-to-br from-[#192a56] to-blue-900 p-6 rounded-[1.5rem] shadow-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={80}/></div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Total Specialties</p>
                  <h3 className="text-3xl font-black mt-1">{totalSpecialties}</h3>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-[#00d0f1]"><Zap size={80}/></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Services</p>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">{totalServices}</h3>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <h3 className="font-bold text-slate-800">Add New Category</h3>
                      <p className="text-xs text-slate-500">Expand your medical services</p>
                  </div>
                  <button onClick={handleAddSpecialty} className="bg-[#00d0f1] p-3 rounded-xl text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/30 transition-all transform hover:rotate-90 duration-300">
                      <Plus size={24}/>
                  </button>
              </div>
          </div>

          {/* 2. Specialties List */}
          <div className="space-y-8 pb-20">
              {specialties.map((spec) => (
                  <div key={spec.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 group border border-slate-100 hover:border-blue-100 transition-all">
                      
                      {/* --- HEADER --- */}
                      <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#00d0f1] shadow-sm border border-slate-100">
                                  <Stethoscope size={24}/>
                              </div>
                              <div className="flex-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Specialty Name</label>
                                  <div className="relative group/select">
                                      <select 
                                        value={spec.name} 
                                        onChange={(e) => handleUpdateSpecialtyName(spec.id, e.target.value)}
                                        className="w-full md:w-72 bg-transparent font-black text-xl text-slate-800 outline-none appearance-none cursor-pointer border-b-2 border-transparent focus:border-[#00d0f1] transition-all py-1 pr-8"
                                      >
                                          <option value="" disabled>Select Specialty</option>
                                          {specialityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                      </select>
                                      <ChevronDown size={16} className="absolute right-0 top-2 text-slate-400 group-hover/select:text-[#00d0f1] transition-colors pointer-events-none"/>
                                  </div>
                              </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveSpecialty(spec.id)}
                            className="text-slate-400 font-bold text-xs hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                              <Trash2 size={16}/> Remove
                          </button>
                      </div>

                      {/* --- SERVICES --- */}
                      <div className="p-6">
                          <div className="space-y-3">
                              {spec.services.map((svc) => (
                                  <div key={svc.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-slate-100 rounded-2xl hover:border-[#00d0f1]/50 hover:shadow-md transition-all bg-white group/row relative">
                                      
                                      {/* Name with Auto-Suggest */}
                                      <div className="md:col-span-4 relative">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Service Name</label>
                                          <div className="relative">
                                              <Activity size={16} className="absolute top-3.5 left-3 text-slate-400 group-hover/row:text-[#00d0f1] transition-colors"/>
                                              <input 
                                                type="text" 
                                                placeholder="e.g. Consultation" 
                                                value={svc.name}
                                                onChange={(e) => handleServiceInputChange(spec.id, svc.id, e.target.value)}
                                                className="w-full pl-10 p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#00d0f1] transition-all" 
                                              />
                                          </div>

                                          {/* Suggestions Dropdown */}
                                          {activeSuggestion.specId === spec.id && activeSuggestion.svcId === svc.id && activeSuggestion.list.length > 0 && (
                                              <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl mt-2 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                                  <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                      <Sparkles size={10} className="text-[#00d0f1]"/> Suggested Services
                                                  </div>
                                                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                      {activeSuggestion.list.map((suggestion, idx) => (
                                                          <div 
                                                            key={idx}
                                                            onClick={() => handleSelectSuggestion(spec.id, svc.id, suggestion)}
                                                            className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#00d0f1] cursor-pointer transition-colors"
                                                          >
                                                              {suggestion}
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      {/* Price (RUPEE) */}
                                      <div className="md:col-span-3">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Price (INR)</label>
                                          <div className="relative">
                                              <IndianRupee size={16} className="absolute top-3.5 left-3 text-slate-400 group-hover/row:text-emerald-500 transition-colors"/>
                                              <input 
                                                type="number" 
                                                placeholder="0" 
                                                value={svc.price}
                                                onChange={(e) => handleUpdateService(spec.id, svc.id, 'price', e.target.value)}
                                                className="w-full pl-10 p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-black text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                                              />
                                          </div>
                                      </div>

                                      {/* Description */}
                                      <div className="md:col-span-4">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Description</label>
                                          <div className="relative">
                                              <FileText size={16} className="absolute top-3.5 left-3 text-slate-400"/>
                                              <input 
                                                type="text" 
                                                placeholder="Brief details..." 
                                                value={svc.description}
                                                onChange={(e) => handleUpdateService(spec.id, svc.id, 'description', e.target.value)}
                                                className="w-full pl-10 p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-medium text-slate-600 outline-none focus:bg-white focus:border-[#00d0f1] transition-all" 
                                              />
                                          </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="md:col-span-1 flex justify-center pt-5">
                                          <button 
                                            onClick={() => handleRemoveService(spec.id, svc.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                          >
                                              <Trash2 size={20}/>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <button 
                            onClick={() => handleAddService(spec.id)}
                            className="mt-4 py-3 px-6 rounded-xl text-[#00d0f1] font-bold text-sm bg-blue-50/50 hover:bg-[#00d0f1] hover:text-white transition-all flex items-center gap-2"
                          >
                              <Plus size={18}/> Add Service Row
                          </button>
                      </div>
                  </div>
              ))}

              {specialties.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <Stethoscope size={40} className="text-[#00d0f1]"/>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800">No Services Found</h3>
                      <p className="text-slate-400 text-sm mb-8 mt-2">Start by adding your first medical specialty to list services.</p>
                      <button onClick={handleAddSpecialty} className="bg-[#192a56] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg">
                          Add First Specialty
                      </button>
                  </div>
              )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default DoctorSpecialties;