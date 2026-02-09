import React, { useState, useEffect } from 'react';
import { 
  User, Dog, Calendar, Phone, MapPin, 
  Stethoscope, CreditCard, CheckCircle, X, 
  Activity, FileText, ChevronRight, AlertCircle, AlertTriangle 
} from 'lucide-react';

const NewRegistrationForm = ({ onCancel, onSave }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success
  const [type, setType] = useState('Human');
  const [isProcessing, setIsProcessing] = useState(false);
  const [priority, setPriority] = useState('Normal'); // 🔴 NEW: Priority State

  // --- MOCK DATA ---
  const SPECIALTIES = [
    "General Consultation", "Cardiology", "Orthopedics", 
    "Dental", "Dermatology", "Pediatrics", "Veterinary (General)", "Vaccination"
  ];

  const DOCTORS = [
    { name: "Dr. Aditya Sharma", dept: "Cardiology", fee: 1500 },
    { name: "Dr. Priya Varma", dept: "General Consultation", fee: 500 },
    { name: "Dr. Sameer Khan", dept: "Orthopedics", fee: 1200 },
    { name: "Dr. Edalin Hendry", dept: "Dental", fee: 800 },
    { name: "Dr. Rajesh Koothrapali", dept: "Veterinary (General)", fee: 600 }
  ];

  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    appointmentFor: '',
    doctor: '',
    symptoms: '',
    diseases: '', // Previous history
    consultationFee: 0,
    paymentMode: 'Cash',
    token: ''
  });

  // --- AUTO GENERATE ID & TOKEN ON MOUNT ---
  useEffect(() => {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const randomToken = `T-${Math.floor(100 + Math.random() * 900)}`;
    setFormData(prev => ({
      ...prev,
      patientId: `PID-${randomId}`,
      token: randomToken
    }));
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDoctorSelect = (e) => {
    const docName = e.target.value;
    const doc = DOCTORS.find(d => d.name === docName);
    setFormData({ 
      ...formData, 
      doctor: docName, 
      consultationFee: doc ? doc.fee : 0 
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.doctor || !formData.appointmentFor) {
      alert("Please select appointment type and doctor.");
      return;
    }
    setStep(2); // Go to Payment
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Payment Gateway Delay
    setTimeout(() => {
      setIsProcessing(false);
      saveData();
      setStep(3); // Go to Success
    }, 2000);
  };

  const saveData = () => {
    const newEntry = {
      id: formData.patientId,
      name: formData.name, // Used in Dashboard
      patient: formData.name, // Used in Upcoming list
      age: formData.age,
      gender: formData.gender,
      type: type,
      priority: priority, // 🔴 Save Priority
      checkInTime: new Date().getTime(), // 🔴 Save Timestamp for Timer
      doctor: formData.doctor,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting', // Dashboard Queue status
      paymentStatus: 'Paid',
      amount: formData.consultationFee,
      token: formData.token,
    };

    // Save to LocalStorage for Dashboard to read
    // Note: We use 'reception_data' key here
    const existingData = JSON.parse(localStorage.getItem('reception_data')) || [];
    localStorage.setItem('reception_data', JSON.stringify([newEntry, ...existingData]));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {step === 1 ? "New Patient Registration" : step === 2 ? "Payment Gateway" : "Registration Complete"}
          </h2>
          <p className="text-sm text-slate-500 font-bold">
            {step === 1 ? "Enter details to generate token." : step === 2 ? "Confirm billing details." : "Token generated successfully."}
          </p>
        </div>
        {step !== 3 && (
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      {/* --- STEP 1: REGISTRATION FORM --- */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-6">
            
            {/* Header: Type Toggle & Priority */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Type Toggle */}
                <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button type="button" onClick={() => setType('Human')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-all ${type === 'Human' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                    <User size={16} /> Human
                  </button>
                  <button type="button" onClick={() => setType('Pet')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-all ${type === 'Pet' ? 'bg-[#00d0f1] text-[#1e293b] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Dog size={16} /> Pet
                  </button>
                </div>

                {/* Priority Switch */}
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPriority('Normal')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all border ${priority === 'Normal' ? 'bg-white text-slate-700 border-slate-300 shadow-sm' : 'text-slate-400 border-transparent hover:bg-slate-50'}`}>
                        Normal
                    </button>
                    <button type="button" onClick={() => setPriority('Emergency')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1 border ${priority === 'Emergency' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm animate-pulse' : 'text-slate-400 border-transparent hover:text-red-400'}`}>
                        <AlertTriangle size={14}/> Emergency
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto ID */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Patient ID</label>
                <input value={formData.patientId} disabled className="w-full mt-1 p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed" />
              </div>

              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{type === 'Human' ? 'Patient Name' : 'Pet Name'}</label>
                <input required name="name" onChange={handleChange} type="text" placeholder="Full Name" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]" />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age</label>
                  <input required name="age" onChange={handleChange} type="number" placeholder="Yrs" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender</label>
                  <select name="gender" onChange={handleChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input required name="contact" onChange={handleChange} type="tel" placeholder="9876543210" className="w-full mt-1 pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]" />
                </div>
              </div>

              {/* Appointment For */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Appointment For</label>
                <select required name="appointmentFor" onChange={handleChange} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]">
                  <option value="">-- Select Category --</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Doctor */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Select Doctor</label>
                <div className="relative">
                    <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <select required name="doctor" onChange={handleDoctorSelect} className="w-full mt-1 pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1]">
                      <option value="">-- Available Doctors --</option>
                      {DOCTORS.map((doc, idx) => (
                          <option key={idx} value={doc.name}>{doc.name} (₹{doc.fee})</option>
                      ))}
                    </select>
                </div>
              </div>

              {/* Clinical Info */}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Symptoms</label>
                <input name="symptoms" onChange={handleChange} type="text" placeholder="e.g. Fever, Headache" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1] mb-4" />
                
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Known Diseases / History</label>
                <textarea name="diseases" onChange={handleChange} placeholder="e.g. Diabetes, Allergy..." className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#00d0f1] h-20 resize-none" />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-4 pb-4">
             <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
             <button type="submit" className="px-8 py-3 bg-[#1e293b] text-white rounded-xl font-bold hover:bg-[#00d0f1] hover:text-[#1e293b] shadow-lg transition-all flex items-center gap-2">
                Proceed to Pay <ChevronRight size={18}/>
             </button>
          </div>
        </form>
      )}

      {/* --- STEP 2: PAYMENT GATEWAY (MOCK) --- */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-300">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl w-full max-w-md text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <CreditCard size={32}/>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">Confirm Payment</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Secure Gateway</p>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left border border-slate-100">
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-500">Consultation Fee</span>
                        <span className="font-bold text-slate-800">₹{formData.consultationFee}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-500">Registration Charges</span>
                        <span className="font-bold text-slate-800">₹100</span>
                    </div>
                    <div className="border-t border-slate-200 my-3"></div>
                    <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-800">Total Payable</span>
                        <span className="font-black text-[#00d0f1]">₹{formData.consultationFee + 100}</span>
                    </div>
                </div>

                <button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#1e293b] text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                    {isProcessing ? "Processing..." : `Pay ₹${formData.consultationFee + 100}`}
                </button>
                <button onClick={() => setStep(1)} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">Cancel Transaction</button>
            </div>
        </div>
      )}

      {/* --- STEP 3: SUCCESS --- */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
            <div className="text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle size={48}/>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Registration Successful!</h2>
                <p className="text-slate-500 font-bold mb-8">Patient added to queue. Please hand over the token.</p>

                {/* Token Slip */}
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 w-64 mx-auto shadow-2xl rotate-1 hover:rotate-0 transition-transform cursor-default mb-8">
                    <div className="border-b-2 border-dashed border-slate-200 pb-4 mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OPD Token</p>
                        <h1 className="text-6xl font-black text-[#1e293b] text-center mt-2">{formData.token}</h1>
                        {priority === 'Emergency' && (
                            <span className="block mt-2 mx-auto w-fit bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded animate-pulse">EMERGENCY</span>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-800 text-sm truncate">{formData.name}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1 text-[#00d0f1]">{formData.doctor}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Paid: ₹{formData.consultationFee + 100}</p>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button onClick={() => window.print()} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <FileText size={18}/> Print Slip
                    </button>
                    <button onClick={onSave} className="px-6 py-3 bg-[#00d0f1] text-[#1e293b] rounded-xl font-bold hover:bg-cyan-400 shadow-lg flex items-center gap-2">
                        Go to Dashboard <ChevronRight size={18}/>
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default NewRegistrationForm;