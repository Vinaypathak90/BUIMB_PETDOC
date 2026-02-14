import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Activity, Calendar, Loader2 } from 'lucide-react';

// --- COMPONENTS ---
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';   
import DashboardCharts from '../../components/admin/DashboardCharts';
import DashboardTables from '../../components/admin/DashboardTables';
import AppointmentTable from '../../components/admin/AppointmentTable';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    revenue: 0,
    doctors: 0,
    appointments: 0,
    patients: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Toggle Logic for Mobile Sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- 1. FETCH DASHBOARD STATS (API) ---
  useEffect(() => {
    const fetchStats = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      
      // Auth Check: Redirect to Login if no token
      if (!storedData || !storedData.token) {
          navigate('/login');
          return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Helper: Format Currency (₹)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumSignificantDigits: 3
    }).format(amount);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* Sidebar (Fixed Left) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Wrapper */}
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <main className="pt-24 px-8 pb-8">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-500 font-medium mt-1">Welcome back, Admin.</p>
            </div>
          </div>

          {/* --- STATS CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {isLoading ? (
                // Loading Skeletons
                [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white h-32 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
                        <Loader2 className="animate-spin text-slate-300" />
                    </div>
                ))
            ) : (
                <>
                    <StatCard 
                        icon={DollarSign} 
                        label="Total Revenue" 
                        value={formatCurrency(stats.revenue)} 
                        color="bg-emerald-50 text-emerald-600" 
                    />
                    <StatCard 
                        icon={Users} 
                        label="Active Doctors" 
                        value={stats.doctors} 
                        color="bg-blue-50 text-blue-600" 
                    />
                    <StatCard 
                        icon={Calendar} 
                        label="Appointments" 
                        value={stats.appointments} 
                        color="bg-purple-50 text-purple-600" 
                    />
                    <StatCard 
                        icon={Activity} 
                        label="Patients" 
                        value={stats.patients} 
                        color="bg-orange-50 text-orange-600" 
                    />
                </>
            )}
          </div>

          {/* --- CHARTS SECTION (Revenue & Growth) --- */}
          <DashboardCharts />

          {/* --- TABLES SECTION (Top Doctors & Patients) --- */}
          <DashboardTables />

          {/* --- APPOINTMENTS SECTION (Management Table) --- */}
          <div className="mt-8">
             <AppointmentTable />
          </div>

        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div onClick={toggleSidebar} className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"></div>
      )}
    </div>
  );
};

// --- HELPER COMPONENT FOR STATS ---
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100">Live</span>
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
  </div>
);

export default AdminDashboard;