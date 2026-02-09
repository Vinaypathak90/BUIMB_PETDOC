import React, { useState, useEffect } from 'react';
import { 
  Clock, User, MoreVertical, LayoutGrid, List, 
  Stethoscope, AlertCircle, ArrowRightCircle 
} from 'lucide-react';

const LiveQueueSnapshot = ({ queueData, onUpdateStatus }) => {
  const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'
  const [now, setNow] = useState(Date.now());

  // --- 1. REAL-TIME CLOCK (Updates every 30s) ---
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. SORTING LOGIC (Emergency First) ---
  // Emergency patients always on top, then sort by CheckIn Time
  const sortedQueue = [...queueData].sort((a, b) => {
    if (a.priority === 'Emergency' && b.priority !== 'Emergency') return -1;
    if (a.priority !== 'Emergency' && b.priority === 'Emergency') return 1;
    return a.checkInTime - b.checkInTime; // Oldest first
  });

  // --- 3. HELPER: CALCULATE WAIT TIME & COLOR ---
  const getWaitDetails = (checkInTime) => {
    const diffMins = Math.floor((now - checkInTime) / 60000);
    let colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200"; // < 10 mins
    
    if (diffMins > 10 && diffMins <= 25) colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200"; // 10-25 mins
    if (diffMins > 25) colorClass = "bg-red-100 text-red-700 border-red-200"; // > 25 mins

    return { time: `${diffMins} min`, colorClass };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2">
                Live Queue Snapshot 
                <span className="bg-[#1e293b] text-white text-[10px] px-2 py-0.5 rounded-full">{sortedQueue.length}</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Real-time Patient Flow</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-[#00d0f1]' : 'text-slate-400'}`}><List size={16}/></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-[#00d0f1]' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
        </div>
      </div>

      {/* QUEUE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
        
        {sortedQueue.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <Clock size={32} className="opacity-20 mb-2"/>
                <p className="text-xs font-bold">Queue is empty.</p>
            </div>
        ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
                
                {sortedQueue.map((patient) => {
                    const { time, colorClass } = getWaitDetails(patient.checkInTime);
                    const isEmergency = patient.priority === 'Emergency';

                    return (
                        <div 
                            key={patient.id} 
                            className={`bg-white border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all group relative overflow-hidden
                                ${isEmergency ? 'border-red-200 shadow-red-100' : 'border-slate-100 hover:border-[#00d0f1]'}
                            `}
                        >
                            {/* Emergency Strip */}
                            {isEmergency && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Token */}
                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm border-2 shrink-0
                                        ${isEmergency ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-200'}
                                    `}>
                                        <span className="text-[8px] uppercase opacity-60">Token</span>
                                        {patient.token}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{patient.name}</h4>
                                            {isEmergency && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded animate-pulse">EMERGENCY</span>}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 truncate">
                                            <Stethoscope size={10}/> {patient.doctor}
                                        </p>
                                    </div>
                                </div>

                                {/* Timer & Action */}
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${colorClass} flex items-center gap-1`}>
                                        <Clock size={10}/> {time}
                                    </span>
                                    
                                    <button 
                                        onClick={() => onUpdateStatus(patient.id, 'With Doctor')}
                                        className="text-[10px] font-bold text-slate-400 hover:text-[#00d0f1] flex items-center gap-1 mt-1 group-hover:translate-x-0 transition-transform"
                                        title="Send to Doctor"
                                    >
                                        Send In <ArrowRightCircle size={14}/>
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
  );
};

export default LiveQueueSnapshot;
