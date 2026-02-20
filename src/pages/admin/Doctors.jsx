import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Pencil, Trash2, Plus, X, Stethoscope, DollarSign, Camera, 
  User, Dog, Award, Fingerprint, ChevronDown, CheckCircle, XCircle, Star, Clock,
  ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Doctors = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- PAGINATION & DATA STATE ---
  const [doctors, setDoctors] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // --- SEARCH & DROPDOWN STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const humanSpecialties = ["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic Surgeon", "Dentist", "Pediatrician"];
  const vetSpecialties = ["General Veterinarian", "Canine Specialist", "Feline Specialist", "Avian Vet", "Reptile Specialist"];

  const initialDoctorState = {
    name: '', type: 'human', speciality: '', licenseId: '', qualification: '', 
    experience: '', rating: 5.0, fee: '', status: 'active', bio: '', 
    img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };
  const [currentDoctor, setCurrentDoctor] = useState(initialDoctorState);

  // --- 1. FETCH DOCTORS FROM BACKEND ---
  const fetchDoctors = async () => {
    setIsLoading(true);
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    if (!storedData) { navigate('/login'); return; }

    try {
      const res = await fetch('http://localhost:5000/api/admin/doctors', {
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      const data = await res.json();
      if (res.ok) setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [navigate]);

  // --- 2. DELETE DOCTOR ---
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this doctor permanently from the database?")) return;
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      if (res.ok) fetchDoctors();
    } catch (err) {
      alert("Delete operation failed");
    }
  };

  // --- 3. SAVE / UPDATE DOCTOR ---
const handleSave = async (e) => {
    e.preventDefault();
    const storedData = JSON.parse(localStorage.getItem('user_token'));

    // 🚨 YAHAN FIX HAI: Pata lagao ki ye naya doctor hai ya edit ho raha hai
    // Agar currentDoctor mein pehle se _id majood hai, matlab edit ho raha hai
    const doctorId = currentDoctor._id || currentDoctor.id; 
    const isEdit = Boolean(doctorId);

    // Agar Edit hai toh PUT method aur uski ID wali URL use hogi, warna POST.
    const url = isEdit 
        ? `http://localhost:5000/api/admin/doctors/${doctorId}` 
        : 'http://localhost:5000/api/admin/doctors';
        
    const fetchMethod = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: fetchMethod, // Naya hai toh POST, Edit hai toh PUT
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedData.token}` 
            },
            body: JSON.stringify(currentDoctor)
        });

        const data = await res.json();

        if (res.ok) {
            alert(isEdit ? "Doctor updated successfully!" : "Doctor added successfully!");
            setIsModalOpen(false);
            fetchDoctors(); // Table ko refresh karne ka function
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("Save operation failed:", err);
        alert("Server connection failed!");
    }
};
  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- MODAL & IMAGE HANDLERS ---
  const handleAdd = () => { setCurrentDoctor(initialDoctorState); setSearchTerm(""); setIsModalOpen(true); };
  const handleEdit = (doctor) => { setCurrentDoctor(doctor); setSearchTerm(doctor.speciality); setIsModalOpen(true); };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentDoctor({ ...currentDoctor, img: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSpecialtySelect = (spec) => { 
    setCurrentDoctor({ ...currentDoctor, speciality: spec }); 
    setSearchTerm(spec); 
    setShowDropdown(false); 
  };

  const activeSpecialtiesList = currentDoctor.type === 'human' ? humanSpecialties : vetSpecialties;
  const filteredSpecialties = activeSpecialtiesList.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#192a56] mb-4" size={40} />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Syncing Registry...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Doctor Management</h1>
                <p className="text-slate-500 text-sm font-medium">Add, update or remove medical professionals.</p>
            </div>
            <button onClick={handleAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
              <Plus size={20} /> Register New
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            
            <div className="flex justify-between items-center mb-6">
               <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  SHOW 
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-slate-50 border rounded-lg px-2 py-1 text-slate-700 outline-none">
                     <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                  </select> 
               </div>
               <div className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">Total Active: {doctors.length}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Professional</th>
                    <th className="px-6 py-4 text-center">Type</th>
                    <th className="px-6 py-4">Speciality</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDoctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img src={doc.img} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white group-hover:border-emerald-500 transition-all" />
                          <div>
                            <span className="font-bold text-slate-800 block text-base">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{doc.qualification}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {doc.type === 'human' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase"><User size={12} /> Human</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black border border-orange-100 uppercase"><Dog size={12} /> Veterinary</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{doc.speciality}</td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-slate-800">{doc.experience} Years</div>
                        <div className="text-[10px] flex items-center gap-1 text-amber-500 font-bold"><Star size={10} fill="currentColor" /> {doc.rating} / 10.0</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            doc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            doc.status === 'on-leave' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right flex justify-end gap-3 mt-1">
                        <button onClick={() => handleEdit(doc)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-[#192a56] hover:text-white transition-all shadow-sm"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(doc._id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-10 gap-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-xl hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"><ChevronLeft size={20}/></button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => paginate(i+1)} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i+1 ? 'bg-[#192a56] text-white shadow-lg' : 'bg-white border text-slate-500 hover:border-[#192a56]'}`}>{i+1}</button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-xl hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"><ChevronRight size={20}/></button>
                </div>
            </div>

          </div>
        </main>
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#192a56]/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <div><h3 className="text-2xl font-black text-slate-800">{currentDoctor._id ? 'Update Profile' : 'New Registration'}</h3><p className="text-slate-500 text-xs font-bold uppercase mt-1">Professional Verification details</p></div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="relative group cursor-pointer w-32 h-32 flex-shrink-0">
                    <img src={currentDoctor.img} alt="" className="w-full h-full rounded-3xl object-cover border-4 border-slate-100 shadow-xl" />
                    <label className="absolute -bottom-2 -right-2 bg-[#192a56] text-white p-2.5 rounded-2xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                        <Camera size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Category</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, type: 'human'})} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold transition-all ${currentDoctor.type === 'human' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><User size={20}/> Human</button>
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, type: 'veterinary'})} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold transition-all ${currentDoctor.type === 'veterinary' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-inner' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Dog size={20}/> Vet</button>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label><input type="text" required value={currentDoctor.name} onChange={(e) => setCurrentDoctor({...currentDoctor, name: e.target.value})} className="w-full bg-slate-50 border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700" placeholder="Enter Dr. Full Name" /></div>
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Speciality</label>
                    <div className="relative"><Stethoscope size={18} className="absolute top-4 left-4 text-slate-400" /><input type="text" value={searchTerm} onClick={() => setShowDropdown(true)} onChange={(e) => {setSearchTerm(e.target.value); setShowDropdown(true);}} className="w-full bg-slate-50 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none border-transparent focus:ring-2 focus:ring-emerald-500" placeholder="Search..." /></div>
                    {showDropdown && (<ul className="absolute z-[110] w-full bg-white border rounded-2xl shadow-2xl mt-2 max-h-48 overflow-y-auto">{filteredSpecialties.map((spec, i) => (<li key={i} onClick={() => handleSpecialtySelect(spec)} className="px-5 py-3 hover:bg-emerald-50 cursor-pointer text-sm font-bold text-slate-700">{spec}</li>))}</ul>)}
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">License / Reg ID</label><div className="relative"><Fingerprint size={18} className="absolute top-4 left-4 text-slate-400" /><input type="text" value={currentDoctor.licenseId} onChange={(e) => setCurrentDoctor({...currentDoctor, licenseId: e.target.value})} className="w-full bg-slate-50 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none" placeholder="e.g. MED-001" /></div></div>
                  <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Earned Qualification</label><input type="text" value={currentDoctor.qualification} onChange={(e) => setCurrentDoctor({...currentDoctor, qualification: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" placeholder="MBBS, MD..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Exp (Yrs)</label><input type="number" value={currentDoctor.experience} onChange={(e) => setCurrentDoctor({...currentDoctor, experience: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Fee (₹)</label><input type="number" value={currentDoctor.fee} onChange={(e) => setCurrentDoctor({...currentDoctor, fee: e.target.value})} className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none" /></div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Current Status</label>
                    <div className="grid grid-cols-3 gap-4">
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'active'})} className={`py-3 rounded-2xl font-bold text-xs ${currentDoctor.status === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>Active</button>
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'inactive'})} className={`py-3 rounded-2xl font-bold text-xs ${currentDoctor.status === 'inactive' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>Inactive</button>
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'on-leave'})} className={`py-3 rounded-2xl font-bold text-xs ${currentDoctor.status === 'on-leave' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>On Leave</button>
                    </div>
                  </div>
              </div>

              <button type="submit" className="w-full bg-[#192a56] text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98]">
                {currentDoctor._id ? 'Update Professional Profile' : 'Commit Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;