import React, { useState, useEffect } from 'react';
import { 
  Clock, User, LayoutGrid, List, 
  Stethoscope, ArrowRightCircle, Loader2, PlayCircle 
} from 'lucide-react';

const LiveQueueSnapshot = () => {
  const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'
  const [queueData, setQueueData] = useState([]); // Waiting patients
  const [currentPatient, setCurrentPatient] = useState(null); // Patient with doctor
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now()); // For wait time calculation

  // =========================================================================
  // 1. API CALL: FETCH LIVE QUEUE DATA
  // =========================================================================
  const fetchLiveQueue = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      if (!userData?.token) return;

      const res = await fetch('http://localhost:5000/api/receptionist/live-queue', {
        headers: { 'Authorization': `Bearer ${userData.token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setCurrentPatient(data.current); // Object or null
        setQueueData(data.queue || []);  // Array
      }
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll data every 15 seconds to keep it "Live"
  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 15000); 
    return () => clearInterval(interval);
  }, []);

  // Update Clock for "Wait Time" ticker every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // =========================================================================
  // 2. ACTION: SEND PATIENT TO DOCTOR
  // =========================================================================
  const sendToDoctor = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      
      // Update status to 'With Doctor'
      const res = await fetch(`http://localhost:5000/api/receptionist/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'With Doctor' })
      });
      
      if (res.ok) {
        // Refresh queue immediately to reflect changes
        fetchLiveQueue(); 
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  // =========================================================================
  // 3. HELPER: WAIT TIME LOGIC
  // =========================================================================
  const getWaitDetails = (timeString) => {
    if (!timeString) return { diff: '--', color: '' };

    // Parse "10:30" or ISO String
    let apptTime = new Date();
    if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        apptTime.setHours(hours, minutes, 0);
    } else {
        apptTime = new Date(timeString);
    }
    
    const diffMins = Math.floor((now - apptTime) / 60000);
    
    let color = "bg-emerald-50 text-emerald-700 border-emerald-100"; // < 15 mins
    if (diffMins > 15) color = "bg-yellow-50 text-yellow-700 border-yellow-100"; // > 15 mins
    if (diffMins > 45) color = "bg-red-50 text-red-700 border-red-100"; // > 45 mins

    return { 
        diff: diffMins > 0 ? `${diffMins} min wait` : 'Just Arrived', 
        color 
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* --- HEADER --- */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2">
                Live Queue 
                <span className="bg-[#1e293b] text-white text-[10px] px-2 py-0.5 rounded-full">{queueData.length}</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Real-time Flow</p>
        </div>
        {/* View Toggle */}
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-[#00d0f1]' : 'text-slate-400'}`}><List size={16}/></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-[#00d0f1]' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-4 space-y-4">
        
        {/* --- SECTION 1: CURRENTLY WITH DOCTOR --- */}
        {currentPatient ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform"><Stethoscope size={120}/></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> Now Serving
                        </span>
                        <span className="text-2xl font-black opacity-90">{currentPatient.time}</span>
                    </div>
                    
                    <h2 className="text-2xl font-black tracking-tight">{currentPatient.patientName}</h2>
                    
                    <div className="flex items-center gap-2 mt-2 opacity-90 text-sm font-medium">
                        <User size={14}/> {currentPatient.doctorName}
                    </div>
                </div>
            </div>
        ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase">Doctor is available / Room Empty</p>
            </div>
        )}

        {/* --- SECTION 2: WAITING LIST --- */}
        <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Up Next ({queueData.length})</h4>
            
            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300"/></div>
            ) : queueData.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Clock size={28} className="opacity-20 mb-2"/>
                    <p className="text-xs font-bold">Queue is empty.</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
                    {queueData.map((patient, index) => {
                        const { diff, color } = getWaitDetails(patient.time);
                        const isEmergency = patient.type === 'Emergency';

                        return (
                            <div 
                                key={patient._id} 
                                className={`bg-white border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all group relative overflow-hidden 
                                    ${isEmergency ? 'border-red-200 bg-red-50/10' : 'border-slate-100 hover:border-[#00d0f1]'}
                                `}
                            >
                                {/* Emergency Indicator */}
                                {isEmergency && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Queue Number */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border
                                            ${isEmergency ? 'bg-red-100 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        
                                        {/* Patient Info */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800 text-sm truncate">{patient.patientName}</h4>
                                                {isEmergency && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded">URGENT</span>}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                {patient.doctorName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action & Time */}
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${color} flex items-center gap-1`}>
                                            <Clock size={10}/> {diff}
                                        </span>
                                        
                                        <button 
                                            onClick={() => sendToDoctor(patient._id)}
                                            className="text-[10px] font-bold text-white bg-[#1e293b] px-3 py-1.5 rounded-lg hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center gap-1 shadow-sm mt-1 active:scale-95"
                                        >
                                            Send In <PlayCircle size={10} fill="currentColor"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default LiveQueueSnapshot;