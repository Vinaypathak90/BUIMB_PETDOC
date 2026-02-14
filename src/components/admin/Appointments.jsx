import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Loader2 } from 'lucide-react';

const Appointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle Logic for Mobile Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --- 1. FETCH APPOINTMENTS FROM API ---
  const fetchAppointments = async () => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    if (!storedData || !storedData.token) {
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { 
            'Authorization': `Bearer ${storedData.token}`,
            'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        // Transform Backend Data to Frontend Format
        const formattedData = data.map(app => ({
            id: app._id,
            doctorName: app.doctorName,
            speciality: app.speciality || 'General',
            patientName: app.patientName,
            date: app.date,
            time: app.time,
            // Status Logic: 'Scheduled' is Active (true), others are Inactive (false)
            status: app.status === 'Scheduled', 
            // Handle Fee/Amount mapping
            amount: app.fee ? `₹${app.fee}` : 'Paid',
            // Default Images if missing
            docImg: app.doctorImg || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            patImg: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png" 
        }));

        setAppointments(formattedData);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- 2. TOGGLE STATUS HANDLER ---
  const toggleStatus = async (id) => {
    // Optimistic UI Update (Change UI instantly before Server responds)
    const originalAppointments = [...appointments];
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: !apt.status } : apt
    ));

    const storedData = JSON.parse(localStorage.getItem('user_token'));

    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      alert("Error updating status");
      setAppointments(originalAppointments); // Revert changes if API fails
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <main className="pt-24 px-8 pb-12">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
            <ul className="flex gap-2 text-sm text-slate-500 mt-1">
              <li className="hover:text-emerald-600 cursor-pointer">Dashboard</li>
              <li>/</li>
              <li className="text-slate-400">Appointments</li>
            </ul>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Appointment List</h2>
                {appointments.length > 0 && (
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
                        {appointments.length} Records
                    </span>
                )}
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-64">
                      <Loader2 className="animate-spin text-blue-900" size={40} />
                      <p className="text-slate-400 text-sm font-bold mt-3">Loading Appointments...</p>
                  </div>
              ) : appointments.length === 0 ? (
                  <div className="text-center py-16">
                      <p className="text-slate-400 font-bold text-lg">No appointments found.</p>
                  </div>
              ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Doctor Name</th>
                        <th className="px-6 py-4">Speciality</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Appointment Time</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {appointments.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* Doctor */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.docImg} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                              <span className="font-semibold text-slate-700">{item.doctorName}</span>
                            </div>
                          </td>

                          {/* Speciality */}
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {item.speciality}
                          </td>

                          {/* Patient */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.patImg} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                              <span className="font-semibold text-slate-700">{item.patientName}</span>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{item.date}</div>
                            <div className="text-[#00d0f1] font-bold text-xs mt-1">{item.time}</div>
                          </td>

                          {/* Status Toggle Switch */}
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => toggleStatus(item.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                item.status ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                                  item.status ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <div className={`text-[10px] font-bold mt-1 uppercase ${item.status ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {item.status ? 'Active' : 'Cancelled'}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right font-bold text-slate-700">
                            {item.amount}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
            </div>
            
            {/* Pagination (Visual Only for now) */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold">Showing {appointments.length} entries</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded text-xs hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 bg-emerald-500 text-white rounded text-xs shadow-md">1</button>
                    <button className="px-3 py-1 border rounded text-xs hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"></div>
      )}
    </div>
  );
};

export default Appointments;