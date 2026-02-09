import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { Clock, Eye, Trash2 } from 'lucide-react';

const Appointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --- DUMMY DATA (State for Toggles) ---
  const [appointments, setAppointments] = useState([
    { 
      id: 1, 
      doctor: "Dr. Ruby Perrin", 
      speciality: "Dental", 
      patient: "Bruno (Dog)", 
      visitDate: "9 Nov 2026", 
      visitTime: "11.00 AM - 11.15 AM", 
      status: true, 
      amount: "$200.00", 
      docImg: "https://randomuser.me/api/portraits/women/44.jpg",
      patImg: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 2, 
      doctor: "Dr. Darren Elder", 
      speciality: "Surgery", 
      patient: "Rocky (Dog)", 
      visitDate: "5 Nov 2026", 
      visitTime: "11.00 AM - 11.35 AM", 
      status: false, 
      amount: "$300.00", 
      docImg: "https://randomuser.me/api/portraits/men/32.jpg",
      patImg: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 3, 
      doctor: "Dr. Deborah Angel", 
      speciality: "Cardiology", 
      patient: "Milo (Cat)", 
      visitDate: "11 Nov 2026", 
      visitTime: "12.00 PM - 12.15 PM", 
      status: true, 
      amount: "$150.00", 
      docImg: "https://randomuser.me/api/portraits/women/68.jpg",
      patImg: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 4, 
      doctor: "Dr. Sofia Brient", 
      speciality: "Urology", 
      patient: "Coco (Parrot)", 
      visitDate: "7 Nov 2026", 
      visitTime: "1.00 PM - 1.20 PM", 
      status: true, 
      amount: "$150.00", 
      docImg: "https://randomuser.me/api/portraits/women/65.jpg",
      patImg: "https://images.unsplash.com/photo-1552728089-57bdde30ebd1?auto=format&fit=crop&q=80&w=100&h=100"
    },
    { 
      id: 5, 
      doctor: "Dr. Marvin Campbell", 
      speciality: "Orthopaedics", 
      patient: "Gina (Cat)", 
      visitDate: "15 Nov 2026", 
      visitTime: "1.00 PM - 1.15 PM", 
      status: true, 
      amount: "$200.00", 
      docImg: "https://randomuser.me/api/portraits/men/51.jpg",
      patImg: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=100&h=100"
    },
  ]);

  // Toggle Function
  const toggleStatus = (id) => {
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: !apt.status } : apt));
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <main className="pt-24 px-8 pb-8">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
              <ul className="flex gap-2 text-sm text-slate-500 mt-1">
                <li className="hover:text-emerald-600 cursor-pointer">Dashboard</li>
                <li>/</li>
                <li className="text-slate-400">Appointments</li>
              </ul>
            </div>
          </div>

          {/* White Card Container */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6">
            
            {/* Top Controls (Search & Entries) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-sm font-medium text-slate-600">
                    Show 
                    <select className="mx-2 border border-slate-300 rounded p-1 focus:outline-none focus:border-emerald-500">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select> 
                    entries
                </div>
                <input 
                    type="text" 
                    placeholder="Search doctors, patients..." 
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm font-bold">
                  <tr>
                    <th className="px-4 py-4">Doctor Name</th>
                    <th className="px-4 py-4">Speciality</th>
                    <th className="px-4 py-4">Patient Name</th>
                    <th className="px-4 py-4">Appointment Time</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-4 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Doctor */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={apt.docImg} alt="" className="w-9 h-9 rounded-full object-cover" />
                          <span className="text-sm font-semibold text-slate-700">{apt.doctor}</span>
                        </div>
                      </td>

                      {/* Speciality */}
                      <td className="px-4 py-4 text-sm text-slate-500">{apt.speciality}</td>

                      {/* Patient (Pet) */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={apt.patImg} alt="" className="w-9 h-9 rounded-full object-cover" />
                          <span className="text-sm font-semibold text-slate-700">{apt.patient}</span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-slate-700">{apt.visitDate}</div>
                        <div className="text-xs text-[#00d0f1] mt-1 font-medium">{apt.visitTime}</div>
                      </td>

                      {/* Toggle Switch */}
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => toggleStatus(apt.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            apt.status ? 'bg-emerald-400' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              apt.status ? 'translate-x-6' : 'translate-x-1'
                            }`} 
                          />
                        </button>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                        {apt.amount}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 text-sm text-slate-500">
                <p>Showing 1 to 10 of 10 entries</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-emerald-500 text-white rounded">1</button>
                    <button className="px-3 py-1 border rounded hover:bg-slate-50">Next</button>
                </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"></div>
      )}
    </div>
  );
};

export default Appointments;