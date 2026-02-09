import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit3, 
  Save, Camera, Lock, Shield, Activity, Clock 
} from 'lucide-react';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // --- MOCK USER DATA ---
  const [userData, setUserData] = useState({
    name: "Vinay Pathak",
    role: "Senior Receptionist",
    empId: "EMP-2023-042",
    email: "vinay.pathak@petdoc.com",
    phone: "+91 98765 43210",
    address: "Andheri West, Mumbai, India",
    joinDate: "15 Aug, 2023",
    avatar: "VP",
    status: "Online"
  });

  // --- MOCK STATS ---
  const stats = [
    { label: "Patients Registered", value: "1,240", icon: User, color: "bg-blue-50 text-blue-600" },
    { label: "Appointments Booked", value: "856", icon: Calendar, color: "bg-purple-50 text-purple-600" },
    { label: "Hours Logged (Feb)", value: "128h", icon: Clock, color: "bg-orange-50 text-orange-600" },
  ];

  // --- MOCK ACTIVITY LOG ---
  const activities = [
    { id: 1, action: "Registered new patient", detail: "Rahul Sharma (PID-1092)", time: "10 mins ago" },
    { id: 2, action: "Created Invoice", detail: "#INV-9921 for ₹1,500", time: "45 mins ago" },
    { id: 3, action: "Updated Appointment", detail: "Rescheduled Dr. Aditya to 4 PM", time: "2 hrs ago" },
    { id: 4, action: "System Login", detail: "Successful login from IP 192.168.1.12", time: "09:00 AM" },
  ];

  // --- HANDLERS ---
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* --- 1. HEADER / COVER --- */}
      <div className="relative h-48 bg-gradient-to-r from-[#1e293b] to-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute bottom-6 left-8 flex items-end gap-6">
            <div className="relative group cursor-pointer">
                <div className="w-28 h-28 bg-white rounded-full p-1 shadow-2xl">
                    <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-black text-slate-500">
                        {userData.avatar}
                    </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-[#00d0f1] p-2 rounded-full text-[#1e293b] shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={16}/>
                </div>
            </div>
            <div className="mb-2 text-white">
                <h1 className="text-3xl font-black">{userData.name}</h1>
                <p className="text-slate-300 font-medium flex items-center gap-2">
                    {userData.role} • <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/50">● {userData.status}</span>
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* --- 2. LEFT COLUMN: PERSONAL DETAILS --- */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Personal Info Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <User size={20} className="text-[#00d0f1]"/> Personal Information
                    </h3>
                    <button 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all
                            ${isEditing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                        `}
                    >
                        {isEditing ? <><Save size={14}/> Save Changes</> : <><Edit3 size={14}/> Edit Profile</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                        <input 
                            disabled={!isEditing} 
                            value={userData.name}
                            onChange={(e) => setUserData({...userData, name: e.target.value})}
                            className={`w-full mt-1 p-3 rounded-xl font-bold text-slate-700 outline-none transition-all
                                ${isEditing ? 'bg-slate-50 border border-slate-200 focus:border-[#00d0f1]' : 'bg-white border-transparent px-0'}
                            `}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Employee ID</label>
                        <input disabled value={userData.empId} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                        <div className={`flex items-center gap-3 mt-1 p-3 rounded-xl transition-all ${isEditing ? 'bg-slate-50 border border-slate-200' : 'px-0'}`}>
                            <Mail size={16} className="text-slate-400"/>
                            <input 
                                disabled={!isEditing} 
                                value={userData.email}
                                onChange={(e) => setUserData({...userData, email: e.target.value})}
                                className="w-full bg-transparent font-bold text-slate-700 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                        <div className={`flex items-center gap-3 mt-1 p-3 rounded-xl transition-all ${isEditing ? 'bg-slate-50 border border-slate-200' : 'px-0'}`}>
                            <Phone size={16} className="text-slate-400"/>
                            <input 
                                disabled={!isEditing} 
                                value={userData.phone}
                                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                className="w-full bg-transparent font-bold text-slate-700 outline-none"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Address</label>
                        <div className={`flex items-center gap-3 mt-1 p-3 rounded-xl transition-all ${isEditing ? 'bg-slate-50 border border-slate-200' : 'px-0'}`}>
                            <MapPin size={16} className="text-slate-400"/>
                            <input 
                                disabled={!isEditing} 
                                value={userData.address}
                                onChange={(e) => setUserData({...userData, address: e.target.value})}
                                className="w-full bg-transparent font-bold text-slate-700 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className={`p-3 rounded-xl mb-3 ${stat.color}`}>
                            <stat.icon size={24}/>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                    </div>
                ))}
            </div>

        </div>

        {/* --- 3. RIGHT COLUMN: SECURITY & ACTIVITY --- */}
        <div className="space-y-6">
            
            {/* Activity Log */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-6">
                    <Activity size={20} className="text-orange-500"/> Recent Activity
                </h3>
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {activities.map((act) => (
                        <div key={act.id} className="relative flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                                <div className="w-2 h-2 bg-[#00d0f1] rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{act.action}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{act.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-red-500"/> Security
                </h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Lock size={18} className="text-slate-400"/>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Change Password</p>
                                <p className="text-[10px] text-slate-400">Last changed 3 months ago</p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-[#00d0f1] hover:underline">Update</button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-slate-400"/>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                                <p className="text-[10px] text-slate-400">Currently Disabled</p>
                            </div>
                        </div>
                        <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default MyProfile;
