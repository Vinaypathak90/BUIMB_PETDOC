import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  User, Dog, Calendar, Clock, Search, FileText, X, CheckCircle, 
  ChevronDown, Stethoscope, CreditCard, ArrowLeft, Star, ShieldCheck,
  CalendarDays, Upload, Activity
} from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- STEPS STATE (1: Form, 2: Select Doctor, 3: Payment) ---
  const [step, setStep] = useState(1); 
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // --- MOCK DOCTORS DATABASE ---
  const allDoctors = [
    { id: 1, name: "Dr. Ruby Perrin", speciality: "Dentist", fee: 500, exp: "10 Yrs", rating: 4.8, img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 2, name: "Dr. Darren Elder", speciality: "Pet Surgery", fee: 800, exp: "8 Yrs", rating: 4.9, img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 3, name: "Dr. Deborah Angel", speciality: "Cardiology", fee: 1200, exp: "15 Yrs", rating: 5.0, img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { id: 4, name: "Dr. Sofia Brient", speciality: "Urology", fee: 600, exp: "5 Yrs", rating: 4.5, img: "https://randomuser.me/api/portraits/women/65.jpg" },
    { id: 5, name: "Dr. John Gibbs", speciality: "Dentist", fee: 450, exp: "4 Yrs", rating: 4.2, img: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 6, name: "Dr. Marvin Campbell", speciality: "Pet Orthopedics", fee: 750, exp: "12 Yrs", rating: 4.7, img: "https://randomuser.me/api/portraits/men/51.jpg" },
    { id: 7, name: "Dr. Paul Richard", speciality: "Neurology", fee: 1500, exp: "20 Yrs", rating: 4.9, img: "https://randomuser.me/api/portraits/men/11.jpg" },
  ];

  // --- FORM STATE ---
  const [bookingType, setBookingType] = useState('myself'); // myself, pet, other
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', phone: '', 
    problem: '', // Speciality
    date: '', time: '', day: '',
    symptoms: '', petType: 'Dog', petName: '',
    files: null
  });

  // Autocomplete State
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSpecs, setFilteredSpecs] = useState([]);
  const searchRef = useRef(null);

  // Categories List
  const specialtiesList = [
    "Dentist", "Cardiology", "Urology", "Neurology", "Orthopedics", 
    "Pet Surgery", "Pet Orthopedics", "General Veterinary", "Dermatology",
    "General Physician", "Pediatrician", "Gynecologist"
  ];

  const petTypes = ["Dog", "Cat", "Bird", "Rabbit", "Fish"];

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Auto-fill from Profile if 'Myself' is selected
    const savedProfile = localStorage.getItem('userProfile');
    if(savedProfile && bookingType === 'myself') {
        const user = JSON.parse(savedProfile);
        setFormData(prev => ({...prev, name: user.name, age: user.age || '', phone: user.phone || ''}));
    } else if (bookingType === 'pet') {
        const user = JSON.parse(savedProfile);
        setFormData(prev => ({...prev, name: user.name})); // Owner Name
    } else {
        // Clear for 'Other'
        setFormData(prev => ({...prev, name: '', age: ''}));
    }

    // Close Dropdown on Click Outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bookingType]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-calculate Day if Date changes
    if (name === 'date') {
        const d = new Date(value);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        setFormData(prev => ({ ...prev, date: value, day: dayName }));
    }
  };

  // Speciality Search Logic
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, problem: val });
    setFilteredSpecs(specialtiesList.filter(s => s.toLowerCase().includes(val.toLowerCase())));
    setShowDropdown(true);
  };

  const selectSpecialty = (spec) => {
    setFormData({ ...formData, problem: spec });
    setShowDropdown(false);
  };

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, files: file.name });
      setTimeout(() => alert("AI Analysis: Report scanned successfully!"), 1000);
    }
  };

  // STEP NAVIGATION
  const handleFindDoctors = (e) => {
    e.preventDefault();
    if (!formData.problem || !formData.date || !formData.time) {
      alert("Please select Speciality, Date and Time to proceed.");
      return;
    }
    setStep(2);
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  // FINAL PAYMENT & BOOKING
  const handlePayment = () => {
    // 1. Create Appointment Object
    const newAppointment = {
        id: Date.now(),
        doctorName: selectedDoctor.name,
        doctorImg: selectedDoctor.img,
        speciality: selectedDoctor.speciality,
        patientName: bookingType === 'pet' ? formData.petName : formData.name,
        date: formData.date,
        day: formData.day,
        time: formData.time,
        fee: selectedDoctor.fee,
        status: "Confirmed", // Approved status
        type: bookingType // 'myself', 'pet', 'other'
    };

    // 2. Save to LocalStorage (This makes it appear on Dashboard)
    const existingApps = JSON.parse(localStorage.getItem('myAppointments')) || [];
    localStorage.setItem('myAppointments', JSON.stringify([newAppointment, ...existingApps]));

    // 3. Success & Redirect
    alert("Payment Successful! Appointment Approved.");
    navigate('/user/dashboard');
  };

  // Filter Doctors based on selection
  const matchingDoctors = allDoctors.filter(doc => 
    doc.speciality.toLowerCase().includes(formData.problem.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>}
                <div>
                    <h2 className="text-xl font-black text-slate-800">
                        {step === 1 ? 'Book Appointment' : step === 2 ? 'Select Doctor' : 'Secure Payment'}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Step {step} of 3</p>
                </div>
            </div>
        </header>
        
        <main className="p-8 max-w-5xl mx-auto">
          
          {/* --- STEP 1: DETAILS & SCHEDULING --- */}
          {step === 1 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 animate-in slide-in-from-right-8 duration-300">
                
                {/* Booking Type Toggle */}
                <div className="flex justify-center gap-2 mb-8 bg-slate-100 w-fit mx-auto p-1 rounded-full">
                    {['myself', 'pet', 'other'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => setBookingType(type)}
                            className={`px-6 py-2 rounded-full font-bold text-sm capitalize transition-all ${
                                bookingType === type 
                                ? 'bg-[#192a56] text-white shadow-md' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleFindDoctors} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Dynamic Patient Details */}
                        {bookingType === 'pet' ? (
                            <>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Name</label><input type="text" name="petName" required value={formData.petName} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="Bruno" /></div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Type</label>
                                    <select name="petType" value={formData.petType} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white">
                                        {petTypes.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="Full Name" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label><input type="number" name="age" required value={formData.age} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="25" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700"><option>Male</option><option>Female</option><option>Other</option></select></div>
                            </>
                        )}

                        {/* Speciality Search (Critical for Step 2) */}
                        <div className="relative" ref={searchRef}>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Looking For (Specialist)</label>
                            <div className="relative">
                                <Search size={18} className="absolute top-3.5 left-3 text-slate-400"/>
                                <input type="text" name="problem" value={formData.problem} onChange={handleSearchChange} onFocus={() => setShowDropdown(true)} required className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="e.g. Dentist, Pet Surgery" autoComplete="off" />
                            </div>
                            {showDropdown && filteredSpecs.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                                    {filteredSpecs.map((spec, i) => (
                                        <li key={i} onClick={() => selectSpecialty(spec)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0">{spec}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Symptoms */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Symptoms</label>
                            <input type="text" name="symptoms" value={formData.symptoms} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="e.g. Fever, Toothache, Limping" />
                        </div>

                        {/* Report Upload */}
                        <div className="md:col-span-2 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900">Upload Medical Report</p>
                                <p className="text-xs text-blue-500">AI will analyze this for the doctor.</p>
                            </div>
                            <label className="cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm border border-blue-100 flex items-center gap-2 hover:bg-blue-50 transition-all">
                                <Upload size={16} /> {formData.files ? 'File Selected' : 'Upload File'}
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Scheduling Section */}
                        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarDays size={18}/> Schedule Visit</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white focus:border-[#00d0f1] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Time</label>
                                    <input type="time" name="time" required value={formData.time} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white focus:border-[#00d0f1] outline-none" />
                                </div>
                            </div>
                            {formData.day && <p className="text-xs font-bold text-[#00d0f1] mt-2 text-right">Selected Day: {formData.day}</p>}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#00d0f1] text-[#192a56] py-4 rounded-xl font-black text-lg hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-6">
                        Show Available Doctors <CheckCircle size={20} />
                    </button>
                </form>
            </div>
          )}

          {/* --- STEP 2: SELECT DOCTOR --- */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Best {formData.problem}s for You</h3>
                        <p className="text-sm text-slate-500">Date: {formData.date} ({formData.day}) at {formData.time}</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{matchingDoctors.length} Found</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingDoctors.length > 0 ? (
                        matchingDoctors.map((doc) => (
                            <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#00d0f1] hover:shadow-lg transition-all flex gap-4 group cursor-pointer" onClick={() => handleSelectDoctor(doc)}>
                                <img src={doc.img} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-[#00d0f1] transition-colors">{doc.name}</h4>
                                    <p className="text-sm text-slate-500 font-medium">{doc.speciality}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor"/> {doc.rating}</span>
                                        <span>•</span>
                                        <span>{doc.exp} Experience</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-between">
                                    <span className="text-lg font-black text-emerald-600">₹{doc.fee}</span>
                                    <button className="bg-[#192a56] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors">Book</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Stethoscope size={40} className="mx-auto text-slate-300 mb-2"/>
                            <p className="text-slate-500 font-medium">No doctors available for "{formData.problem}".</p>
                            <p className="text-xs text-slate-400 mt-1">Try searching for "Dentist" or "Pet Surgery".</p>
                            <button onClick={() => setStep(1)} className="mt-4 text-[#00d0f1] font-bold underline">Change Search</button>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* --- STEP 3: PAYMENT GATEWAY --- */}
          {step === 3 && selectedDoctor && (
            <div className="animate-in slide-in-from-right-8 duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 3a. Order Summary Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Booking Summary</h3>
                    
                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <img src={selectedDoctor.img} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-slate-50" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{selectedDoctor.name}</h4>
                            <p className="text-sm text-slate-500 font-medium">{selectedDoctor.speciality}</p>
                            <div className="flex gap-1 mt-1"><Star size={14} className="text-yellow-400" fill="currentColor"/><span className="text-xs font-bold text-slate-400">{selectedDoctor.rating} Rating</span></div>
                        </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Patient</span>
                            <span className="text-sm font-bold text-slate-800">{bookingType === 'pet' ? formData.petName : formData.name}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Date & Day</span>
                            <span className="text-sm font-bold text-slate-800">{formData.date} ({formData.day})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Time</span>
                            <span className="text-sm font-bold text-[#00d0f1]">{formData.time}</span>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Consultation Fee</span><span className="font-bold text-slate-800">₹{selectedDoctor.fee}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Booking Charge</span><span className="font-bold text-slate-800">₹50</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tax (GST 18%)</span><span className="font-bold text-slate-800">₹{Math.round(selectedDoctor.fee * 0.18)}</span></div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
                        <span className="text-lg font-bold text-slate-800">Total Payable</span>
                        <span className="text-3xl font-black text-[#00d0f1]">₹{selectedDoctor.fee + 50 + Math.round(selectedDoctor.fee * 0.18)}</span>
                    </div>
                </div>

                {/* 3b. Payment Form */}
                <div className="bg-[#192a56] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d0f1] rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                    
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><CreditCard size={24}/> Secure Checkout</h3>
                    
                    <form className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Card Number</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-blue-200/30 focus:border-[#00d0f1] outline-none font-mono text-lg tracking-wider transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Expiry Date</label>
                                <input type="text" placeholder="MM/YY" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-blue-200/30 focus:border-[#00d0f1] outline-none font-mono text-center transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">CVV</label>
                                <input type="password" placeholder="123" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-blue-200/30 focus:border-[#00d0f1] outline-none font-mono text-center transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Card Holder Name</label>
                            <input type="text" placeholder="JOHN DOE" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-blue-200/30 focus:border-[#00d0f1] outline-none font-bold uppercase transition-all" />
                        </div>

                        <button 
                            type="button" 
                            onClick={handlePayment} 
                            className="w-full bg-[#00d0f1] hover:bg-white hover:text-[#192a56] text-[#192a56] py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                        >
                            <ShieldCheck size={22} /> Pay Now & Book
                        </button>
                        
                        <p className="text-center text-xs text-blue-300/60 mt-4 flex items-center justify-center gap-1"><ShieldCheck size={12}/> 256-bit SSL Secured Payment</p>
                    </form>
                </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default BookAppointment;