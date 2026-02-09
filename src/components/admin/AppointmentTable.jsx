import React, { useState } from 'react';
import { Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

const AppointmentTable = () => {
  // --- DYNAMIC STATE (Database Simulation) ---
  const [appointments, setAppointments] = useState([
    { 
      id: 1, 
      doctor: "Dr. Ruby Perrin", 
      speciality: "Dental", 
      petName: "Bruno", 
      owner: "Charlene Reed", 
      visitDate: "9 Nov 2023", 
      visitTime: "11.00 AM - 11.15 AM", 
      status: true, // true = Active, false = Inactive
      amount: "$200.00", 
      docImg: "https://randomuser.me/api/portraits/women/44.jpg",
      petImg: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 2, 
      doctor: "Dr. Darren Elder", 
      speciality: "Surgery", 
      petName: "Rocky", 
      owner: "Travis Trimble", 
      visitDate: "5 Nov 2023", 
      visitTime: "11.00 AM - 11.35 AM", 
      status: false, 
      amount: "$300.00", 
      docImg: "https://randomuser.me/api/portraits/men/32.jpg",
      petImg: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 3, 
      doctor: "Dr. Deborah Angel", 
      speciality: "Cardiology", 
      petName: "Milo", 
      owner: "Carl Kelly", 
      visitDate: "11 Nov 2023", 
      visitTime: "12.00 PM - 12.15 PM", 
      status: true, 
      amount: "$150.00", 
      docImg: "https://randomuser.me/api/portraits/women/68.jpg",
      petImg: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100"
    },
  ]);

  // --- ACTIONS (CONTROLS) ---
  
  // 1. Toggle Status Logic
  const toggleStatus = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: !apt.status } : apt
    ));
  };

  // 2. Delete Logic
  const deleteAppointment = (id) => {
    if(window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.filter(apt => apt.id !== id));
    }
  };

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
                    <img src={apt.docImg} alt={apt.doctor} className="w-10 h-10 rounded-full object-cover shadow-sm" />
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
                    <img src={apt.petImg} alt={apt.petName} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{apt.petName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Owner: {apt.owner}</p>
                    </div>
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-700">{apt.visitDate}</div>
                  <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
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
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        apt.status ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <p className="text-[10px] font-bold mt-1 text-slate-400">
                    {apt.status ? 'Active' : 'Inactive'}
                  </p>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
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
          <div className="p-8 text-center text-slate-400 font-medium">
            No appointments found in database.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentTable;