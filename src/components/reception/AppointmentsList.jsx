import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, MoreVertical, 
  CheckCircle, XCircle, Plus, Loader2, AlertCircle, List 
} from 'lucide-react';
import NewAppointmentModal from './NewAppointmentModal';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  // Default to Today, but can be empty string '' for "Show All"
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================================
  // 1. API CALL: FETCH APPOINTMENTS
  // =========================================================================
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      if (!userData || !userData.token) {
        setError("Session expired. Please login again.");
        return;
      }

      // ✅ Logic: If filterDate exists, send ?date=YYYY-MM-DD. If empty, send nothing (fetch all).
      const queryParams = filterDate ? `?date=${filterDate}` : '';
      
      const res = await fetch(`http://localhost:5000/api/receptionist/appointments${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        setAppointments(data);
      } else {
        setError(data.message || "Failed to fetch appointments.");
      }
    } catch (err) {
      setError("Network Error: Is the backend running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // 2. API CALL: FETCH DOCTORS LIST (For Modal)
  // =========================================================================
  const fetchDoctors = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      const res = await fetch('http://localhost:5000/api/receptionist/doctors', {
        headers: { 
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data); 
      }
    } catch (err) {
      console.error("Failed to load doctors list", err);
    }
  };

  // Trigger fetch when filterDate changes
  useEffect(() => {
    fetchAppointments();
  }, [filterDate]);

  // Trigger fetch doctors once on load
  useEffect(() => {
    fetchDoctors(); 
  }, []);

  // =========================================================================
  // 3. API ACTIONS (Update Status & Book)
  // =========================================================================
  const handleStatusChange = async (id, newStatus) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      const res = await fetch(`http://localhost:5000/api/receptionist/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Optimistic UI Update
        setAppointments(prev => prev.map(app => 
          app._id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const handleNewBooking = async (newApptData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      const res = await fetch('http://localhost:5000/api/receptionist/appointments', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApptData)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        // Refresh logic: If "Show All" is active OR booking date matches filter date
        if (!filterDate || newApptData.date === filterDate) {
          fetchAppointments();
        } else {
          alert("Appointment booked! Switch date to view it.");
        }
      } else {
        alert(data.message || "Booking Failed.");
      }
    } catch (err) {
      alert("Server Error during booking.");
    }
  };

  // =========================================================================
  // 4. FILTERS & UI HELPERS
  // =========================================================================
  const filteredList = appointments.filter(app => {
    const matchStatus = statusFilter === 'All' || app.status === statusFilter;
    // Check against patient name OR phone number
    const matchSearch = (app.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                        (app.phone || '').includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'Waiting': 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'Checked-in': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'Scheduled': 'bg-blue-50 text-blue-600 border-blue-200',
      'With Doctor': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      'Cancelled': 'bg-red-50 text-red-600 border-red-200',
      'Completed': 'bg-slate-50 text-slate-500 border-slate-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles['Waiting']}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOP BAR: FILTERS --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {/* ✅ Show All Button: Clears the date filter */}
            <button 
              onClick={() => setFilterDate('')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${filterDate === '' ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
              title="Show All History"
            >
              <List size={16}/> All
            </button>

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

            {/* Status Filter */}
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] appearance-none"
                >
                    <option>All Status</option>
                    <option>Waiting</option>
                    <option>Checked-in</option>
                    <option>With Doctor</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                </select>
            </div>

            {/* Search Input */}
            <div className="relative grow xl:grow-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Search Patient..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full xl:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                />
            </div>
        </div>

        {/* Add Button */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full xl:w-auto px-6 py-2.5 bg-[#1e293b] text-white rounded-xl font-bold text-sm hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
            <Plus size={18}/> Book Appointment
        </button>
      </div>

      {/* --- APPOINTMENT TABLE --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-xs font-black uppercase tracking-widest">Loading Schedule...</p>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-400 p-6 text-center">
                <AlertCircle size={32} className="mb-2" />
                <p className="font-bold">{error}</p>
                <button onClick={fetchAppointments} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-xs font-black uppercase text-slate-600 hover:bg-slate-200">Retry Fetch</button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                        <tr>
                            {/* ✅ Updated Column for Date & Time */}
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Patient Details</th>
                            <th className="px-6 py-4">Assigned Doctor</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold">
                                    No records found {filterDate ? `for ${filterDate}` : 'in history'}.
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        {/* ✅ Display Date AND Time */}
                                        <div className="font-bold text-slate-700 text-sm">{app.date}</div>
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <Clock size={12}/> {app.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                {app.patientName?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{app.phone || app.contact}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {app.doctorName || app.doctor}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <span className="bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{app.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            
                                            {/* Check-In */}
                                            {(app.status === 'Waiting' || app.status === 'Scheduled') && (
                                                <button 
                                                    onClick={() => handleStatusChange(app._id, 'Checked-in')}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm"
                                                    title="Check In"
                                                >
                                                    <CheckCircle size={16}/>
                                                </button>
                                            )}
                                            
                                            {/* Cancel */}
                                            {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                                                <button 
                                                    onClick={() => handleStatusChange(app._id, 'Cancelled')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                                                    title="Cancel"
                                                >
                                                    <XCircle size={16}/>
                                                </button>
                                            )}

                                            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-[#00d0f1] border border-slate-100">
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
        )}
      </div>

      {/* --- BOOKING MODAL (Pass Real Doctors) --- */}
      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleNewBooking}
        doctorsList={doctors}  // ✅ Passing real list
      />

    </div>
  );
};

export default AppointmentsList;