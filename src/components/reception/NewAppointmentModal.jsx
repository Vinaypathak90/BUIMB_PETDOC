import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, Save } from 'lucide-react';

const NewAppointmentModal = ({ isOpen, onClose, onSave, doctorsList = [] }) => {
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default Today
    time: '',
    name: '',
    contact: '',
    type: 'Walk-in',
    doctor: '', // This will store the Doctor's Name
    reason: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '',
        name: '',
        contact: '',
        type: 'Walk-in',
        doctor: '',
        reason: ''
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic Validation
    if (!formData.name || !formData.contact || !formData.doctor || !formData.time) {
      alert("Please fill all required fields!");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1e293b] p-5 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-[#00d0f1]"/> Book New Appointment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input 
                  type="date" 
                  name="date"
                  required 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" 
                />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                <div className="relative mt-1">
                    <Clock size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="time" 
                      name="time"
                      required 
                      value={formData.time} 
                      onChange={handleChange} 
                      className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" 
                    />
                </div>
            </div>
          </div>

          {/* Row 2: Patient Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
            <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input 
                  type="text" 
                  name="name"
                  required 
                  placeholder="Full Name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" 
                />
            </div>
          </div>

          {/* Row 3: Contact & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact</label>
                <div className="relative mt-1">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="tel" 
                      name="contact"
                      required 
                      placeholder="Mobile No." 
                      value={formData.contact} 
                      onChange={handleChange} 
                      className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]" 
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select 
                  name="type"
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Online">Online</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>
          </div>

          {/* Row 4: Assign Doctor (Dynamic Data) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Assign Doctor</label>
            <div className="relative mt-1">
                <Stethoscope size={16} className="absolute left-3 top-3 text-slate-400"/>
                <select 
                  name="doctor"
                  required 
                  value={formData.doctor} 
                  onChange={handleChange} 
                  className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                >
                    <option value="">-- Select Doctor --</option>
                    {/* ✅ Check if list exists and map it */}
                    {doctorsList && doctorsList.length > 0 ? (
                        doctorsList.map((doc) => (
                            <option key={doc._id} value={doc.name}>
                                {doc.name} {doc.speciality ? `(${doc.speciality})` : ''}
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading Doctors...</option>
                    )}
                </select>
            </div>
          </div>

          {/* Row 5: Reason */}
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase">Reason (Optional)</label>
             <textarea 
               name="reason"
               rows="2" 
               placeholder="Symptoms or notes..." 
               value={formData.reason} 
               onChange={handleChange} 
               className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1] resize-none"
             ></textarea>
          </div>

          {/* Submit Button */}
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