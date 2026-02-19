import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, Stethoscope, Wallet, 
  Plus, FileText, UserPlus, CalendarPlus, CheckSquare, 
  CheckCircle, XCircle, ChevronRight, Video, MapPin, 
  Trash2, AlertTriangle, Activity, Coffee, Loader2
} from 'lucide-react';
import NotificationsWidget from './NotificationsWidget'; 

// ==========================================
// 1. REUSABLE UI COMPONENTS
// ==========================================

const StatCard = ({ item }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group min-w-0">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-xl ${colors[item.color]} group-hover:scale-110 transition-transform`}>
          <item.icon size={22} />
        </div>
        <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Today</span>
      </div>
      <div>
        <h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{item.value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 truncate">{item.label}</p>
      </div>
    </div>
  );
};

// --- COMPACT DOCTOR LIST ITEM ---
const DoctorMiniItem = ({ doc, onToggle }) => {
  // Normalize status string (sometimes backend sends 'available', sometimes 'Available')
  const status = doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1).toLowerCase() : 'Unknown';

  const getStatusColor = (s) => {
    if(s === 'Available') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if(s === 'Busy') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#00d0f1] transition-all group">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200">
                    {doc.avatar || "D"}
                </div>
                {/* Online Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full flex items-center justify-center
                    ${status === 'Available' ? 'bg-emerald-500' : status === 'Busy' ? 'bg-amber-500' : 'bg-red-500'}
                `}>
                    {status === 'Busy' && <Activity size={8} className="text-white"/>}
                    {status === 'Break' && <Coffee size={8} className="text-white"/>}
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <MapPin size={8}/> Room {doc.room || 'N/A'} • {doc.dept || 'General'}
                </p>
            </div>
        </div>
        <button 
            onClick={() => onToggle(doc.id, status)}
            className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase transition-all active:scale-95 ${getStatusColor(status)}`}
        >
            {status}
        </button>
    </div>
  );
};

const AppointmentMiniCard = ({ appt, onCheckIn }) => {
  return (
    <div className="min-w-[280px] bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#00d0f1] transition-all flex flex-col gap-3 group animate-in zoom-in-95 duration-300">
       <div className="flex justify-between items-center">
          <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200">
             <Clock size={12} className="text-[#00d0f1]"/> {appt.time || '10:00 AM'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 
            ${appt.type?.toLowerCase() === 'online' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
             {appt.type?.toLowerCase() === 'online' ? <Video size={10}/> : <MapPin size={10}/>} {appt.type || 'Walk-in'}
          </span>
       </div>
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-sm">
            {appt.name ? appt.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm truncate w-32" title={appt.name}>{appt.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{appt.doctor}</p>
          </div>
       </div>
       <div className="mt-auto pt-2">
         {appt.status === 'Checked In' || appt.status === 'Checked-in' ? (
            <div className="w-full py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-green-100">
                <CheckCircle size={14}/> Checked In
            </div>
         ) : (
             <button onClick={() => onCheckIn(appt.id)} className="w-full py-2 bg-[#1e293b] text-white text-xs font-bold rounded-xl hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-lg">
                Check In Now <ChevronRight size={14}/>
             </button>
         )}
       </div>
    </div>
  );
};

const QuickActionBtn = ({ label, icon: Icon, color, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-all active:scale-95 border whitespace-nowrap ${color === 'blue' ? 'bg-[#1e293b] text-white border-[#1e293b] hover:bg-[#00d0f1] hover:text-[#1e293b] hover:border-[#00d0f1]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#00d0f1] hover:text-[#00d0f1]'}`}>
    <Icon size={16} strokeWidth={3} /> {label}
  </button>
);

const SmartQueueItem = ({ item }) => {
  const [waited, setWaited] = useState('0m');
  const [colorClass, setColorClass] = useState("bg-emerald-100 text-emerald-600");

  useEffect(() => {
    const updateTimer = () => {
        const now = Date.now();
        // Fallback to checking how long they have been in the queue if checkInTime is missing
        const startTime = item.checkInTime || now; 
        const diffMins = Math.floor((now - startTime) / 60000);
        
        setWaited(`${diffMins}m`);
        
        if (diffMins > 10) setColorClass("bg-yellow-100 text-yellow-600");
        if (diffMins > 25) setColorClass("bg-red-100 text-red-600");
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [item.checkInTime]);

  const isEmergency = item.priority === 'Emergency';

  return (
    <div className={`flex items-center justify-between p-3 mb-2 bg-white border rounded-2xl shadow-sm transition-all group animate-in slide-in-from-bottom-2 ${isEmergency ? 'border-red-200 shadow-red-50' : 'border-slate-100 hover:border-[#00d0f1]'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 border-2 ${isEmergency ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
          {item.token || "--"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
             <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
             {isEmergency && <AlertTriangle size={10} className="text-red-500 animate-pulse"/>}
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 truncate">
            {item.doctor}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${colorClass}`}>{waited}</span>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN DASHBOARD COMPONENT
// ==========================================

const DashboardHome = ({ onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({ total: 0, waiting: 0, doctors: 0, cancelled: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // --- HELPER: GET TOKEN ---
  const getToken = () => {
    const stored = localStorage.getItem('user_token');
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        return parsed.token || parsed;
    } catch(e) {
        return stored;
    }
  };

  // --- 1. FETCH DASHBOARD DATA ---
  const fetchDashboardData = async () => {
    try {
        const token = getToken();
        if(!token) {
            console.error("No token found");
            setIsLoading(false);
            return;
        }

        const res = await fetch('http://localhost:5000/api/receptionist/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
            setAppointments(data.appointments || []);
            setDoctors(data.doctors || []);
            setStats(data.stats || { total: 0, waiting: 0, doctors: 0, cancelled: 0, revenue: 0 });
        } else {
            console.error("Dashboard error:", data.message);
        }
    } catch (err) {
        console.error("Failed to load dashboard data", err);
    } finally {
        setIsLoading(false);
    }
  };

  // Load data on mount and poll every 15 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); 
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  // Check In Appointment
  const handleCheckIn = async (id) => {
    try {
        const token = getToken();
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Checked In', checkInTime: Date.now() } : a));

        const res = await fetch(`http://localhost:5000/api/receptionist/dashboard/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Checked In', checkInTime: Date.now() })
        });
        
        if (!res.ok) fetchDashboardData(); // Revert if failed
    } catch (err) {
        alert("Failed to check in.");
        fetchDashboardData();
    }
  };

  // Delete Appointment
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
        try {
            const token = getToken();
            // Optimistic update
            setAppointments(prev => prev.filter(a => a.id !== id));

            const res = await fetch(`http://localhost:5000/api/receptionist/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) fetchDashboardData(); // Revert if failed
        } catch (err) {
            alert("Failed to delete.");
            fetchDashboardData();
        }
    }
  };

  // Toggle Doctor Status
  const toggleDoctorStatus = async (id, currentStatus) => {
    try {
        const token = getToken();
        const cycle = ['Available', 'Busy', 'Break'];
        const nextStatus = cycle[(cycle.indexOf(currentStatus) + 1) % cycle.length];

        // Optimistic update
        setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, status: nextStatus } : doc));

        const res = await fetch(`http://localhost:5000/api/receptionist/dashboard/doctors/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nextStatus })
        });
        
        if (!res.ok) fetchDashboardData(); // Revert if failed
    } catch (err) {
        console.error("Status update failed");
        fetchDashboardData();
    }
  };

  // --- DERIVED DATA ---
  // Active appointments for the top scrollable row
  const activeAppointments = appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed');
  
  // Waiting queue sorting logic (Emergency first, then by check-in time)
  const waitingQueue = appointments
    .filter(a => a.status === 'Waiting' || a.status === 'Checked In' || a.status === 'Checked-in')
    .sort((a, b) => {
        if (a.priority === 'Emergency' && b.priority !== 'Emergency') return -1;
        if (a.priority !== 'Emergency' && b.priority === 'Emergency') return 1;
        return (a.checkInTime || 0) - (b.checkInTime || 0);
    });

  // Loader
  if (isLoading) {
      return (
          <div className="flex h-[calc(100vh-100px)] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                 <Loader2 className="animate-spin text-[#00d0f1]" size={40}/>
                 <p className="text-slate-500 font-bold text-sm">Syncing Live Data...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-[100vw] overflow-x-hidden">
      
      {/* 1. HEADER */}
      <div className="flex flex-col xl:flex-row gap-6 items-start justify-between">
        <div className="w-full xl:w-auto flex gap-3 overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
            <QuickActionBtn label="New Registration" icon={UserPlus} color="blue" onClick={() => onNavigate('walkin')} />
            <QuickActionBtn label="Book Appointment" icon={CalendarPlus} color="white" onClick={() => onNavigate('appointments')} />
            <QuickActionBtn label="Add Walk-in" icon={Plus} color="white" onClick={() => onNavigate('walkin')} />
        </div>
        <div className="flex gap-2 self-end xl:self-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                <Calendar size={14}/> {new Date().toLocaleDateString()}
            </button>
        </div>
      </div>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard item={{ label: "Today's Total", value: stats.total, icon: Calendar, color: "blue" }} />
        <StatCard item={{ label: "Waiting Queue", value: stats.waiting, icon: Clock, color: "orange" }} />
        <StatCard item={{ label: "Doctors Active", value: stats.doctors, icon: Stethoscope, color: "emerald" }} />
        <StatCard item={{ label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "red" }} />
        <StatCard item={{ label: "Net Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: Wallet, color: "purple" }} />
      </div>

      {/* 3. TODAY'S SCHEDULE */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <CalendarPlus className="text-[#00d0f1]"/> Today's Schedule
            </h3>
            <button onClick={() => onNavigate('appointments')} className="text-xs font-bold text-slate-500 hover:text-[#00d0f1] flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14}/>
            </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {activeAppointments.length === 0 ? (
                <div className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                    <p className="font-bold text-sm">No scheduled appointments for today.</p>
                    <button onClick={() => onNavigate('appointments')} className="text-xs text-[#00d0f1] font-bold mt-2 hover:underline">Book Now</button>
                </div>
            ) : (
                activeAppointments.map((appt) => (
                    <AppointmentMiniCard key={appt.id} appt={appt} onCheckIn={handleCheckIn} />
                ))
            )}
        </div>
      </div>

      {/* 4. MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* LEFT: TABLE */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <Users size={20} className="text-blue-500"/> Recent Patients
                </h3>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {appointments.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-400 font-bold text-sm">No records found for today.</td></tr>
                        )}
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 text-sm font-bold text-slate-500">
                                    <div className="flex items-center gap-2 bg-slate-100 w-fit px-2 py-1 rounded-lg"><Clock size={12}/> {appt.time}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-800">{appt.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{appt.type || 'Walk-in'}</p>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600">{appt.doctor}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border 
                                        ${(appt.status === 'Checked In' || appt.status === 'Checked-in' || appt.status === 'Completed') 
                                            ? 'bg-green-100 text-green-700 border-green-200' 
                                            : (appt.status === 'Cancelled' || appt.status === 'No-Show') 
                                                ? 'bg-red-100 text-red-700 border-red-200' 
                                                : 'bg-orange-100 text-orange-600 border-orange-200'}`}
                                    >
                                        {appt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleCheckIn(appt.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100" title="Check In"><CheckSquare size={16}/></button>
                                        <button onClick={() => handleDelete(appt.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100" title="Delete"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="xl:col-span-1 space-y-6">
            
            {/* A. Live Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col h-[350px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-orange-500"/> Waiting Queue
                    </h3>
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">{stats.waiting}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {waitingQueue.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Clock size={32} className="opacity-20 mb-2"/>
                            <p className="text-xs font-bold">Queue is empty</p>
                        </div>
                    ) : (
                        waitingQueue.map((item) => <SmartQueueItem key={item.id} item={item} />)
                    )}
                </div>
            </div>

            {/* B. Doctor Availability */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Stethoscope size={18} className="text-emerald-500"/> Active Doctors
                    </h3>
                    <button onClick={() => onNavigate('doctors')} className="text-slate-400 hover:text-[#00d0f1]"><ChevronRight size={18}/></button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {doctors.length === 0 ? (
                         <div className="text-center text-slate-400 text-xs py-4 font-bold">No active doctors</div>
                    ) : (
                        doctors.map(doc => (
                            <DoctorMiniItem key={doc.id} doc={doc} onToggle={toggleDoctorStatus} />
                        ))
                    )}
                </div>
            </div>

            {/* C. Notifications Widget */}
            <div className="h-[300px]">
                <NotificationsWidget />
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome; 