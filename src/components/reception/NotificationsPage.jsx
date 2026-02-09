import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, 
  Clock, X, Filter 
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'New Appointment', msg: 'Dr. Aditya has a new booking at 2:00 PM.', type: 'info', time: '2 min ago', read: false },
  { id: 2, title: 'Emergency Alert', msg: 'Trauma case arriving in 5 mins. Prep Room 3.', type: 'alert', time: '10 min ago', read: false },
  { id: 3, title: 'System Update', msg: 'Server maintenance scheduled at 12:00 AM.', type: 'neutral', time: '1 hr ago', read: true },
  { id: 4, title: 'Payment Received', msg: 'Invoice #INV-2099 settled by UPI.', type: 'success', time: '2 hrs ago', read: true },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // all, unread, alert

  // --- SIMULATE LIVE DATA ---
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['info', 'alert', 'success'];
      const titles = ['New Patient', 'Stock Alert', 'Lab Report Ready'];
      const msgs = ['Walk-in patient registered.', 'Cotton rolls running low.', 'Blood test results available.'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const newNotif = {
        id: Date.now(),
        title: titles[Math.floor(Math.random() * titles.length)],
        msg: msgs[Math.floor(Math.random() * msgs.length)],
        type: randomType,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 10000); // New notification every 10s
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if(window.confirm("Clear all notifications?")) setNotifications([]);
  };

  // --- FILTERING ---
  const filteredList = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alert') return n.type === 'alert';
    return true;
  });

  const getIcon = (type) => {
    if (type === 'alert') return <AlertTriangle size={20} className="text-red-500" />;
    if (type === 'success') return <CheckCircle size={20} className="text-emerald-500" />;
    return <Info size={20} className="text-blue-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bell size={24}/>
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800">Notification Center</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Stay Updated</p>
            </div>
        </div>

        <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>Unread</button>
            <button onClick={() => setFilter('alert')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${filter === 'alert' ? 'bg-red-500 text-white' : 'bg-white text-slate-500'}`}>Alerts</button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase">{filteredList.length} Notifications</span>
            <div className="flex gap-2">
                <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-indigo-600 transition-colors">
                    <Check size={12}/> Mark All Read
                </button>
                <button onClick={clearAll} className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-red-600 transition-colors">
                    <Trash2 size={12}/> Clear All
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Bell size={48} className="opacity-20 mb-4"/>
                    <p className="font-bold text-sm">No new notifications.</p>
                </div>
            ) : (
                filteredList.map(notif => (
                    <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md
                            ${notif.read ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50/30 border-blue-100'}
                            ${notif.type === 'alert' && !notif.read ? 'bg-red-50/50 border-red-100' : ''}
                        `}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                            ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}
                        `}>
                            {getIcon(notif.type)}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{notif.msg}</p>
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="text-slate-300 hover:text-red-500 hover:bg-slate-100 p-2 rounded-full h-fit transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

    </div>
  );
};

export default NotificationsPage;
