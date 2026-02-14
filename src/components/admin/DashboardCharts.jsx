import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

const DashboardCharts = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchChartData = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      
      // If no token, we can't fetch. Just stop loading.
      if (!storedData || !storedData.token) {
          setIsLoading(false);
          return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/admin/chart-data', {
            headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // Set Data or use Default Empty Data if DB is empty to prevent crash
            setRevenueData(
                data.revenueData && data.revenueData.length > 0 
                ? data.revenueData 
                : [{ year: new Date().getFullYear().toString(), revenue: 0 }]
            );
            
            setStatusData(
                data.statusData && data.statusData.length > 0 
                ? data.statusData 
                : [{ year: new Date().getFullYear().toString(), doctors: 0, patients: 0 }]
            );
        }
      } catch (error) {
        console.error("Error fetching charts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64 w-full bg-white rounded-[20px] border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-blue-900" size={32} />
            <span className="ml-3 text-slate-500 font-bold text-sm">Loading Analytics...</span>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* --- Revenue Chart (Area Chart - Left) --- */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Revenue Trend</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b5a90" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1b5a90" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip 
                contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1b5a90" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#1b5a90', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Status Chart (Line Chart - Right) --- */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">User Growth</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip 
                 contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    fontWeight: 'bold'
                 }}
              />
              {/* Doctors Line (Orange) */}
              <Line 
                type="monotone" 
                dataKey="doctors" 
                name="Doctors"
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} 
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
              {/* Patients Line (Blue) */}
              <Line 
                type="monotone" 
                dataKey="patients" 
                name="Patients"
                stroke="#1b5a90" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#1b5a90', strokeWidth: 0 }} 
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;