import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH APPOINTMENTS FROM API ---
  useEffect(() => {
    const fetchAppointments = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      if (!storedData) return;

      try {
        const res = await fetch('http://localhost:5000/api/admin/appointments', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        const data = await res.json();

        if (res.ok) {
          // Transform Backend Data to Frontend Format
          const formattedData = data.map(app => ({
            id: app._id,
            doctor: app.doctorName,
            speciality: app.speciality,
            petName: app.petName || app.patientName, // Handle generic patient names
            owner: app.patientName, // Assuming owner is patient for now
            visitDate: app.date,
            visitTime: app.time,
            status: app.status === 'Scheduled', // True = Scheduled, False = Cancelled
            amount: typeof app.amount === 'number' ? `$${app.amount}` : app.amount,
            docImg: app.doctorImg || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            petImg: app.patImg || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"
          }));
          setAppointments(formattedData);
        }
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // --- 2. TOGGLE STATUS (API) ---
  const toggleStatus = async (id) => {
    // Optimistic UI Update
    const originalState = [...appointments];
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: !apt.status } : apt
    ));

    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      alert("Error updating status");
      setAppointments(originalState); // Revert on failure
    }
  };

  // --- 3. DELETE APPOINTMENT (API) ---
  const deleteAppointment = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this appointment permanently?")) return;

    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });

      if (res.ok) {
        setAppointments(appointments.filter(apt => apt.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-12 bg-white rounded-[20px] border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-[#192a56]" size={40} />
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Appointment List</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Total: {appointments.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Doctor Name</th>
              <th className="px-6 py-4">Speciality</th>
              <th className="px-6 py-4">Pet Name (Owner)</th>
              <th className="px-6 py-4">Appointment Time</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                
                {/* Doctor Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={apt.docImg} alt={apt.doctor} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                    <span className="text-sm font-bold text-slate-800">{apt.doctor}</span>
                  </div>
                </td>

                {/* Speciality */}
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  {apt.speciality}
                </td>

                {/* Pet Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={apt.petImg} alt={apt.petName} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{apt.petName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Owner: {apt.owner}</p>
                    </div>
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-700">{apt.visitDate}</div>
                  <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {apt.visitTime}
                  </div>
                </td>

                {/* Dynamic Status Toggle */}
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleStatus(apt.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      apt.status ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        apt.status ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <p className={`text-[10px] font-bold mt-1 uppercase ${apt.status ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {apt.status ? 'Active' : 'Cancelled'}
                  </p>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-sm font-black text-slate-700">
                  {apt.amount}
                </td>

                {/* Actions (Delete) */}
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteAppointment(apt.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Delete Appointment"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State Check */}
        {appointments.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Clock size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No appointments found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentTable;