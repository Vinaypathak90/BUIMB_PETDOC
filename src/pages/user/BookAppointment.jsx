import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  User, Dog, Calendar, Clock, Search, FileText, X, CheckCircle, 
  ChevronDown, Stethoscope, CreditCard, ArrowLeft, Star, ShieldCheck,
  CalendarDays, Upload, Activity, MapPin, Phone
} from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- STEPS STATE (1: Form, 2: Select Doctor, 3: Payment) ---
  const [step, setStep] = useState(1); 
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]); 
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // --- FORM STATE ---
  const [bookingType, setBookingType] = useState('myself'); 
  const [formData, setFormData] = useState({
    name: '', 
    age: '', 
    gender: 'Male', 
    phone: '',    // ✅ Phone Number field
    address: '',  // ✅ Address field
    problem: '', 
    date: '', 
    time: '', 
    day: '',
    symptoms: '', 
    petType: 'Dog', 
    petName: '',
    medicalReport: '', 
    fileName: ''      
  });

  // Autocomplete State
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSpecs, setFilteredSpecs] = useState([]);
  const searchRef = useRef(null);

  const specialtiesList = [
    "Dentist", "Cardiology", "Urology", "Neurology", "Orthopedics", 
    "Pet Surgery", "Pet Orthopedics", "General Veterinary", "Dermatology",
    "General Physician", "Pediatrician", "Gynecologist"
  ];

  const petTypes = ["Dog", "Cat", "Bird", "Rabbit", "Fish"];

  // --- INITIAL LOAD & DATA FETCHING ---
  useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/appointments/doctors');
            const data = await res.json();
            setDoctorsList(data);
        } catch (error) {
            console.error("Failed to load doctors", error);
        }
    };
    fetchDoctors();

    const fetchProfile = async () => {
        const storedData = JSON.parse(localStorage.getItem('user_token'));
        if(storedData) {
            try {
                const res = await fetch('http://localhost:5000/api/user/dashboard', {
                    headers: { 'Authorization': `Bearer ${storedData.token}` }
                });
                const data = await res.json();
                if(data.profile) {
                    setFormData(prev => ({
                        ...prev, 
                        name: (bookingType === 'myself' || bookingType === 'pet') ? (data.profile.name || '') : '', 
                        phone: data.profile.phone || '',
                        address: data.profile.address || '' 
                    }));
                }
            } catch (err) { console.error(err); }
        }
    };
    fetchProfile();

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

    if (name === 'date') {
        const d = new Date(value);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        setFormData(prev => ({ ...prev, date: value, day: dayName }));
    }
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Please upload under 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setFormData(prev => ({ 
                ...prev, 
                medicalReport: reader.result, 
                fileName: file.name 
            }));
            setTimeout(() => alert("Report scanned & attached successfully!"), 500);
        };
    }
  };

  const handleFindDoctors = (e) => {
    e.preventDefault();
    // ✅ Form Validation (Ensuring all fields including Phone & Address are filled)
    if (!formData.phone || !formData.address || !formData.problem || !formData.date || !formData.time) {
      alert("Please fill all details including Phone Number and Address.");
      return;
    }
    setStep(2);
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  const handlePayment = async () => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    if(!storedData) {
        alert("Please login to book.");
        navigate('/login');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedData.token}`
            },
            body: JSON.stringify({
                doctor: selectedDoctor,
                formData: formData, 
                bookingType: bookingType
            })
        });

        if (response.ok) {
            alert("Payment Successful! Appointment Approved.");
            navigate('/user/dashboard');
        } else {
            const err = await response.json();
            alert("Booking Failed: " + err.message);
        }
    } catch (error) {
        alert("Server Error. Please try again.");
    }
  };

  const matchingDoctors = doctorsList.filter(doc => 
    doc.speciality.toLowerCase().includes(formData.problem.toLowerCase()) || 
    (formData.problem.toLowerCase().includes("pet") && doc.speciality.toLowerCase().includes("pet")) ||
    (formData.problem.toLowerCase().includes("dentist") && doc.speciality.toLowerCase().includes("dentist"))
  );

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans text-slate-900">
      {/* Sidebar Overlay for Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>}
                <div>
                    <h2 className="text-xl font-black text-slate-800">
                        {step === 1 ? 'Patient Details' : step === 2 ? 'Available Specialists' : 'Secure Payment'}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Step {step} of 3</p>
                </div>
            </div>
        </header>
        
        <main className="p-8 max-w-5xl mx-auto">
          
          {/* --- STEP 1: PATIENT INFO & ADDRESS --- */}
          {step === 1 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 animate-in slide-in-from-right-8 duration-300">
                
                {/* Booking Type Switcher */}
                <div className="flex justify-center gap-2 mb-8 bg-slate-100 w-fit mx-auto p-1 rounded-full">
                    {['myself', 'pet', 'other'].map((type) => (
                        <button 
                            key={type}
                            type="button"
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
                        
                        {/* Dynamic Patient Fields */}
                        {bookingType === 'pet' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Name</label>
                                    <input type="text" name="petName" required value={formData.petName} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] focus:ring-1 focus:ring-[#00d0f1] outline-none transition-all" placeholder="e.g. Bruno" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Type</label>
                                    <select name="petType" value={formData.petType} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white outline-none focus:border-[#00d0f1]">
                                        {petTypes.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] focus:ring-1 focus:ring-[#00d0f1] outline-none transition-all" placeholder="Full Legal Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                                        <input type="number" name="age" required value={formData.age} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="Age" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-[#00d0f1]">
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Phone Number Field - ✅ ADDED */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Phone size={14}/> Phone Number
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                required 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none transition-all" 
                                placeholder="+91 00000 00000" 
                            />
                        </div>

                        {/* Speciality Search */}
                        <div className="relative" ref={searchRef}>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Looking For (Specialist)</label>
                            <div className="relative">
                                <Search size={18} className="absolute top-3.5 left-3 text-slate-400"/>
                                <input type="text" name="problem" value={formData.problem} onChange={handleSearchChange} onFocus={() => setShowDropdown(true)} required className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none transition-all" placeholder="e.g. Dentist, Cardiology" autoComplete="off" />
                            </div>
                            {showDropdown && filteredSpecs.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                                    {filteredSpecs.map((spec, i) => (
                                        <li key={i} onClick={() => selectSpecialty(spec)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0">{spec}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Address Field - ✅ ADDED */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <MapPin size={14}/> Complete Residential Address
                            </label>
                            <textarea 
                                name="address" 
                                required 
                                rows="2"
                                value={formData.address} 
                                onChange={handleInputChange} 
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none transition-all resize-none" 
                                placeholder="Street Name, Landmark, City, Pincode"
                            ></textarea>
                        </div>

                        {/* Symptoms */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brief Symptoms</label>
                            <input type="text" name="symptoms" value={formData.symptoms} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-[#00d0f1] outline-none" placeholder="e.g. Fever from 2 days, Back pain" />
                        </div>

                        {/* Report Upload */}
                        <div className="md:col-span-2 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900">Upload Old Medical Report (Optional)</p>
                                <p className="text-xs text-blue-500">Max size 5MB. Formats: PDF, JPG, PNG.</p>
                            </div>
                            <label className="cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm border border-blue-100 flex items-center gap-2 hover:bg-blue-50 transition-all">
                                <Upload size={16} /> 
                                {formData.fileName ? formData.fileName.substring(0, 12) + '...' : 'Select File'}
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Scheduling Section */}
                        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 font-black uppercase text-xs tracking-widest"><CalendarDays size={18} className="text-[#00d0f1]"/> Appointment Slot</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white focus:border-[#00d0f1] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Time</label>
                                    <input type="time" name="time" required value={formData.time} onChange={handleInputChange} className="w-full border border-slate-300 rounded-xl px-4 py-3 font-bold text-slate-700 bg-white focus:border-[#00d0f1] outline-none" />
                                </div>
                            </div>
                            {formData.day && <p className="text-xs font-bold text-[#00d0f1] mt-3">Selected: {formData.day}</p>}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#00d0f1] text-[#192a56] py-4 rounded-xl font-black text-lg hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                        Search Best Doctors <CheckCircle size={20} />
                    </button>
                </form>
            </div>
          )}

          {/* --- STEP 2: DOCTOR SELECTION --- */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Available {formData.problem} Specialists</h3>
                        <p className="text-sm text-slate-500">{formData.date} | {formData.time}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingDoctors.length > 0 ? (
                        matchingDoctors.map((doc) => (
                            <div key={doc._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#00d0f1] hover:shadow-lg transition-all flex gap-4 group cursor-pointer" onClick={() => handleSelectDoctor(doc)}>
                                <img src={doc.img} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-[#00d0f1] transition-colors">{doc.name}</h4>
                                    <p className="text-sm text-slate-500 font-medium">{doc.speciality}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor"/> {doc.rating}</span>
                                        <span>•</span>
                                        <span>{doc.exp} Years Exp</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-between">
                                    <span className="text-lg font-black text-emerald-600">₹{doc.fee}</span>
                                    <button className="bg-[#192a56] text-white px-4 py-2 rounded-lg text-xs font-bold">Book Now</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Stethoscope size={48} className="mx-auto text-slate-200 mb-4"/>
                            <p className="text-slate-500 font-bold text-lg">No doctors found for "{formData.problem}"</p>
                            <button onClick={() => setStep(1)} className="mt-4 text-[#00d0f1] font-bold underline">Modify Search</button>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* --- STEP 3: BILLING & PAYMENT --- */}
          {step === 3 && selectedDoctor && (
            <div className="animate-in slide-in-from-right-8 duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 3a. Summary Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Booking Summary</h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <img src={selectedDoctor.img} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{selectedDoctor.name}</h4>
                            <p className="text-sm text-slate-500">{selectedDoctor.speciality}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Patient & Contact</span>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">{bookingType === 'pet' ? formData.petName : formData.name}</p>
                                <p className="text-xs font-bold text-slate-500">{formData.phone}</p> {/* ✅ Displaying Phone */}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Address</span>
                            <span className="text-sm font-bold text-slate-800 text-right max-w-[160px] leading-tight truncate">{formData.address}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Schedule</span>
                            <span className="text-sm font-bold text-[#00d0f1]">{formData.date} at {formData.time}</span>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm px-1">
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Consultation Fee</span><span className="font-bold text-slate-800">₹{selectedDoctor.fee}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Service & Platform Fee</span><span className="font-bold text-slate-800">₹50</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">GST (18%)</span><span className="font-bold text-slate-800">₹{Math.round(selectedDoctor.fee * 0.18)}</span></div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-2">
                            <span className="text-lg font-black text-slate-800">Total</span>
                            <span className="text-3xl font-black text-[#00d0f1]">₹{selectedDoctor.fee + 50 + Math.round(selectedDoctor.fee * 0.18)}</span>
                        </div>
                    </div>
                </div>

                {/* 3b. Payment Module */}
                <div className="bg-[#192a56] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d0f1] rounded-full blur-[90px] opacity-20 -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10"><CreditCard size={24}/> Pay Securely</h3>
                    
                    <form className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Card Number</label>
                            <input type="text" maxLength="19" placeholder="0000 0000 0000 0000" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-blue-200/30 focus:border-[#00d0f1] outline-none font-mono text-lg tracking-wider" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white text-center outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-200 uppercase mb-2">CVV</label>
                                <input type="password" maxLength="3" placeholder="***" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white text-center outline-none" />
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handlePayment} 
                            className="w-full bg-[#00d0f1] hover:bg-white hover:text-[#192a56] text-[#192a56] py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                        >
                            <ShieldCheck size={22} /> Confirm & Pay
                        </button>
                        
                        <p className="text-center text-[10px] text-blue-300/50 mt-4 uppercase font-bold tracking-widest flex items-center justify-center gap-1">
                            <ShieldCheck size={10}/> 256-bit AES Encryption Active
                        </p>
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