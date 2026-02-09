import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Save, AlertCircle } from 'lucide-react';

const NewPatientModal = ({ isOpen, onClose, onSave, existingPatients }) => {
  
  // ✅ FIX: Hooks must be called at the top level, BEFORE any return statement
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    email: ''
  });

  const [error, setError] = useState('');

  // Optional: Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
        setFormData({
            name: '', phone: '', age: '', gender: 'Male', address: '', email: ''
        });
        setError('');
    }
  }, [isOpen]);

  // ✅ FIX: Conditional return happens AFTER hooks are declared
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Duplicate Check (Phone Number)
    // Safe check: existingPatients might be undefined initially
    const patientsList = existingPatients || [];
    const isDuplicate = patientsList.some(p => p.phone === formData.phone);
    
    if (isDuplicate) {
        setError('A patient with this phone number already exists!');
        return;
    }

    // 2. Create Object
    const newPatient = {
        id: `PID-${Math.floor(10000 + Math.random() * 90000)}`,
        ...formData,
        lastVisit: 'New',
        totalVisits: 0,
        status: 'Active',
        history: [] 
    };

    onSave(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-[#1e293b] p-6 flex justify-between items-center text-white">
          <h3 className="font-black text-lg flex items-center gap-2">
            <User size={20} className="text-[#00d0f1]"/> Add New Patient
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16}/> {error}
              </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <input required type="text" value={formData.name} placeholder="John Doe" onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone (Unique)</label>
                <input required type="tel" value={formData.phone} placeholder="98765..." onChange={(e) => {setFormData({...formData, phone: e.target.value}); setError('')}} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age</label>
                <input required type="number" value={formData.age} placeholder="Yrs" onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]">
                    <option>Male</option><option>Female</option><option>Other</option>
                </select>
            </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Address (Optional)</label>
             <div className="relative mt-1">
                <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400"/>
                <input type="text" value={formData.address} placeholder="City, Area" onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" />
             </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-4 bg-[#00d0f1] text-[#1e293b] rounded-xl font-black uppercase tracking-wide shadow-lg hover:bg-cyan-400 transition-all flex justify-center gap-2 items-center">
                <Save size={18}/> Save to Database
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewPatientModal;