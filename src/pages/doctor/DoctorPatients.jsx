import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Search, Filter, MapPin, Phone, Mail, 
  Calendar, Clock, FileText, User, Activity, CreditCard, 
  CheckCircle, X, ChevronLeft, Video, Home, Layout, 
  MessageSquare, Plus, Download, Printer, Share2, 
  File, UploadCloud, Trash2, Edit, Stethoscope, Droplet, Save
} from 'lucide-react';

const DoctorPatients = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); 
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const [sessionTime, setSessionTime] = useState(0); 
  const [medications, setMedications] = useState([]); 
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '', height: '', spo2: '' });
  const [clinicalNotes, setClinicalNotes] = useState({ symptoms: '', diagnosis: '', advice: '' });

  const initialFormState = { firstName: '', lastName: '', email: '', phone: '', age: '', gender: 'Male', bloodGroup: 'O+', location: '' };
  const [newPatient, setNewPatient] = useState(initialFormState);
  const [editPatient, setEditPatient] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const getToken = () => {
    let token = "";
    try {
        const uToken = JSON.parse(localStorage.getItem('user_token'));
        const uInfo = JSON.parse(localStorage.getItem('userInfo'));
        const uRaw = localStorage.getItem('token');
        if (uToken?.token) token = uToken.token;
        else if (uInfo?.token) token = uInfo.token;
        else if (uRaw && !uRaw.startsWith('{')) token = uRaw;
    } catch (e) {}
    return token;
  };

  useEffect(() => {
    const fetchPatients = async () => {
        try {
            const token = getToken();
            if (!token) return;
            const res = await fetch('http://localhost:5000/api/doctor/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPatients(data);
            }
        } catch (error) {
            console.error("Fetch Patients Error", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'consult') {
        interval = setInterval(() => { setSessionTime((prev) => prev + 1); }, 1000);
    } else {
        setSessionTime(0); 
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e, isEdit = false) => {
      const { name, value } = e.target;
      if(isEdit) setEditPatient(prev => ({ ...prev, [name]: value }));
      else setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if(!newPatient.firstName || !newPatient.phone) return alert("Fill Name and Phone.");
    try {
        const token = getToken();
        const res = await fetch('http://localhost:5000/api/doctor/patients', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(newPatient)
        });
        const data = await res.json();
        if (res.ok) {
            setPatients([data.patient, ...patients]); 
            setShowAddPatientModal(false);
            setNewPatient(initialFormState);
            alert("Patient Added Successfully!");
        } else alert(data.message);
    } catch (error) { alert("Server Error."); }
  };

  const openEditModal = (patient, e) => {
      e.stopPropagation();
      const nameParts = patient.name.split(' ');
      setEditPatient({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: patient.email !== 'N/A' ? patient.email : '',
          phone: patient.phone,
          age: patient.age !== 'N/A' ? patient.age : '',
          gender: patient.gender !== 'N/A' ? patient.gender : 'Male',
          bloodGroup: patient.bloodGroup || 'O+',
          location: patient.location !== 'Unknown Location' ? patient.location : ''
      });
      setEditingId(patient._id || patient.id);
      setShowEditPatientModal(true);
  };

  const handleEditPatientSubmit = async (e) => {
      e.preventDefault();
      try {
          const token = getToken();
          const res = await fetch(`http://localhost:5000/api/doctor/patients/${editingId}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(editPatient)
          });
          if (res.ok) {
              const fullName = `${editPatient.firstName} ${editPatient.lastName}`.trim();
              const updatedList = patients.map(p => {
                  if(p.id === editingId || p._id === editingId) {
                      return { ...p, name: fullName, phone: editPatient.phone, age: editPatient.age, gender: editPatient.gender, bloodGroup: editPatient.bloodGroup, location: editPatient.location };
                  }
                  return p;
              });
              setPatients(updatedList);
              if(selectedPatient && (selectedPatient.id === editingId || selectedPatient._id === editingId)) {
                  setSelectedPatient({ ...selectedPatient, name: fullName, phone: editPatient.phone, age: editPatient.age, gender: editPatient.gender, bloodGroup: editPatient.bloodGroup, location: editPatient.location });
              }
              setShowEditPatientModal(false);
              alert("Patient Updated Successfully!");
          } else alert("Failed to update patient.");
      } catch (error) { alert("Server Error."); }
  };

  const handleDeletePatient = async (id, _id, e) => {
      e.stopPropagation(); 
      if(window.confirm("Are you sure you want to delete this patient?")) {
          try {
              const token = getToken();
              const deleteId = _id || id; 
              const res = await fetch(`http://localhost:5000/api/doctor/patients/${deleteId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                  setPatients(patients.filter(p => p.id !== id && p._id !== _id));
                  if(selectedPatient && (selectedPatient.id === id || selectedPatient._id === _id)) setSelectedPatient(null);
              }
          } catch(err) { alert("Failed to delete."); }
      }
  };

  const handleExportCSV = () => {
      if (patients.length === 0) return alert("No data to export.");
      const headers = ["Patient ID", "Name", "Age", "Gender", "Blood Group", "Phone", "Location", "Status", "Total Paid"];
      const rows = patients.map(p => [
          p.id, `"${p.name}"`, p.age || "N/A", p.gender || "N/A", p.bloodGroup || "O+", `"${p.phone}"`, `"${p.location}"`, p.status, p.totalPaid || 0
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `patients_list_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const addMedicationRow = () => {
    setMedications([...medications, { name: '', type: 'Tablet', dosage: '1-0-1', duration: '3 Days' }]);
  };

  const removeMedicationRow = (index) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const handleMedChange = (index, field, value) => {
      const newMeds = [...medications];
      newMeds[index][field] = value;
      setMedications(newMeds);
  };

  const handleEndConsultation = () => {
    if(!clinicalNotes.diagnosis && medications.length === 0) {
        alert("Please enter a diagnosis or prescribe medicine before saving.");
        return;
    }
    const newRecord = { 
        id: Date.now(), 
        date: new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}), 
        title: `Consultation: ${clinicalNotes.diagnosis || 'General Checkup'}`, 
        type: "Rx", 
        doctor: "You",
        details: { vitals, notes: clinicalNotes, medications } 
    };
    const updatedList = patients.map(p => {
        if(p.id === selectedPatient.id) {
            return { 
                ...p, 
                records: [newRecord, ...(p.records || [])],
                vitals: vitals.bp ? vitals : p.vitals 
            };
        }
        return p;
    });
    setPatients(updatedList);
    setSelectedPatient(prev => ({ 
        ...prev, 
        records: [newRecord, ...(prev.records || [])],
        vitals: vitals.bp ? vitals : prev.vitals
    }));

    setVitals({ temp: '', bp: '', pulse: '', weight: '', height: '', spo2: '' });
    setClinicalNotes({ symptoms: '', diagnosis: '', advice: '' });
    setMedications([]);
    setSessionTime(0);
    alert("Live Consultation Saved to Medical Records!");
    setActiveTab('timeline'); 
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if(selectedPatient) {
        const newRecord = { 
            id: Date.now(), 
            date: new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}), 
            title: "New Medical Document", 
            type: "Rx", 
            doctor: "You" 
        };
        const updatedList = patients.map(p => {
            if(p.id === selectedPatient.id) return { ...p, records: [newRecord, ...(p.records || [])] };
            return p;
        });
        setPatients(updatedList);
        setSelectedPatient(prev => ({ ...prev, records: [newRecord, ...(prev.records || [])] }));
        alert("Record attached locally!");
    }
    setShowAddRecordModal(false);
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const totalPatients = patients.length;
  const criticalCases = patients.filter(p => p.vitals?.bp?.startsWith('140') || p.vitals?.temp?.startsWith('10')).length || 0; 
  const totalEarnings = patients.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-[#f8f9fa]">Loading Patients...</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative font-sans">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        <header className="bg-white sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">Patient Management</h2>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setShowAddPatientModal(true)} className="hidden md:flex bg-[#192a56] text-white px-4 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all">
                    <Plus size={18}/> Add New Patient
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8">
          {!selectedPatient && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Total Patients</p><h3 className="text-2xl font-black text-slate-800">{totalPatients}</h3></div>
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><User size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Active Patients</p><h3 className="text-2xl font-black text-slate-800">{patients.filter(p => p.status === 'Active').length}</h3></div>
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Critical Vitals</p><h3 className="text-2xl font-black text-slate-800">{criticalCases}</h3></div>
                      <div className="p-3 rounded-xl bg-red-50 text-red-600"><Activity size={24}/></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p><h3 className="text-2xl font-black text-slate-800">₹{totalEarnings.toLocaleString()}</h3></div>
                      <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><CreditCard size={24}/></div>
                  </div>
              </div>
          )}

          {!selectedPatient && (
            <>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute top-3 left-3 text-slate-400"/>
                        <input type="text" placeholder="Search by name, ID or Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none shadow-sm" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportCSV} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"><Download size={16}/> Export List</button>
                    </div>
                </div>

                {filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {filteredPatients.map((patient) => (
                            <div key={patient.id || patient._id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                                {patient.isManual && (
                                    <div className="absolute top-4 right-4 z-10 flex gap-1">
                                        <button onClick={(e) => openEditModal(patient, e)} className="p-2 bg-white/80 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"><Edit size={16}/></button>
                                        <button onClick={(e) => handleDeletePatient(patient.id, patient._id, e)} className="p-2 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                    </div>
                                )}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative mb-3">
                                        <img src={patient.img} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                                        <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${patient.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">{patient.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold">{patient.id} • {patient.location?.split(',')[0]}</p>
                                </div>
                                <div className="flex justify-between border-t border-b border-slate-100 py-4 mb-4">
                                    <div className="text-center w-1/3 border-r border-slate-100"><p className="text-xs text-slate-400 font-bold">Blood</p><p className="text-sm font-black text-slate-700">{patient.bloodGroup || 'O+'}</p></div>
                                    <div className="text-center w-1/3 border-r border-slate-100"><p className="text-xs text-slate-400 font-bold">Age</p><p className="text-sm font-black text-slate-700">{patient.age || 'N/A'}</p></div>
                                    <div className="text-center w-1/3"><p className="text-xs text-slate-400 font-bold">Visits</p><p className="text-sm font-black text-[#00d0f1]">{patient.history?.length || 0}</p></div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    <button onClick={() => { setSelectedPatient(patient); setActiveTab('timeline'); }} className="flex-1 bg-[#f8faff] text-[#192a56] border border-[#192a56]/10 py-3 rounded-xl font-bold text-xs hover:bg-[#192a56] hover:text-white transition-all">Profile</button>
                                    <button onClick={() => { setSelectedPatient(patient); setActiveTab('consult'); }} className="flex-1 bg-[#00d0f1] text-white py-3 rounded-xl font-bold text-xs hover:bg-cyan-500 shadow-md transition-all flex items-center justify-center gap-1"><Stethoscope size={14}/> Consult</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><User size={40} className="text-slate-400"/></div><h3 className="text-lg font-bold text-slate-600">No Patients Found</h3></div>
                )}
            </>
          )}

          {selectedPatient && (
            <div className="animate-in zoom-in-95 duration-300">
                <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-slate-500 hover:text-[#192a56] font-bold mb-6 transition-colors"><ChevronLeft size={20}/> Back to Patient List</button>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-[#192a56]"></div>
                            <img src={selectedPatient.img} alt="" className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4" />
                            <h2 className="text-2xl font-black text-slate-800">{selectedPatient.name}</h2>
                            <p className="text-sm text-slate-500 font-medium mb-6">Patient ID: #{selectedPatient.id}</p>
                            <div className="flex justify-center gap-3 mb-8">
                                <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Phone size={20}/></button>
                                <button className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100"><Mail size={20}/></button>
                                <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><MessageSquare size={20}/></button>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Gender</span><span className="font-bold text-slate-700">{selectedPatient.gender}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Age</span><span className="font-bold text-slate-700">{selectedPatient.age}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Blood Group</span><span className="font-bold text-slate-700">{selectedPatient.bloodGroup || 'O+'}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Phone</span><span className="font-bold text-slate-700">{selectedPatient.phone}</span></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Latest Vitals Check</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedPatient.vitals && Object.entries(selectedPatient.vitals).map(([key, val]) => (
                                    <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase">{key}</p><p className="text-lg font-black text-slate-800">{val || '-'}</p></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
                            <div className="flex border-b border-slate-100 p-4 gap-2 overflow-x-auto bg-white">
                                {[{id:'timeline', l:'Medical Records', i:FileText}, {id:'appointments', l:'Appointments', i:Calendar}, {id:'billing', l:'Billing', i:CreditCard}, {id:'consult', l:'Live Consult', i:Stethoscope}].map(t => (
                                    <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? (t.id === 'consult' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-[#192a56] text-white shadow-lg') : 'text-slate-500 hover:bg-slate-50'}`}>
                                        <t.i size={16}/> {t.l}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 md:p-8 flex-1 bg-[#fcfcfc]">
                                {activeTab === 'consult' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex justify-between items-center">
                                            <div><h3 className="font-black text-slate-800">New Consultation Session</h3><p className="text-xs text-slate-500">Record vitals, diagnosis, and write prescription.</p></div>
                                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold border border-red-100"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>{formatTime(sessionTime)}</div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-[#00d0f1]"/> Capture Vitals</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[{l:'Temp (F)', k: 'temp'}, {l:'BP', k: 'bp'}, {l:'Pulse', k: 'pulse'}, {l:'Weight (kg)', k: 'weight'}].map((v,i) => (
                                                            <div key={i}><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{v.l}</label><input type="text" value={vitals[v.k]} onChange={(e) => setVitals({...vitals, [v.k]: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#00d0f1] outline-none bg-slate-50" placeholder="-" /></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} className="text-[#00d0f1]"/> Clinical Assessment</h3>
                                                    <div className="space-y-4">
                                                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Chief Symptoms</label><input type="text" value={clinicalNotes.symptoms} onChange={(e)=>setClinicalNotes({...clinicalNotes, symptoms: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none bg-slate-50" placeholder="e.g. Fever, Cough" /></div>
                                                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Final Diagnosis</label><input type="text" value={clinicalNotes.diagnosis} onChange={(e)=>setClinicalNotes({...clinicalNotes, diagnosis: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none bg-slate-50" placeholder="Enter diagnosis..." /></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px] flex flex-col">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Droplet size={18} className="text-[#00d0f1]"/> Rx / Medicine</h3>
                                                        <button onClick={addMedicationRow} className="text-xs bg-[#192a56] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 font-bold shadow">+ Add Drug</button>
                                                    </div>
                                                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                                                        {medications.map((med, index) => (
                                                            <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                                                <button onClick={() => removeMedicationRow(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-1 shadow-sm"><X size={14}/></button>
                                                                <input type="text" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} placeholder="Medicine Name" className="bg-white w-full text-sm font-bold text-slate-800 outline-none mb-3 p-2 border border-slate-100 rounded-lg focus:border-[#00d0f1]" />
                                                                <div className="flex gap-2">
                                                                    <input type="text" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} placeholder="1-0-1" className="bg-white w-1/2 p-2 text-xs border border-slate-100 rounded-lg text-center outline-none focus:border-[#00d0f1]" />
                                                                    <input type="text" value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)} placeholder="5 Days" className="bg-white w-1/2 p-2 text-xs border border-slate-100 rounded-lg text-center outline-none focus:border-[#00d0f1]" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {medications.length === 0 && <div className="text-center text-slate-400 text-xs py-10 border-2 border-dashed border-slate-200 rounded-xl">No medicines added yet</div>}
                                                    </div>
                                                </div>
                                                <button onClick={handleEndConsultation} className="w-full bg-[#192a56] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-900 transition-all shadow-xl hover:shadow-blue-900/30"><Save size={18}/> Save & Complete Session</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'timeline' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-800">Medical History</h3>
                                            <button onClick={() => setShowAddRecordModal(true)} className="bg-[#00d0f1] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-cyan-500 shadow-md"><UploadCloud size={16}/> Upload External Record</button>
                                        </div>
                                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                                            {selectedPatient.records && selectedPatient.records.length > 0 ? (
                                                selectedPatient.records.map((rec, idx) => (
                                                    <div key={rec.id || idx} className="relative pl-8">
                                                        <span className="absolute -left-[9px] top-0 w-4 h-4 bg-[#00d0f1] rounded-full border-4 border-white shadow-sm"></span>
                                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-bold text-slate-800 text-md flex items-center gap-2">{rec.title} {rec.details && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full uppercase">App Consult</span>}</h4>
                                                                    <p className="text-xs text-slate-500 mt-1">Prescribed by <span className="font-bold">{rec.doctor}</span></p>
                                                                </div>
                                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">{rec.date}</span>
                                                            </div>
                                                            {rec.details && rec.details.medications && rec.details.medications.length > 0 && (
                                                                <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                                    <p className="text-xs font-bold text-blue-900 mb-2 uppercase">Prescription</p>
                                                                    <ul className="space-y-1">
                                                                        {rec.details.medications.map((m, i) => (
                                                                            <li key={i} className="text-sm text-slate-700 flex justify-between border-b border-blue-100/50 pb-1 last:border-0">
                                                                                <span><span className="font-bold">{m.name}</span> ({m.dosage})</span><span className="text-xs text-slate-500">{m.duration}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2 mt-4"><button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white shadow-sm"><File size={14}/> View Full Rx</button></div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (<div className="pl-8 text-slate-400 text-sm">No medical records found. Start a "Live Consult" to add history.</div>)}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appointments' && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        {selectedPatient.history && selectedPatient.history.length > 0 ? (
                                            selectedPatient.history.map(apt => (
                                                <div key={apt.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${apt.type === 'Video' ? 'bg-purple-500' : 'bg-blue-500'}`}>{apt.type === 'Video' ? <Video size={20}/> : <Home size={20}/>}</div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{apt.purpose}</h4>
                                                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1"><Calendar size={12}/> {apt.date} • {apt.time}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{apt.status}</span>
                                                </div>
                                            ))
                                        ) : (<div className="text-center text-slate-400 py-10">No appointment history found.</div>)}
                                    </div>
                                )}

                                {activeTab === 'billing' && (
                                    <div className="animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-end mb-4 gap-2"><button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><Printer size={16}/> Print All</button></div>
                                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                                                    <tr><th className="px-6 py-4">Invoice ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-right">Status</th></tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {selectedPatient.bills && selectedPatient.bills.length > 0 ? (
                                                        selectedPatient.bills.map(bill => (
                                                            <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-[#00d0f1]">#{bill.id.slice(-5)}</td><td className="px-6 py-4 text-slate-600 font-medium">{bill.date}</td><td className="px-6 py-4 font-black">₹{bill.amount}</td>
                                                                <td className="px-6 py-4 text-right"><span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{bill.status}</span></td>
                                                            </tr>
                                                        ))
                                                    ) : (<tr><td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No billing history found.</td></tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>

      {showAddPatientModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-800">Add New Patient</h3>
                    <button onClick={() => setShowAddPatientModal(false)}><X size={24} className="text-slate-400 hover:text-slate-800"/></button>
                </div>
                <form onSubmit={handleAddPatientSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" value={newPatient.firstName} onChange={(e)=>handleInputChange(e, false)} placeholder="First Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" required />
                        <input type="text" name="lastName" value={newPatient.lastName} onChange={(e)=>handleInputChange(e, false)} placeholder="Last Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" name="email" value={newPatient.email} onChange={(e)=>handleInputChange(e, false)} placeholder="Email Address" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                        <input type="text" name="phone" value={newPatient.phone} onChange={(e)=>handleInputChange(e, false)} placeholder="Phone Number" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input type="number" name="age" value={newPatient.age} onChange={(e)=>handleInputChange(e, false)} placeholder="Age" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                        <select name="gender" value={newPatient.gender} onChange={(e)=>handleInputChange(e, false)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white"><option>Male</option><option>Female</option><option>Other</option></select>
                        <select name="bloodGroup" value={newPatient.bloodGroup} onChange={(e)=>handleInputChange(e, false)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white"><option>A+</option><option>O+</option><option>B+</option><option>AB+</option><option>O-</option><option>B-</option></select>
                    </div>
                    <input type="text" name="location" value={newPatient.location} onChange={(e)=>handleInputChange(e, false)} placeholder="Location (City, Area)" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                    <button type="submit" className="w-full bg-[#192a56] text-white py-4 mt-2 rounded-xl font-black text-sm hover:bg-blue-900 transition-colors shadow-xl">Create Patient Profile</button>
                </form>
            </div>
        </div>
      )}

      {/* --- EDIT PATIENT MODAL --- */}
      {showEditPatientModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-black text-slate-800">Edit Patient Details</h3>
                    <button onClick={() => setShowEditPatientModal(false)}><X size={24} className="text-slate-400 hover:text-slate-800"/></button>
                </div>
                <form onSubmit={handleEditPatientSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" value={editPatient.firstName} onChange={(e)=>handleInputChange(e, true)} placeholder="First Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" required />
                        <input type="text" name="lastName" value={editPatient.lastName} onChange={(e)=>handleInputChange(e, true)} placeholder="Last Name" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" name="email" value={editPatient.email} onChange={(e)=>handleInputChange(e, true)} placeholder="Email Address" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                        <input type="text" name="phone" value={editPatient.phone} onChange={(e)=>handleInputChange(e, true)} placeholder="Phone Number" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input type="number" name="age" value={editPatient.age} onChange={(e)=>handleInputChange(e, true)} placeholder="Age" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                        <select name="gender" value={editPatient.gender} onChange={(e)=>handleInputChange(e, true)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white"><option>Male</option><option>Female</option><option>Other</option></select>
                        <select name="bloodGroup" value={editPatient.bloodGroup} onChange={(e)=>handleInputChange(e, true)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white"><option>A+</option><option>O+</option><option>B+</option><option>AB+</option><option>O-</option><option>B-</option></select>
                    </div>
                    <input type="text" name="location" value={editPatient.location} onChange={(e)=>handleInputChange(e, true)} placeholder="Location (City, Country)" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1] bg-slate-50 focus:bg-white" />
                    <button type="submit" className="w-full bg-[#00d0f1] text-[#192a56] py-4 mt-2 rounded-xl font-black text-sm hover:bg-cyan-400 transition-colors shadow-xl">Save Changes</button>
                </form>
            </div>
        </div>
      )}

      {/* --- ADD RECORD MODAL --- */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2">Upload Medical Record</h3>
                <p className="text-sm text-slate-500 mb-6">Upload Lab reports, X-rays or Prescriptions</p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <UploadCloud size={40} className="mx-auto text-slate-300 mb-2 group-hover:text-[#00d0f1] transition-colors"/>
                    <p className="text-xs text-slate-400 font-bold">Click to browse or drag file here</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowAddRecordModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleAddRecord} className="flex-1 py-3 bg-[#00d0f1] text-white rounded-xl font-bold text-sm hover:bg-cyan-500 shadow-md">Upload Now</button>
                </div>
            </div>
        </div>
      )}

    </div>
  ); 
};

export default DoctorPatients;