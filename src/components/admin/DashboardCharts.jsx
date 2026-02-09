import React from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DashboardCharts = () => {
  
  // Data for Revenue Chart (Area Chart)
  const revenueData = [
    { year: '2013', revenue: 60 },
    { year: '2014', revenue: 100 },
    { year: '2015', revenue: 240 }, // Peak point like image
    { year: '2016', revenue: 120 },
    { year: '2017', revenue: 80 },
    { year: '2018', revenue: 100 },
    { year: '2019', revenue: 300 }, // High end point
  ];

  // Data for Status Chart (Double Line Chart)
  const statusData = [
    { year: '2015', doctors: 30, patients: 100 },
    { year: '2016', doctors: 60, patients: 20 },
    { year: '2017', doctors: 120, patients: 90 },
    { year: '2018', doctors: 80, patients: 50 },
    { year: '2019', doctors: 150, patients: 120 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* --- Revenue Chart (Left) --- */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Revenue</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b5a90" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1b5a90" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1b5a90" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: '#1b5a90', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Status Chart (Right) --- */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Status</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                 contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              {/* Orange Line */}
              <Line 
                type="monotone" 
                dataKey="doctors" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} 
                activeDot={{ r: 6 }} 
              />
              {/* Blue Line */}
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#1b5a90" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#1b5a90', strokeWidth: 0 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;
