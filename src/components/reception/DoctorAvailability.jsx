import React, { useState } from 'react';
import { 
  Search, Filter, Clock, MapPin, 
  MoreVertical, Phone, Video, 
  CheckCircle, XCircle, Coffee, Activity 
} from 'lucide-react';

const INITIAL_DOCTORS = [
  { id: 1, name: "Dr. Aditya Sharma", dept: "Cardiology", room: "204", status: "Busy", nextSlot: "11:45 AM", avatar: "AS", contact: "9876500001" },
  { id: 2, name: "Dr. Priya Varma", dept: "General", room: "101", status: "Available", nextSlot: "Now", avatar: "PV", contact: "9876500002" },
  { id: 3, name: "Dr. Sameer Khan", dept: "Orthopedics", room: "305", status: "Break", nextSlot: "01:00 PM", avatar: "SK", contact: "9876500003" },
  { id: 4, name: "Dr. Edalin Hendry", dept: "Dental", room: "104", status: "Available", nextSlot: "Now", avatar: "EH", contact: "9876500004" },
  { id: 5, name: "Dr. Rajesh Koothrapali", dept: "Veterinary", room: "Vet-A", status: "Off Duty", nextSlot: "Tomorrow", avatar: "RK", contact: "9876500005" },
  { id: 6, name: "Dr. Sarah Smith", dept: "Pediatrics", room: "202", status: "Busy", nextSlot: "12:15 PM", avatar: "SS", contact: "9876500006" },
];

const DoctorAvailability = () => {
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [filter, setFilter] = useState('All'); // All, Available, Busy
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIC: CHANGE STATUS ---
  const toggleStatus = (id) => {
    const statusCycle = ['Available', 'Busy', 'Break', 'Off Duty'];
    
    setDoctors(prevDocs => prevDocs.map(doc => {
      if (doc.id === id) {
        const currentIndex = statusCycle.indexOf(doc.status);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        
        // Auto-update next slot logic based on status
        let nextTime = doc.nextSlot;
        if (nextStatus === 'Available') nextTime = 'Now';
        if (nextStatus === 'Busy') nextTime = '45 mins';
        if (nextStatus === 'Break') nextTime = '1 Hour';
        if (nextStatus === 'Off Duty') nextTime = 'Tomorrow';

        return { ...doc, status: nextStatus, nextSlot: nextTime };
      }
      return doc;
    }));
  };

  // --- FILTERING ---
  const filteredDoctors = doctors.filter(doc => {
    const matchesFilter = filter === 'All' || doc.status === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.dept.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- HELPER: STATUS STYLES ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle };
      case 'Busy': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Activity };
      case 'Break': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: Coffee };
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => {
            const style = getStatusStyle(doc.status);
            const StatusIcon = style.icon;

            return (
                <div key={doc.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#00d0f1] transition-all group relative overflow-hidden">
                    
                    {/* Top Decorative Bar */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${style.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-500 border border-slate-200">
                                {doc.avatar}
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
                            onClick={() => toggleStatus(doc.id)}
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

      {filteredDoctors.length === 0 && (
          <div className="text-center py-20 text-slate-400">
              <p className="font-bold">No doctors found matching criteria.</p>
          </div>
      )}

    </div>
  );
};

export default DoctorAvailability;
