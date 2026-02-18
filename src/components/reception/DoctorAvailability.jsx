import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Clock, MapPin, 
  MoreVertical, Phone, Video, 
  CheckCircle, XCircle, Coffee, Activity, Loader2 
} from 'lucide-react';

const DoctorAvailability = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('All'); // All, Available, Busy
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================================
  // 1. API CALL: FETCH DOCTORS
  // =========================================================================
  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      // Construct Query String based on filters
      let query = '?';
      if (filter !== 'All') query += `status=${filter.toLowerCase()}&`;
      if (searchTerm) query += `search=${searchTerm}`;

      const res = await fetch(`http://localhost:5000/api/receptionist/doctors-status${query}`, {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed to load doctors list", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when filters or search term changes
  useEffect(() => {
    // Debounce search to prevent too many API calls
    const timeoutId = setTimeout(() => {
        fetchDoctors();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filter, searchTerm]);


  // =========================================================================
  // 2. API CALL: TOGGLE STATUS
  // =========================================================================
  const toggleStatus = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      const res = await fetch(`http://localhost:5000/api/receptionist/doctors/${id}/status`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const updatedDoc = await res.json();
        // Optimistic UI Update: Update only the specific doctor in the list
        setDoctors(prev => prev.map(doc => doc._id === id ? updatedDoc : doc));
      } else {
        alert("Status update failed.");
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  // --- HELPER: STATUS STYLES ---
  const getStatusStyle = (status) => {
    // Normalize status string just in case
    const s = status?.toLowerCase();
    switch (s) {
      case 'available': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle };
      case 'busy': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Activity };
      case 'break': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: Coffee };
      case 'off duty': return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', icon: XCircle };
      default: return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- TOP BAR --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-4 w-full xl:w-auto">
            {/* Search */}
            <div className="relative flex-1 xl:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Search Doctor or Dept..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                />
            </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 no-scrollbar">
            {['All', 'Available', 'Busy', 'Break'].map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap border
                        ${filter === f 
                            ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-lg' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                    `}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* --- DOCTORS GRID --- */}
      {isLoading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-slate-400" size={40}/>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {doctors.map((doc) => {
                const style = getStatusStyle(doc.status);
                const StatusIcon = style.icon;

                return (
                    <div key={doc._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#00d0f1] transition-all group relative overflow-hidden">
                        
                        {/* Top Decorative Bar */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${style.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar / Image */}
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-500 border border-slate-200 overflow-hidden">
                                    {doc.avatar && doc.avatar.startsWith('http') ? (
                                        <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover"/>
                                    ) : (
                                        <span>{doc.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{doc.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase">{doc.dept}</p>
                                </div>
                            </div>
                            <button className="text-slate-300 hover:text-[#00d0f1]"><MoreVertical size={20}/></button>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <MapPin size={10}/> Room
                                </p>
                                <p className="text-sm font-black text-slate-700">{doc.room}</p>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Clock size={10}/> Next Slot
                                </p>
                                <p className="text-sm font-black text-[#00d0f1]">{doc.nextSlot}</p>
                            </div>
                        </div>

                        {/* Status Toggle & Actions */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => toggleStatus(doc._id)}
                                className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase border transition-all active:scale-95
                                    ${style.bg} ${style.text} ${style.border}
                                `}
                            >
                                <StatusIcon size={14}/> {doc.status}
                            </button>
                            
                            <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200">
                                <Phone size={18}/>
                            </button>
                            <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors border border-slate-200">
                                <Video size={18}/>
                            </button>
                        </div>

                    </div>
                );
            })}
          </div>
      )}

      {!isLoading && doctors.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="font-bold text-sm">No doctors found matching your criteria.</p>
          </div>
      )}

    </div>
  );
};

export default DoctorAvailability;