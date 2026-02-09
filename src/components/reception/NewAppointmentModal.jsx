import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, FileText, Save } from 'lucide-react';

const NewAppointmentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    date: new Date().toISOString().split('T')[0], // Default Today
    time: '',
    doctor: '',
    type: 'Online', // Online or Walk-in
    reason: ''
  });

  if (!isOpen) return null;

  const doctors = ["Dr. Aditya Sharma", "Dr. Priya Varma", "Dr. Sameer Khan", "Dr. Edalin Hendry"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppt = {
      id: `APT-${Math.floor(Math.random() * 10000)}`,
      ...formData,
      status: 'Waiting', // Default status
      paymentStatus: 'Pending',
      amount: 500 // Mock fee
    };
    onSave(newAppt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1e293b] p-5 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-[#00d0f1]"/> Book New Appointment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
            <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input type="text" required placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact</label>
                <div className="relative mt-1">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input type="tel" required placeholder="Mobile No." value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]">
                    <option>Online</option>
                    <option>Walk-in</option>
                    <option>Emergency</option>
                </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Assign Doctor</label>
            <div className="relative mt-1">
                <Stethoscope size={16} className="absolute left-3 top-3 text-slate-400"/>
                <select required value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]">
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                </select>
            </div>
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Reason (Optional)</label>
             <textarea rows="2" placeholder="Symptoms or notes..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1] resize-none"></textarea>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-[#00d0f1] text-[#1e293b] rounded-xl font-black uppercase tracking-wide shadow-lg hover:bg-cyan-400 transition-all flex justify-center gap-2 items-center">
                <Save size={18}/> Confirm Booking
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
