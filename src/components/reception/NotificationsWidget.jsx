import React, { useState, useEffect } from 'react';
import { 
  Bell, X, CheckCircle, AlertTriangle, Info, 
  Trash2, Check, Clock 
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'New Appointment', msg: 'Dr. Aditya has a new booking at 2:00 PM.', type: 'info', time: '2 min ago', read: false },
  { id: 2, title: 'Emergency Alert', msg: 'Trauma case arriving in 5 mins. Prep Room 3.', type: 'alert', time: '10 min ago', read: false },
  { id: 3, title: 'System Update', msg: 'Server maintenance scheduled at 12:00 AM.', type: 'neutral', time: '1 hr ago', read: true },
];

const NotificationsWidget = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // all, unread

  // --- SIMULATE LIVE NOTIFICATIONS ---
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['info', 'alert', 'success'];
      const titles = ['Walk-in Registered', 'Payment Received', 'Low Stock Alert', 'Doctor Checked In'];
      const msgs = ['New patient added to queue.', 'Invoice #INV-2024 paid.', 'Paracetamol stock is low.', 'Dr. Priya is now Online.'];
      
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomIndex = Math.floor(Math.random() * titles.length);

      const newNotif = {
        id: Date.now(),
        title: titles[randomIndex],
        msg: msgs[randomIndex],
        type: randomType,
        time: 'Just now',
        read: false
      };

      // Add new notification to top
      setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep max 10
    }, 15000); // New alert every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // --- HELPER: STYLES ---
  const getIcon = (type) => {
    if (type === 'alert') return <AlertTriangle size={16} className="text-red-500" />;
    if (type === 'success') return <CheckCircle size={16} className="text-emerald-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  const getBg = (type) => {
    if (type === 'alert') return 'bg-red-50 border-red-100';
    if (type === 'success') return 'bg-emerald-50 border-emerald-100';
    return 'bg-blue-50 border-blue-100';
  };

  const displayedList = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Bell size={18} className={unreadCount > 0 ? "text-red-500 animate-pulse" : "text-slate-400"}/> 
                Notifications
            </h3>
            {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')} 
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${filter === 'unread' ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-slate-500 border-slate-200'}`}
            >
                {filter === 'all' ? 'Show Unread' : 'Show All'}
            </button>
            <button onClick={markAllRead} title="Mark all read" className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#00d0f1]"><Check size={14}/></button>
            <button onClick={clearAll} title="Clear all" className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
        </div>
      </div>

      {/* LIST AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {displayedList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <Bell size={32} className="mb-2"/>
                <p className="text-xs font-bold">No notifications</p>
            </div>
        ) : (
            displayedList.map((notif) => (
                <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`relative p-3 rounded-2xl border transition-all group cursor-pointer hover:shadow-md animate-in slide-in-from-right-2 duration-300
                        ${notif.read ? 'bg-white border-slate-100 opacity-70 grayscale-[0.5]' : getBg(notif.type)}
                    `}
                >
                    {/* Unread Dot */}
                    {!notif.read && <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                    
                    <div className="flex gap-3">
                        <div className="mt-0.5 p-1.5 bg-white rounded-full h-fit shadow-sm border border-slate-100">
                            {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start pr-4">
                                <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-500' : 'text-slate-800'}`}>{notif.title}</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{notif.msg}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                                <Clock size={8}/> {notif.time}
                            </p>
                        </div>
                        
                        {/* Delete Button (Visible on Hover) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="absolute bottom-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={12}/>
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

    </div>
  );
};

export default NotificationsWidget;
