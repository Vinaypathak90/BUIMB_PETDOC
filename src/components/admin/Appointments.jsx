import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Eye, Clock } from 'lucide-react';

const Appointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle Logic for Mobile Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // --- DUMMY APPOINTMENT DATA (Screenshot Data) ---
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctorName: "Dr. Ruby Perrin",
      speciality: "Dental",
      patientName: "Charlene Reed",
      date: "9 Nov 2026",
      time: "11.00 AM - 11.15 AM",
      status: true, // true = Active (Green)
      amount: "$200.00",
      docImg: "https://randomuser.me/api/portraits/women/44.jpg",
      patImg: "https://randomuser.me/api/portraits/women/22.jpg"
    },
    {
      id: 2,
      doctorName: "Dr. Darren Elder",
      speciality: "Dental",
      patientName: "Travis Trimble",
      date: "5 Nov 2026",
      time: "11.00 AM - 11.35 AM",
      status: true,
      amount: "$300.00",
      docImg: "https://randomuser.me/api/portraits/men/32.jpg",
      patImg: "https://randomuser.me/api/portraits/men/11.jpg"
    },
    {
      id: 3,
      doctorName: "Dr. Deborah Angel",
      speciality: "Cardiology",
      patientName: "Carl Kelly",
      date: "11 Nov 2026",
      time: "12.00 PM - 12.15 PM",
      status: true,
      amount: "$150.00",
      docImg: "https://randomuser.me/api/portraits/women/68.jpg",
      patImg: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      id: 4,
      doctorName: "Dr. Sofia Brient",
      speciality: "Urology",
      patientName: "Michelle Fairfax",
      date: "7 Nov 2026",
      time: "1.00 PM - 1.20 PM",
      status: true,
      amount: "$150.00",
      docImg: "https://randomuser.me/api/portraits/women/65.jpg",
      patImg: "https://randomuser.me/api/portraits/women/33.jpg"
    },
    {
      id: 5,
      doctorName: "Dr. Marvin Campbell",
      speciality: "Orthopaedics",
      patientName: "Gina Moore",
      date: "15 Nov 2026",
      time: "1.00 PM - 1.15 PM",
      status: false, // Inactive (Gray)
      amount: "$200.00",
      docImg: "https://randomuser.me/api/portraits/men/51.jpg",
      patImg: "https://randomuser.me/api/portraits/women/12.jpg"
    }
  ]);

  // Toggle Status Handler
  const toggleStatus = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: !apt.status } : apt
    ));
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
            <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Appointment List</h2>
            </div>
            
            <div className="overflow-x-auto">
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
                          <img src={item.docImg} alt="" className="w-10 h-10 rounded-full object-cover" />
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
                          <img src={item.patImg} alt="" className="w-10 h-10 rounded-full object-cover" />
                          <span className="font-semibold text-slate-700">{item.patientName}</span>
                        </div>
                      </td>

                      {/* Date & Time (Blue Time) */}
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
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {item.amount}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Simple Pagination */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold">Showing 1 to {appointments.length} entries</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded text-xs hover:bg-slate-50">Previous</button>
                    <button className="px-3 py-1 bg-emerald-500 text-white rounded text-xs shadow-md">1</button>
                    <button className="px-3 py-1 border rounded text-xs hover:bg-slate-50">Next</button>
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