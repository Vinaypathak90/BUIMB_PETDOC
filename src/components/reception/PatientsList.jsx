import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, LayoutGrid, List, MoreVertical, 
  Eye, CalendarClock, Phone, Loader2, AlertCircle 
} from 'lucide-react';
import NewPatientModal from './NewPatientModal';
import PatientProfileModal from './PatientProfileModal';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // =========================================================================
  // 1. FETCH PATIENTS FROM BACKEND
  // =========================================================================
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      if (!storedData) {
        setError("User not authenticated.");
        setIsLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/receptionist/patients', {
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });

      const data = await res.json();
      
      if (res.ok) {
        setPatients(data);
        setError(null);
      } else {
        setError(data.message || "Failed to load patients.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // =========================================================================
  // 2. ADD NEW PATIENT (Connects to Register API)
  // =========================================================================
  const handleAddNew = async (newPatientData) => {
    try {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      
      const res = await fetch('http://localhost:5000/api/receptionist/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedData.token}` 
        },
        body: JSON.stringify(newPatientData)
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh the list to show the new patient
        fetchPatients();
        setIsAddModalOpen(false);
        alert('Patient Registered Successfully!');
      } else {
        alert(data.message || "Failed to add patient.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  // =========================================================================
  // 3. FILTER LOGIC
  // =========================================================================
  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================================================================
  // 4. RENDER UI
  // =========================================================================

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin text-[#00d0f1] mb-2" size={40}/>
        <p className="text-xs font-bold uppercase tracking-widest">Loading Records...</p>
    </div>
  );

  if (error) return (
    <div className="h-96 flex flex-col items-center justify-center text-red-400">
        <AlertCircle size={40} className="mb-2"/>
        <p className="font-bold">{error}</p>
        <button onClick={fetchPatients} className="mt-4 text-xs underline">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- TOP BAR --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full xl:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
                type="text" 
                placeholder="Search by Name, Phone or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] transition-all"
            />
        </div>

        {/* Actions: View Toggle & Add Button */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#00d0f1]' : 'text-slate-400'}`}>
                    <List size={18}/>
                </button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-[#00d0f1]' : 'text-slate-400'}`}>
                    <LayoutGrid size={18}/>
                </button>
            </div>
            
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 xl:flex-none px-6 py-2.5 bg-[#1e293b] text-white rounded-xl font-bold text-sm hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                <Plus size={18}/> Add Patient
            </button>
        </div>
      </div>

      {/* --- PATIENT LIST VIEW --- */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Patient ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Last Visit</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPatients.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-bold">No patients found.</td></tr>
                        ) : (
                            filteredPatients.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">{p.patientId}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                {p.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{p.age} Yrs, {p.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{p.phone}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{p.lastVisit}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${p.type === 'pet' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {p.type || 'human'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {p.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedPatient(p)}
                                            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPatients.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-[#00d0f1] hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#1e293b] group-hover:bg-[#00d0f1] transition-colors"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-600 uppercase">
                            {p.name?.charAt(0)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {p.status || 'Active'}
                        </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg truncate">{p.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4">{p.patientId}</p>

                    <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Phone size={14} className="text-[#00d0f1]"/> {p.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <CalendarClock size={14} className="text-[#00d0f1]"/> Last: {p.lastVisit}
                        </div>
                    </div>

                    <button 
                        onClick={() => setSelectedPatient(p)}
                        className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-[#1e293b] hover:text-white transition-all flex justify-center gap-2"
                    >
                        <Eye size={14}/> View Profile
                    </button>
                </div>
            ))}
        </div>
      )}

      {/* --- MODALS --- */}
      <NewPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNew}
      />

      <PatientProfileModal 
        patient={selectedPatient} 
        onClose={() => setSelectedPatient(null)} 
      />

    </div>
  );
};

export default PatientsList;