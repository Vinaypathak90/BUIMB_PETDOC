import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { Clock, Eye, Trash2, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const navigate = useNavigate();

  // --- STATE ---
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- PAGINATION & SEARCH ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. FETCH APPOINTMENTS ---
  const fetchAppointments = async () => {
    setIsLoading(true);
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    if (!storedData || !storedData.token) { 
        navigate('/login'); 
        return; 
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Transform data to match UI needs
        const formattedData = data.map(app => ({
            _id: app._id,
            doctorName: app.doctorName,
            speciality: app.speciality,
            patientName: app.patientName,
            visitDate: app.date,
            visitTime: app.time,
            status: app.status === 'Scheduled', // True if Active
            amount: app.fee ? `$${app.fee}` : '$0',
            docImg: app.doctorImg || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
            patImg: app.patImg || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"
        }));
        setAppointments(formattedData);
      } else {
        console.error("Failed to fetch");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [navigate]);

  // --- 2. TOGGLE STATUS (API) ---
  const toggleStatus = async (id) => {
    // Optimistic Update
    const originalList = [...appointments];
    setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, status: !apt.status } : apt
    ));

    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
        const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        
        if (!res.ok) throw new Error("Update failed");
    } catch (err) {
        alert("Failed to update status");
        setAppointments(originalList); // Revert on error
    }
  };

  // --- 3. FILTER & PAGINATION LOGIC ---
  const filteredData = appointments.filter(apt => 
    apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#192a56]" size={40} />
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Schedule...</p>
    </div>
  );

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
            
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    Show 
                    <select 
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-slate-300 rounded p-1 focus:outline-none focus:border-emerald-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select> 
                    entries
                </div>
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search doctors, patients..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm font-bold uppercase tracking-wider">
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
                  {currentItems.length > 0 ? (
                      currentItems.map((apt) => (
                        <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* Doctor */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={apt.docImg} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              <span className="font-semibold text-slate-700">{apt.doctorName}</span>
                            </div>
                          </td>

                          {/* Speciality */}
                          <td className="px-6 py-4 text-slate-500 font-medium">{apt.speciality}</td>

                          {/* Patient */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={apt.patImg} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              <span className="font-semibold text-slate-700">{apt.patientName}</span>
                            </div>
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700">{apt.visitDate}</div>
                            <div className="text-xs text-[#00d0f1] mt-1 font-bold">{apt.visitTime}</div>
                          </td>

                          {/* Toggle Switch */}
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => toggleStatus(apt._id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                apt.status ? 'bg-emerald-400' : 'bg-slate-300'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                                  apt.status ? 'translate-x-6' : 'translate-x-1'
                                }`} 
                              />
                            </button>
                            <div className={`text-[10px] font-bold mt-1 uppercase ${apt.status ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {apt.status ? 'Active' : 'Cancelled'}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right font-bold text-slate-700">
                            {apt.amount}
                          </td>

                        </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                              No appointments found matching your search.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-slate-500 border-t border-slate-100 pt-4">
                <p>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries</p>
                <div className="flex gap-2 mt-2 md:mt-0">
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16}/>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => paginate(i+1)}
                            className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                                currentPage === i+1 ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border hover:bg-slate-50'
                            }`}
                        >
                            {i+1}
                        </button>
                    ))}

                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16}/>
                    </button>
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