import React from 'react';
import { 
  Users, TrendingUp, Calendar, Clock, 
  Wallet, UserX, ArrowUpRight, Activity 
} from 'lucide-react';

// ==========================================
// 1. MOCK DATA
// ==========================================

const REPORT_SUMMARY = {
  served: 42,
  noShows: 3,
  revenue: 24500,
  peakHour: "11:00 AM - 12:00 PM"
};

// Data for Bar Chart (Patients per Hour)
const HOURLY_TRAFFIC = [
  { time: '9 AM', count: 2, height: '20%' },
  { time: '10 AM', count: 5, height: '50%' },
  { time: '11 AM', count: 8, height: '80%' }, // Peak
  { time: '12 PM', count: 6, height: '60%' },
  { time: '1 PM', count: 3, height: '30%' },
  { time: '2 PM', count: 4, height: '40%' },
  { time: '3 PM', count: 7, height: '70%' },
  { time: '4 PM', count: 5, height: '50%' },
  { time: '5 PM', count: 2, height: '20%' },
];

// Data for Donut Chart (Status Breakdown)
const STATUS_DATA = [
  { label: 'Served', value: 75, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { label: 'Waiting', value: 15, color: 'text-orange-500', bg: 'bg-orange-500' },
  { label: 'No-Show', value: 10, color: 'text-red-500', bg: 'bg-red-500' },
];

// ==========================================
// 2. REUSABLE COMPONENTS
// ==========================================

const ReportCard = ({ title, value, sub, icon: Icon, color }) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
        <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Today</span>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{title}</p>
        {sub && <p className="text-[10px] font-medium text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={10}/> {sub}</p>}
      </div>
    </div>
  );
};

// --- CUSTOM CSS BAR CHART ---
const HourlyBarChart = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
    <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-black text-slate-800 text-lg">Hourly Traffic</h3>
            <p className="text-xs font-bold text-slate-400 uppercase">Patients per hour</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
            <Activity size={18}/>
        </div>
    </div>
    
    <div className="flex items-end justify-between h-48 gap-2 mt-auto">
        {HOURLY_TRAFFIC.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                <div className="relative w-full flex justify-center h-40 items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-[#1e293b] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.count} Patients
                    </div>
                    {/* Bar */}
                    <div 
                        className={`w-full max-w-[24px] rounded-t-lg transition-all duration-500 group-hover:bg-[#00d0f1] 
                        ${item.height === '80%' ? 'bg-[#1e293b]' : 'bg-slate-100'}`}
                        style={{ height: item.height }}
                    ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
            </div>
        ))}
    </div>
  </div>
);

// --- CUSTOM SVG DONUT CHART ---
const StatusDonutChart = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
    <h3 className="font-black text-slate-800 text-lg mb-1">Appointment Status</h3>
    <p className="text-xs font-bold text-slate-400 uppercase mb-6">Daily Breakdown</p>

    <div className="flex items-center gap-8">
        {/* SVG Ring */}
        <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                {/* Background Circle */}
                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                
                {/* Segments (Simulated) */}
                {/* Served (75%) */}
                <path className="text-emerald-500" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* Waiting (15%) - Offset 75 */}
                <path className="text-orange-500" strokeDasharray="15, 100" strokeDashoffset="-75" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* No Show (10%) - Offset 90 */}
                <path className="text-red-500" strokeDasharray="10, 100" strokeDashoffset="-90" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-800">100%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
            </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
            {STATUS_DATA.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.bg}`}></div>
                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">{item.value}%</span>
                </div>
            ))}
        </div>
    </div>
  </div>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const DailyReports = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-xl font-black text-slate-800">Daily Performance Report</h2>
            <p className="text-sm font-bold text-slate-500">Summary for {new Date().toLocaleDateString()}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-[#00d0f1] hover:border-[#00d0f1] transition-all shadow-sm">
            <ArrowUpRight size={16}/> Export Report
        </button>
      </div>

      {/* --- METRIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard 
            title="Patients Served" 
            value={REPORT_SUMMARY.served} 
            sub="+12% from yesterday" 
            icon={Users} 
            color="blue" 
        />
        <ReportCard 
            title="No-Shows" 
            value={REPORT_SUMMARY.noShows} 
            sub="3 rescheduled" 
            icon={UserX} 
            color="red" 
        />
        <ReportCard 
            title="Total Revenue" 
            value={`₹${REPORT_SUMMARY.revenue}`} 
            sub="Cash & Online" 
            icon={Wallet} 
            color="purple" 
        />
        <ReportCard 
            title="Peak Hour" 
            value="11 AM" 
            sub="8 Patients" 
            icon={Clock} 
            color="orange" 
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
        {/* Bar Chart (Takes 2 columns) */}
        <div className="lg:col-span-2">
            <HourlyBarChart />
        </div>
        
        {/* Donut Chart (Takes 1 column) */}
        <div className="lg:col-span-1">
            <StatusDonutChart />
        </div>
      </div>

    </div>
  );
};

export default DailyReports;
