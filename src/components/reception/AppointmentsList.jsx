import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, MoreVertical, 
  CheckCircle, XCircle, RefreshCw, Plus, User 
} from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('reception_data')) || [];
    // Ensure we only show items that have a 'date' field (appointments)
    // or fallback to today's date if missing (for legacy data compatibility)
    setAppointments(storedData);
  }, []);

  // --- 2. SAVE DATA HELPER ---
  const updateStorage = (newData) => {
    setAppointments(newData);
    localStorage.setItem('reception_data', JSON.stringify(newData));
  };

  // --- 3. ACTIONS ---
  const handleStatusChange = (id, newStatus) => {
    const updated = appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    updateStorage(updated);
  };

  const handleNewBooking = (newAppt) => {
    const updated = [newAppt, ...appointments];
    updateStorage(updated);
  };

  // --- 4. FILTER LOGIC ---
  const filteredList = appointments.filter(app => {
    const matchDate = app.date === filterDate;
    const matchStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        app.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDate && matchStatus && matchSearch;
  });

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const styles = {
      'Waiting': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Checked-in': 'bg-green-100 text-green-700 border-green-200',
      'With Doctor': 'bg-blue-100 text-blue-700 border-blue-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
      'Completed': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles['Waiting']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- TOP BAR: ACTIONS & FILTERS --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Left: Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {/* Date Picker */}
            <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] appearance-none"
                >
                    <option>All</option>
                    <option>Waiting</option>
                    <option>Checked-in</option>
                    <option>With Doctor</option>
                    <option>Cancelled</option>
                </select>
            </div>

            {/* Search */}
            <div className="relative grow xl:grow-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Search Name / ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full xl:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                />
            </div>
        </div>

        {/* Right: Add Button */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full xl:w-auto px-6 py-2.5 bg-[#1e293b] text-white rounded-xl font-bold text-sm hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
            <Plus size={18}/> Book Appointment
        </button>
      </div>

      {/* --- CENTER: APPOINTMENT LIST --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Patient Info</th>
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredList.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar size={40} className="opacity-20"/>
                                    <p className="font-bold text-sm">No appointments found for this date.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredList.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
                                        <Clock size={14} className="text-[#00d0f1]"/> {app.time || '--:--'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                            {app.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{app.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{app.id} • {app.contact}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                    {app.doctor}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {app.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(app.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                        {/* Check-In Action */}
                                        {app.status === 'Waiting' && (
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'Checked-in')}
                                                title="Check In Patient"
                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                        )}
                                        
                                        {/* Cancel Action */}
                                        {app.status !== 'Cancelled' && (
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'Cancelled')}
                                                title="Cancel Appointment"
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        )}

                                        {/* Reschedule / View (Mock) */}
                                        <button className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 border border-slate-200">
                                            <MoreVertical size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL FOR NEW BOOKING --- */}
      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleNewBooking}
      />

    </div>
  );
};

export default AppointmentsList;
