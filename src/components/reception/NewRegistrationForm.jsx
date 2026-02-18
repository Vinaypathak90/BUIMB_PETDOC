import React, { useState, useEffect } from 'react';
import { 
  User, Dog, Phone, MapPin, Stethoscope, 
  CreditCard, CheckCircle, X, ChevronRight, 
  AlertTriangle, FileText, Loader2, IndianRupee 
} from 'lucide-react';

const NewRegistrationForm = ({ onCancel, onSave }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success
  const [type, setType] = useState('Human');
  const [priority, setPriority] = useState('Normal');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DATA STATES ---
  const [allDoctors, setAllDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    address: '',
    appointmentFor: '', // Specialty
    doctor: '',
    symptoms: '',
    diseases: '',
    consultationFee: 0,
    token: ''
  });

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        const res = await fetch('http://localhost:5000/api/receptionist/doctors', {
            headers: { 'Authorization': `Bearer ${userData?.token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            setAllDoctors(data);
            const uniqueSpecialties = [...new Set(data.map(doc => doc.speciality))];
            setSpecialties(uniqueSpecialties);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecialtyChange = (e) => {
    const selectedSpecialty = e.target.value;
    const filtered = allDoctors.filter(doc => doc.speciality === selectedSpecialty);
    setFilteredDoctors(filtered);
    setFormData({ 
        ...formData, 
        appointmentFor: selectedSpecialty, 
        doctor: '', 
        consultationFee: 0 
    });
  };

  const handleDoctorSelect = (e) => {
    const docName = e.target.value;
    const docInfo = allDoctors.find(d => d.name === docName);
    setFormData({ 
      ...formData, 
      doctor: docName, 
      consultationFee: docInfo ? docInfo.fee : 0 
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.doctor || !formData.appointmentFor) {
      alert("Please select a Department and Doctor.");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
        const userData = JSON.parse(localStorage.getItem('user_token'));
        const payload = {
            ...formData,
            type,
            priority,
            amount: formData.consultationFee + 100 // Total amount
        };

        const res = await fetch('http://localhost:5000/api/receptionist/book-walk-in', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${userData?.token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            setFormData(prev => ({ ...prev, token: data.token }));
            setTimeout(() => {
                setIsProcessing(false);
                setStep(3);
            }, 1500); // Slight delay for UX
        } else {
            alert(data.message || "Registration Failed");
            setIsProcessing(false);
        }
    } catch (err) {
        alert("Transaction Failed. Server Error.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 animate-in fade-in duration-300">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {step === 1 && <User className="text-[#00d0f1]" size={24}/>}
            {step === 2 && <CreditCard className="text-[#00d0f1]" size={24}/>}
            {step === 3 && <CheckCircle className="text-emerald-500" size={24}/>}
            {step === 1 ? "New Patient Registration" : step === 2 ? "Payment Gateway" : "Registration Complete"}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {step === 1 ? "Step 1: Patient Details" : step === 2 ? "Step 2: Confirm Payment" : "Success"}
          </p>
        </div>
        {step !== 3 && (
          <button onClick={onCancel} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* --- STEP 1: FORM --- */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            
            {/* Toggles */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setType('Human')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${type === 'Human' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}><User size={14} /> Human</button>
                  <button type="button" onClick={() => setType('Pet')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${type === 'Pet' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}><Dog size={14} /> Pet</button>
                </div>
                
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPriority('Normal')} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${priority === 'Normal' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>Normal</button>
                    <button type="button" onClick={() => setPriority('Emergency')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${priority === 'Emergency' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm animate-pulse' : 'bg-white text-slate-500 border-slate-200'}`}><AlertTriangle size={14}/> Emergency</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Patient Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Enter Full Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all" />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age</label>
                  <input required name="age" value={formData.age} onChange={handleChange} type="number" placeholder="Yrs" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all appearance-none">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input required name="contact" value={formData.contact} onChange={handleChange} type="tel" placeholder="9876543210" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Address</label>
                <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Area / City" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Department</label>
                <select required name="appointmentFor" value={formData.appointmentFor} onChange={handleSpecialtyChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all appearance-none">
                  <option value="">-- Select Department --</option>
                  {specialties.map((s, index) => <option key={index} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Doctor */}
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Assigned Doctor</label>
                <div className="relative">
                    <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <select required name="doctor" value={formData.doctor} onChange={handleDoctorSelect} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all appearance-none disabled:opacity-50" disabled={!formData.appointmentFor}>
                      <option value="">-- {formData.appointmentFor ? 'Select Doctor' : 'Select Dept First'} --</option>
                      {filteredDoctors.map((doc) => (
                          <option key={doc._id} value={doc.name}>{doc.name} (₹{doc.fee})</option>
                      ))}
                    </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Symptoms / Notes</label>
                <input name="symptoms" value={formData.symptoms} onChange={handleChange} type="text" placeholder="e.g. High Fever, Nausea" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#00d0f1] focus:bg-white transition-all" />
              </div>

            </div>
          </form>
        )}

        {/* --- STEP 2: PAYMENT --- */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-300 py-4">
              <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-lg p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#00d0f1]"></div>
                  
                  <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CreditCard size={28}/>
                      </div>
                      <h3 className="text-lg font-black text-slate-800">Confirm Payment</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase">Secure Gateway</p>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm text-slate-600">
                          <span>Consultation Fee</span>
                          <span className="font-bold">₹{formData.consultationFee}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                          <span>Registration Charges</span>
                          <span className="font-bold">₹100</span>
                      </div>
                      <div className="border-t border-dashed border-slate-200 my-2"></div>
                      <div className="flex justify-between text-base font-black text-slate-800">
                          <span>Total Payable</span>
                          <span className="text-[#00d0f1] text-xl">₹{formData.consultationFee + 100}</span>
                      </div>
                  </div>

                  <button 
                    onClick={handlePayment} 
                    disabled={isProcessing} 
                    className="w-full py-3.5 bg-[#1e293b] text-white rounded-xl font-bold text-sm hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                      {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <><IndianRupee size={18}/> Pay Now</>}
                  </button>
                  
                  <button onClick={() => setStep(1)} className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 underline">
                      Go Back to Edit
                  </button>
              </div>
          </div>
        )}

        {/* --- STEP 3: SUCCESS --- */}
{/* --- STEP 3: SUCCESS --- */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500 py-6">
            
            {/* Animated Success Icon */}
            <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75 duration-1000"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white">
                    <CheckCircle size={48} strokeWidth={2.5} className="drop-shadow-sm"/>
                </div>
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Registration Complete!</h2>
            <p className="text-slate-500 font-medium mb-8">Patient has been added to the queue.</p>

            {/* Premium Receipt Card */}
            <div className="bg-white w-full max-w-xs rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative transform hover:scale-[1.02] transition-transform duration-300">
                
                {/* Top Accent Line */}
                <div className="h-2 w-full bg-gradient-to-r from-[#00d0f1] to-blue-500"></div>

                {/* Ticket Header (Token) */}
                <div className="p-6 pb-0 text-center relative bg-gradient-to-b from-white to-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1">TOKEN NUMBER</p>
                    <h1 className="text-7xl font-black text-slate-800 tracking-tighter leading-none mb-2 drop-shadow-sm">
                        {formData.token}
                    </h1>
                    
                    {/* Priority Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        priority === 'Emergency' 
                        ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${priority === 'Emergency' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        {priority} Priority
                    </div>
                </div>

                {/* Perforated Divider */}
                <div className="relative flex items-center justify-center w-full my-6 opacity-50">
                    <div className="absolute left-0 w-3 h-6 bg-white rounded-r-full border-y border-r border-slate-100 shadow-inner"></div>
                    <div className="absolute right-0 w-3 h-6 bg-white rounded-l-full border-y border-l border-slate-100 shadow-inner"></div>
                    <div className="w-full border-t-2 border-dashed border-slate-200 mx-4"></div>
                </div>

                {/* Ticket Details */}
                <div className="px-6 pb-6 bg-white space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Patient</span>
                        <span className="text-sm font-bold text-slate-700 text-right truncate max-w-[140px]">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Doctor</span>
                        <span className="text-sm font-bold text-[#00d0f1] text-right truncate max-w-[140px]">{formData.doctor}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time</span>
                        <span className="text-xs font-bold text-slate-500 text-right bg-slate-100 px-2 py-1 rounded-md">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 w-full max-w-xs">
                <button 
                    onClick={() => window.print()} 
                    className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 group"
                >
                    <FileText size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors"/> 
                    Print
                </button>
                <button 
                    onClick={onSave} 
                    className="flex-1 py-3.5 bg-[#1e293b] text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                    Done <ChevronRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-transform"/>
                </button>
            </div>
        </div>
      )}

      </div>

      {/* --- FOOTER ACTION (Only for Step 1) --- */}
      {step === 1 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm text-sm transition-all">Cancel</button>
            <button onClick={handleNextStep} className="px-8 py-2.5 bg-[#1e293b] text-white rounded-xl font-bold text-sm hover:bg-[#00d0f1] hover:text-[#1e293b] shadow-lg transition-all flex items-center gap-2">
               Next Step <ChevronRight size={16}/>
            </button>
        </div>
      )}

    </div>
  );
};

export default NewRegistrationForm;