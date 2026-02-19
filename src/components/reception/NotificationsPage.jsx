import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, 
  Clock, X
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, alert
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_token'));
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Poll every 30s for new updates
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const markAsRead = async (id) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    
    try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${userData?.token}` }
        });
    } catch (err) { console.error("API Error"); }
  };

  const deleteNotification = async (id) => {
    if(!window.confirm("Delete this notification?")) return;
    
    // Optimistic Update
    setNotifications(prev => prev.filter(n => n._id !== id));

    try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        await fetch(`http://localhost:5000/api/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userData?.token}` }
        });
    } catch (err) { console.error("API Error"); }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        await fetch(`http://localhost:5000/api/notifications/all/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${userData?.token}` }
        });
    } catch (err) { console.error("API Error"); }
  };

  const clearAll = async () => {
    if(!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
    try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        await fetch(`http://localhost:5000/api/notifications/all`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userData?.token}` }
        });
    } catch (err) { console.error("API Error"); }
  };

  // --- FILTERING ---
  const filteredList = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'alert') return n.type === 'alert';
    return true;
  });

  const getIcon = (type) => {
    if (type === 'alert') return <AlertTriangle size={20} className="text-red-500" />;
    if (type === 'success') return <CheckCircle size={20} className="text-emerald-500" />;
    return <Info size={20} className="text-blue-500" />;
  };

  // Helper to format date
  const formatTime = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            {loading ? (
                <div className="text-center py-10 text-slate-400 text-sm">Loading...</div>
            ) : filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Bell size={48} className="opacity-20 mb-4"/>
                    <p className="font-bold text-sm">No new notifications.</p>
                </div>
            ) : (
                filteredList.map(notif => (
                    <div 
                        key={notif._id} 
                        onClick={() => markAsRead(notif._id)}
                        className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md
                            ${notif.isRead ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50/30 border-blue-100'}
                            ${notif.type === 'alert' && !notif.isRead ? 'bg-red-50/50 border-red-100' : ''}
                        `}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                            ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}
                        `}>
                            {getIcon(notif.type)}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {formatTime(notif.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{notif.msg}</p>
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
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