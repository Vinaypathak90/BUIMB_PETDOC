import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Calendar, Clock, 
  Wallet, UserX, ArrowUpRight, Activity, Loader2
} from 'lucide-react';

const DailyReports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { served: 0, noShows: 0, revenue: 0, peakHour: "--" },
    hourlyTraffic: [],
    statusCounts: { 'Served': 0, 'Waiting': 0, 'No-Show': 0 }
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchReports = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user_token'));
            const res = await fetch('http://localhost:5000/api/receptionist/reports/daily', {
                headers: { 'Authorization': `Bearer ${userData?.token}` }
            });
            const result = await res.json();
            
            if (res.ok) {
                setData(result);
            }
        } catch (err) {
            console.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };
    fetchReports();
  }, []);

  // --- CHART HELPERS ---
  
  // 1. Bar Chart: Calculate Height % based on Max Value
  const maxTraffic = Math.max(...data.hourlyTraffic.map(i => i.count), 1); // Avoid divide by 0
  const processedHourlyData = data.hourlyTraffic.map(item => ({
      ...item,
      height: `${(item.count / maxTraffic) * 100}%`
  }));

  // 2. Donut Chart: Calculate Percentages & SVG Offsets
  const totalAppts = Object.values(data.statusCounts).reduce((a, b) => a + b, 0) || 1;
  
  const statusData = [
    { label: 'Served', value: data.statusCounts['Served'], color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Waiting', value: data.statusCounts['Waiting'], color: 'text-orange-500', bg: 'bg-orange-500' },
    { label: 'No-Show', value: data.statusCounts['No-Show'], color: 'text-red-500', bg: 'bg-red-500' },
  ];

  // SVG Logic for Donut Chart
  let accumulatedPercent = 0;
  const donutSegments = statusData.map(item => {
      const percent = (item.value / totalAppts) * 100;
      const segment = {
          ...item,
          percent: Math.round(percent),
          dashArray: `${percent} ${100 - percent}`, // CSS stroke-dasharray
          offset: 100 - accumulatedPercent + 25 // CSS stroke-dashoffset (rotated start)
      };
      accumulatedPercent += percent;
      return segment;
  });


  if (loading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={32}/>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-xl font-black text-slate-800">Daily Performance Report</h2>
            <p className="text-sm font-bold text-slate-500">Summary for {new Date().toLocaleDateString()}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-[#00d0f1] hover:border-[#00d0f1] transition-all shadow-sm">
            <ArrowUpRight size={16}/> Export Report
        </button>
      </div>

      {/* --- METRIC CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard 
            title="Patients Served" 
            value={data.summary.served} 
            sub="Completed appointments" 
            icon={Users} 
            color="blue" 
        />
        <ReportCard 
            title="No-Shows" 
            value={data.summary.noShows} 
            sub="Cancelled / Missed" 
            icon={UserX} 
            color="red" 
        />
        <ReportCard 
            title="Total Revenue" 
            value={`₹${data.summary.revenue.toLocaleString()}`} 
            sub="Invoices generated today" 
            icon={Wallet} 
            color="purple" 
        />
        <ReportCard 
            title="Peak Hour" 
            value={data.summary.peakHour} 
            sub="Highest footfall time" 
            icon={Clock} 
            color="orange" 
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
        
        {/* 1. Bar Chart (Dynamic) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
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
                {processedHourlyData.length > 0 ? (
                    processedHourlyData.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                            <div className="relative w-full flex justify-center h-40 items-end">
                                {/* Tooltip */}
                                <div className="absolute -top-8 bg-[#1e293b] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.count} Patients
                                </div>
                                {/* Bar */}
                                <div 
                                    className={`w-full max-w-[24px] rounded-t-lg transition-all duration-700 ease-out group-hover:bg-[#00d0f1] 
                                    ${item.height === '100%' ? 'bg-[#1e293b]' : 'bg-slate-100'}`}
                                    style={{ height: item.height }}
                                ></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">{item.time.split(' ')[0]} {item.time.split(' ')[1]}</span>
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center text-slate-400 text-xs font-bold py-10">No traffic data yet</div>
                )}
            </div>
        </div>
        
        {/* 2. Donut Chart (Dynamic SVG) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
            <h3 className="font-black text-slate-800 text-lg mb-1">Status Overview</h3>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">Daily Breakdown</p>

            <div className="flex items-center gap-6">
                {/* SVG Ring */}
                <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 42 42" className="w-full h-full">
                        {/* Background Ring */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="5"></circle>

                        {/* Dynamic Segments */}
                        {donutSegments.map((seg, i) => (
                            <circle 
                                key={i}
                                cx="21" cy="21" r="15.91549430918954" 
                                fill="transparent" 
                                stroke="currentColor" 
                                strokeWidth="5"
                                className={`${seg.color} transition-all duration-1000 ease-out`}
                                strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                                strokeDashoffset={25 + (100 - accumulatedPercent + seg.percent)} // Complex offset math for continuous ring
                                style={{ strokeDashoffset: - (accumulatedPercent - seg.percent) }} // Simplified stacking logic
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-slate-800">{totalAppts === 1 && totalAppts !== data.statusCounts['Served'] ? totalAppts : totalAppts}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {donutSegments.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${item.bg}`}></div>
                                <span className="text-xs font-bold text-slate-600">{item.label}</span>
                            </div>
                            <span className="text-xs font-black text-slate-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Sub-component
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
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{title}</p>
        {sub && <p className="text-[10px] font-medium text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={10}/> {sub}</p>}
      </div>
    </div>
  );
};

export default DailyReports;