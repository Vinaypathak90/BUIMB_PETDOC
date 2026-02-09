import React from 'react';
import { X, User, Phone, MapPin, Calendar, Clock, ShieldCheck, History } from 'lucide-react';

const PatientProfileModal = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">
        
        {/* LEFT: ID CARD STYLE INFO */}
        <div className="w-full md:w-1/3 bg-[#1e293b] p-8 text-white flex flex-col items-center text-center relative">
            <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={18}/></button>
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#00d0f1] to-blue-600 p-1 mb-4 shadow-xl">
                <div className="w-full h-full rounded-full bg-[#1e293b] flex items-center justify-center text-4xl font-black">
                    {patient.name.charAt(0)}
                </div>
            </div>
            
            <h2 className="text-xl font-black">{patient.name}</h2>
            <p className="text-[#00d0f1] font-bold text-sm mt-1">{patient.id}</p>
            <span className="mt-3 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">{patient.status}</span>

            <div className="mt-8 w-full space-y-4 text-left">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <Phone size={16} className="text-slate-400"/>
                    <div><p className="text-[10px] text-slate-400 uppercase">Phone</p><p className="text-sm font-bold">{patient.phone}</p></div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <User size={16} className="text-slate-400"/>
                    <div><p className="text-[10px] text-slate-400 uppercase">Details</p><p className="text-sm font-bold">{patient.age} Yrs, {patient.gender}</p></div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                    <MapPin size={16} className="text-slate-400"/>
                    <div><p className="text-[10px] text-slate-400 uppercase">Address</p><p className="text-sm font-bold truncate">{patient.address || 'N/A'}</p></div>
                </div>
            </div>
        </div>

        {/* RIGHT: NON-MEDICAL HISTORY */}
        <div className="flex-1 p-8 bg-[#f8fafc] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <History className="text-[#00d0f1]"/> Visit History
                </h3>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    <ShieldCheck size={12}/> Privacy Mode Active
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {patient.history && patient.history.length > 0 ? (
                    <div className="space-y-3">
                        {patient.history.map((visit, index) => (
                            <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl font-bold text-center w-16">
                                        <span className="block text-[10px] uppercase">{visit.date.split(' ')[0]}</span>
                                        <span className="block text-lg leading-none mt-1">{visit.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{visit.doctor}</h4>
                                        <p className="text-xs text-slate-500 font-medium">Type: {visit.type}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase 
                                    ${visit.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-500'}`}>
                                    {visit.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Calendar size={48} className="opacity-20 mb-2"/>
                        <p className="font-bold text-sm">No previous appointment history.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default PatientProfileModal;
