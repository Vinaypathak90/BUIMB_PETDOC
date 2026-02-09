import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Pencil, Trash2, Plus, X, Stethoscope, DollarSign, Camera, 
  User, Dog, Award, Fingerprint, ChevronDown, CheckCircle, XCircle, Star, Clock,
  ChevronLeft, ChevronRight 
} from 'lucide-react';

const Doctors = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default showing 5 items per page

  // --- SEARCH & DROPDOWN STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // --- SPECIALTIES LIST ---
  const humanSpecialties = ["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic Surgeon", "Dentist", "Pediatrician"];
  const vetSpecialties = ["General Veterinarian", "Canine Specialist", "Feline Specialist", "Avian Vet", "Reptile Specialist"];

  // --- INITIAL DOCTOR STATE ---
  const initialDoctorState = {
    id: null, name: '', type: 'human', speciality: '', licenseId: '', qualification: '', experience: '', rating: '5.0', fee: '', status: 'active', bio: '', img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };
  const [currentDoctor, setCurrentDoctor] = useState(initialDoctorState);

  // --- DUMMY DATA (Added more for pagination testing) ---
  const [doctors, setDoctors] = useState([
    { id: 1, name: "Dr. Ruby Perrin", type: "human", speciality: "Dentist", licenseId: "MED-8821", qualification: "BDS, MDS", experience: "8", rating: "9.2", fee: "500", status: "active", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 2, name: "Dr. Darren Elder", type: "veterinary", speciality: "Canine Specialist", licenseId: "VET-9901", qualification: "BVSc", experience: "12", rating: "9.8", fee: "800", status: "on-leave", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 3, name: "Dr. Deborah Angel", type: "human", speciality: "Cardiology", licenseId: "MED-2231", qualification: "MBBS, MD", experience: "15", rating: "9.5", fee: "1200", status: "inactive", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { id: 4, name: "Dr. Sofia Brient", type: "human", speciality: "Urology", licenseId: "MED-4412", qualification: "MBBS, MS", experience: "5", rating: "8.8", fee: "600", status: "active", img: "https://randomuser.me/api/portraits/women/65.jpg" },
    { id: 5, name: "Dr. Marvin Campbell", type: "veterinary", speciality: "Feline Specialist", licenseId: "VET-3321", qualification: "MVSc", experience: "7", rating: "9.0", fee: "750", status: "active", img: "https://randomuser.me/api/portraits/men/51.jpg" },
    { id: 6, name: "Dr. Katharine Berthold", type: "human", speciality: "Orthopedics", licenseId: "MED-1122", qualification: "MS Ortho", experience: "20", rating: "9.9", fee: "1500", status: "active", img: "https://randomuser.me/api/portraits/women/12.jpg" },
    { id: 7, name: "Dr. Linda Tobin", type: "human", speciality: "Neurology", licenseId: "MED-5544", qualification: "DM Neuro", experience: "10", rating: "9.4", fee: "1000", status: "active", img: "https://randomuser.me/api/portraits/women/33.jpg" },
    { id: 8, name: "Dr. Paul Richard", type: "human", speciality: "Dermatology", licenseId: "MED-9988", qualification: "MD Derma", experience: "6", rating: "8.5", fee: "700", status: "active", img: "https://randomuser.me/api/portraits/men/11.jpg" },
    { id: 9, name: "Dr. John Gibbs", type: "human", speciality: "Dentist", licenseId: "MED-7766", qualification: "BDS", experience: "4", rating: "8.0", fee: "400", status: "active", img: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 10, name: "Dr. Olga Barlow", type: "veterinary", speciality: "Avian Vet", licenseId: "VET-6655", qualification: "BVSc", experience: "9", rating: "9.6", fee: "900", status: "active", img: "https://randomuser.me/api/portraits/women/22.jpg" },
    { id: 11, name: "Dr. Julia Tamsen", type: "human", speciality: "Pediatrician", licenseId: "MED-1234", qualification: "MD Ped", experience: "11", rating: "9.3", fee: "600", status: "active", img: "https://randomuser.me/api/portraits/women/55.jpg" },
    { id: 12, name: "Dr. Lester Groove", type: "veterinary", speciality: "Reptile Specialist", licenseId: "VET-8899", qualification: "MVSc", experience: "14", rating: "9.7", fee: "1100", status: "active", img: "https://randomuser.me/api/portraits/men/66.jpg" },
  ]);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // --- HANDLERS (Same as before) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => { setCurrentDoctor(initialDoctorState); setSearchTerm(""); setIsModalOpen(true); };
  const handleEdit = (doctor) => { setCurrentDoctor(doctor); setSearchTerm(doctor.speciality); setIsModalOpen(true); };
  const handleDelete = (id) => { if(window.confirm("Remove doctor?")) setDoctors(doctors.filter(doc => doc.id !== id)); };
  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) setCurrentDoctor({ ...currentDoctor, img: URL.createObjectURL(file) }); };
  const handleSpecialtySelect = (spec) => { setCurrentDoctor({ ...currentDoctor, speciality: spec }); setSearchTerm(spec); setShowDropdown(false); };
  
  const handleSave = (e) => {
    e.preventDefault();
    if (currentDoctor.id) {
      setDoctors(doctors.map(doc => doc.id === currentDoctor.id ? currentDoctor : doc));
    } else {
      setDoctors([...doctors, { ...currentDoctor, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const activeSpecialtiesList = currentDoctor.type === 'human' ? humanSpecialties : vetSpecialties;
  const filteredSpecialties = activeSpecialtiesList.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-slate-50 min-h-screen relative">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Doctor Registry</h1>
            <button onClick={handleAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
              <Plus size={18} /> <span className="font-bold text-sm">Register New Doctor</span>
            </button>
          </div>

          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden p-6">
            
            {/* --- ENTRIES CONTROL --- */}
            <div className="flex justify-between items-center mb-4">
               <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  Show 
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                    className="border border-slate-300 rounded-md p-1 focus:outline-none focus:border-emerald-500 text-slate-700 font-bold"
                  >
                     <option value={5}>5</option>
                     <option value={10}>10</option>
                     <option value={20}>20</option>
                  </select> 
                  entries
               </div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Total Doctors: {doctors.length}
               </div>
            </div>

            {/* --- TABLE --- */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Profile</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Speciality</th>
                    <th className="px-6 py-4">Exp / Rating</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={doc.img} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
                          <div>
                            <span className="font-bold text-slate-700 block">{doc.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{doc.qualification}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.type === 'human' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold border border-blue-100"><User size={12} /> Human</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-bold border border-orange-100"><Dog size={12} /> Vet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{doc.speciality}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-700">{doc.experience} Yrs Exp</div>
                        <div className="text-[10px] flex items-center gap-1 text-emerald-600 font-bold"><Star size={10} fill="currentColor" /> {doc.rating}/10</div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.status === 'active' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Active</span>}
                        {doc.status === 'inactive' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Inactive</span>}
                        {doc.status === 'on-leave' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">On Leave</span>}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(doc)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 border-t border-slate-100 pt-4">
                <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                    Showing <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, doctors.length)}</span> of <span className="font-bold text-slate-800">{doctors.length}</span> entries
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-3.5 py-1.5 text-sm font-bold rounded-lg transition-all ${
                                currentPage === i + 1 
                                ? 'bg-[#192a56] text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={nextPage} 
                        disabled={currentPage === totalPages}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

          </div>
        </main>
      </div>

      {/* --- MODAL (Same as previous code, keeping logic intact) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-[#192a56] p-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-white font-bold text-lg">{currentDoctor.id ? 'Edit Doctor Profile' : 'Register New Professional'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6">
              {/* Form Content same as your previous request - keeping it concise here but it is included in full file */}
              {/* Image & Type */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-slate-100">
                 <div className="relative group cursor-pointer w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                    <img src={currentDoctor.img} alt="Profile" className="w-full h-full rounded-xl object-cover border-2 border-slate-100" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white w-8 h-8" /></div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <div className="flex-1 space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Professional Category</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => {setCurrentDoctor({...currentDoctor, type: 'human'}); setSearchTerm('');}} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${currentDoctor.type === 'human' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}><User size={18} /> <span className="text-sm font-bold">Doctor</span></button>
                        <button type="button" onClick={() => {setCurrentDoctor({...currentDoctor, type: 'veterinary'}); setSearchTerm('');}} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${currentDoctor.type === 'veterinary' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Dog size={18} /> <span className="text-sm font-bold">Veterinary</span></button>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input type="text" required value={currentDoctor.name} onChange={(e) => setCurrentDoctor({...currentDoctor, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div>
                  <div className="col-span-2 sm:col-span-1 relative" ref={dropdownRef}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Speciality</label>
                    <div className="relative"><Stethoscope size={16} className="absolute top-3 left-3 text-slate-400" /><input type="text" value={searchTerm} onClick={() => setShowDropdown(true)} onChange={(e) => {setSearchTerm(e.target.value); setShowDropdown(true);}} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /><ChevronDown size={16} className="absolute top-3 right-3 text-slate-400" /></div>
                    {showDropdown && (<ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">{filteredSpecialties.map((spec, i) => (<li key={i} onClick={() => handleSpecialtySelect(spec)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50">{spec}</li>))}</ul>)}
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qualification</label><div className="relative"><Award size={16} className="absolute top-3 left-3 text-slate-400" /><input type="text" required value={currentDoctor.qualification} onChange={(e) => setCurrentDoctor({...currentDoctor, qualification: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exp (Yrs)</label><input type="number" value={currentDoctor.experience} onChange={(e) => setCurrentDoctor({...currentDoctor, experience: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rating</label><input type="number" step="0.1" max="10" value={currentDoctor.rating} onChange={(e) => setCurrentDoctor({...currentDoctor, rating: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">License ID</label><div className="relative"><Fingerprint size={16} className="absolute top-3 left-3 text-slate-400" /><input type="text" value={currentDoctor.licenseId} onChange={(e) => setCurrentDoctor({...currentDoctor, licenseId: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fee</label><div className="relative"><DollarSign size={16} className="absolute top-3 left-3 text-slate-400" /><input type="number" value={currentDoctor.fee} onChange={(e) => setCurrentDoctor({...currentDoctor, fee: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-emerald-500 outline-none font-medium" /></div></div>
                  <div className="col-span-2 mt-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'active'})} className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${currentDoctor.status === 'active' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><CheckCircle size={14} /> Active</button>
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'inactive'})} className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${currentDoctor.status === 'inactive' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-500'}`}><XCircle size={14} /> Inactive</button>
                        <button type="button" onClick={() => setCurrentDoctor({...currentDoctor, status: 'on-leave'})} className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${currentDoctor.status === 'on-leave' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-500'}`}><Clock size={14} /> On Leave</button>
                    </div>
                  </div>
              </div>
              <button type="submit" className="w-full bg-[#192a56] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg mt-8">{currentDoctor.id ? 'Save Changes' : 'Complete Registration'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;