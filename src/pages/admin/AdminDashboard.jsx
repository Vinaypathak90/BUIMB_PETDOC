import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';   
import DashboardCharts from '../../components/admin/DashboardCharts';
import DashboardTables from '../../components/admin/DashboardTables';
import AppointmentTable from '../../components/admin/AppointmentTable';

import { Users, DollarSign, Activity, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle Sidebar for Mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Sidebar (Fixed Left) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <main className="pt-24 px-8 pb-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-500 font-medium mt-1">Welcome back, Admin.</p>
            </div>
            
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={DollarSign} label="Total Revenue" value="$42,500" color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Users} label="Active Doctors" value="24" color="bg-blue-50 text-blue-600" />
            <StatCard icon={Calendar} label="Appointments" value="1,240" color="bg-purple-50 text-purple-600" />
            <StatCard icon={Activity} label="Patients" value="850" color="bg-orange-50 text-orange-600" />
          </div>

          {/* Empty State for Future Content */}
          <DashboardCharts />
          <DashboardTables />
          <AppointmentTable />
        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"></div>
      )}
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">+12%</span>
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
  </div>
);

export default AdminDashboard;
