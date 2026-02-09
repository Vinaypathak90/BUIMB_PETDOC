import React, { useState, useRef } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Pencil, Trash2, Plus, X, User, Dog, FileText, Calendar, 
  MapPin, Phone, Upload, DollarSign, Clock, CheckCircle
} from 'lucide-react';

const Patients = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- INITIAL STATE ---
  const initialPatientState = {
    id: null,
    patientId: '', // PT001
    name: '',
    type: 'human', // 'human' or 'pet'
    ownerName: '', // Only for pets
    breed: '',     // Only for pets (or specific info for human)
    age: '',
    gender: '',
    phone: '',
    address: '',
    lastVisit: '',
    paid: '',
    medicalHistory: null, // File
    status: 'active',
    img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  const [currentPatient, setCurrentPatient] = useState(initialPatientState);

  // --- DUMMY DATA ---
  const [patients, setPatients] = useState([
    { 
      id: 1, 
      patientId: "PT001",
      name: "Charlene Reed", 
      type: "human", 
      age: "29",
      address: "4417 Goosetown Drive, NC",
      phone: "8286329170",
      lastVisit: "20 Oct 2026",
      paid: "100.00",
      status: "active",
      img: "https://randomuser.me/api/portraits/women/22.jpg" 
    },
    { 
      id: 2, 
      patientId: "PT002",
      name: "Bruno", 
      type: "pet", 
      ownerName: "Travis Trimble",
      breed: "Labrador",
      age: "4",
      address: "4026 Fantages Way, Maine",
      phone: "2077299974",
      lastVisit: "22 Oct 2026",
      paid: "200.00",
      status: "active",
      img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100" 
    },
    { 
      id: 3, 
      patientId: "PT003",
      name: "Carl Kelly", 
      type: "human", 
      age: "29",
      address: "2037 Pearcy Avenue, Indiana",
      phone: "2607247769",
      lastVisit: "21 Oct 2026",
      paid: "250.00",
      status: "active",
      img: "https://randomuser.me/api/portraits/men/45.jpg" 
    },
    { 
      id: 4, 
      patientId: "PT004",
      name: "Milo", 
      type: "pet", 
      ownerName: "Gina Moore",
      breed: "Persian Cat",
      age: "2",
      address: "888 Everette Alley, Florida",
      phone: "9548207887",
      lastVisit: "18 Sep 2026",
      paid: "350.00",
      status: "active",
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100" 
    }
  ]);

  // --- HANDLERS ---
  const handleAdd = () => {
    setCurrentPatient({ ...initialPatientState, patientId: `PT00${patients.length + 1}` });
    setIsModalOpen(true);
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm("Remove patient record?")) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setCurrentPatient({ ...currentPatient, img: URL.createObjectURL(file) });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setCurrentPatient({ ...currentPatient, medicalHistory: file.name });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentPatient.id) {
      setPatients(patients.map(p => p.id === currentPatient.id ? currentPatient : p));
    } else {
      setPatients([...patients, { ...currentPatient, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen relative">
      {/* Sidebar & Header */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <AdminSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      <div className="lg:ml-64 transition-all">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="pt-24 px-8 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Patients List</h1>
            <button onClick={handleAdd} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
              <Plus size={18} /> <span className="font-bold text-sm">Add New Patient</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Patient ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">#{patient.patientId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={patient.img} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                          <div>
                            <span className="font-bold text-slate-700 block">{patient.name}</span>
                            {patient.type === 'pet' ? (
                               <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                                 <Dog size={10} /> Owner: {patient.ownerName}
                               </span>
                            ) : (
                               <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
                                 <User size={10} /> Human
                               </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{patient.age}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{patient.address}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{patient.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-bold">{patient.lastVisit}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">${patient.paid}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(patient)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(patient.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* --- EDIT/ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            <div className="bg-[#192a56] p-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-white font-bold text-lg">{currentPatient.id ? 'Edit Patient Details' : 'Register New Patient'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              
              {/* Top: Category Toggle */}
              <div className="flex justify-center gap-4 mb-6">
                 <button type="button" onClick={() => setCurrentPatient({...currentPatient, type: 'human'})} className={`flex-1 py-2 rounded-lg border font-bold flex items-center justify-center gap-2 ${currentPatient.type === 'human' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'text-slate-400 border-slate-200'}`}>
                    <User size={18} />  Patient
                 </button>
                 <button type="button" onClick={() => setCurrentPatient({...currentPatient, type: 'pet'})} className={`flex-1 py-2 rounded-lg border font-bold flex items-center justify-center gap-2 ${currentPatient.type === 'pet' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' : 'text-slate-400 border-slate-200'}`}>
                    <Dog size={18} /> Pet Patient
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Image & Name */}
                  <div className="col-span-2 flex items-center gap-4">
                     <div className="relative w-20 h-20 flex-shrink-0 cursor-pointer group">
                        <img src={currentPatient.img} alt="Profile" className="w-full h-full rounded-xl object-cover border-2 border-slate-100" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">Upload</div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            {currentPatient.type === 'human' ? 'Patient Name' : 'Pet Name'}
                        </label>
                        <input type="text" required value={currentPatient.name} onChange={(e) => setCurrentPatient({...currentPatient, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                     </div>
                  </div>

                  {/* Conditional Fields based on Type */}
                  {currentPatient.type === 'pet' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Owner Name</label>
                        <input type="text" value={currentPatient.ownerName} onChange={(e) => setCurrentPatient({...currentPatient, ownerName: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Breed / Species</label>
                        <input type="text" value={currentPatient.breed} onChange={(e) => setCurrentPatient({...currentPatient, breed: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none font-medium" placeholder="e.g. Labrador" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                    <input type="text" value={currentPatient.age} onChange={(e) => setCurrentPatient({...currentPatient, age: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                  </div>

                  {currentPatient.type === 'human' && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                       <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none font-medium bg-white">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                       </select>
                     </div>
                  )}

                  {/* Contact Info */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone size={16} className="absolute top-2.5 left-3 text-slate-400" />
                        <input type="text" value={currentPatient.phone} onChange={(e) => setCurrentPatient({...currentPatient, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute top-2.5 left-3 text-slate-400" />
                        <input type="text" value={currentPatient.address} onChange={(e) => setCurrentPatient({...currentPatient, address: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                    </div>
                  </div>

                  {/* Medical History File Upload */}
                  <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Medical History / Reports</label>
                     <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 shadow-sm">
                           <Upload size={16} /> Choose File
                           <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        <span className="text-xs text-slate-400 italic">
                           {currentPatient.medicalHistory ? `Selected: ${currentPatient.medicalHistory}` : 'No file chosen (PDF, JPG)'}
                        </span>
                     </div>
                  </div>

                  {/* Appointment & Payment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Visit Date</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute top-2.5 left-3 text-slate-400" />
                        <input type="date" value={currentPatient.lastVisit} onChange={(e) => setCurrentPatient({...currentPatient, lastVisit: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:border-emerald-500 outline-none font-medium text-slate-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Paid</label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute top-2.5 left-3 text-slate-400" />
                        <input type="number" value={currentPatient.paid} onChange={(e) => setCurrentPatient({...currentPatient, paid: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:border-emerald-500 outline-none font-medium" />
                    </div>
                  </div>

              </div>

              <button type="submit" className="w-full bg-[#192a56] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg mt-8">
                {currentPatient.id ? 'Save Changes' : 'Register Patient'}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
