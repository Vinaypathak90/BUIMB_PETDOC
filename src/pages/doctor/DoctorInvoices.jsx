import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Search, Filter, Plus, FileText, Download, 
  Printer, Trash2, CheckCircle, Clock, XCircle, DollarSign, 
  ChevronRight, MoreHorizontal, User, Calendar, CreditCard, X, Share2
} from 'lucide-react';

const DoctorInvoices = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  
  // --- MODAL STATES ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);

  // --- NEW INVOICE FORM STATE ---
  const [newInvoice, setNewInvoice] = useState({
    patientName: '',
    items: [{ desc: 'Consultation Fee', cost: 500, qty: 1 }],
    tax: 10,
    status: 'Pending'
  });

  // --- MOCK DATA ---
  const mockInvoices = [
    { 
      id: "INV-001", patient: "Charlene Reed", date: "14 Feb 2026", amount: 550, status: "Paid", 
      items: [{ desc: "General Checkup", cost: 500, qty: 1 }], tax: 50, img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    { 
      id: "INV-002", patient: "Travis Trimble", date: "12 Feb 2026", amount: 1200, status: "Pending", 
      items: [{ desc: "Root Canal", cost: 1000, qty: 1 }, { desc: "Medicine Kit", cost: 200, qty: 1 }], tax: 0, img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    { 
      id: "INV-003", patient: "Carl Kelly", date: "10 Feb 2026", amount: 300, status: "Cancelled", 
      items: [{ desc: "Video Consult", cost: 300, qty: 1 }], tax: 0, img: "https://randomuser.me/api/portraits/men/85.jpg"
    },
    { 
      id: "INV-004", patient: "Michelle Fairfax", date: "08 Feb 2026", amount: 4500, status: "Paid", 
      items: [{ desc: "Dental Surgery", cost: 4000, qty: 1 }, { desc: "X-Ray", cost: 500, qty: 1 }], tax: 0, img: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ];

  useEffect(() => {
    setInvoices(mockInvoices);
  }, []);

  // --- CALCULATIONS ---
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingDues = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  // --- HANDLERS ---
  const handleAddItem = () => {
    setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { desc: '', cost: 0, qty: 1 }] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...newInvoice.items];
    updatedItems.splice(index, 1);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] = value;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const calculateTotal = () => {
    const subtotal = newInvoice.items.reduce((acc, item) => acc + (Number(item.cost) * Number(item.qty)), 0);
    return subtotal + (subtotal * (newInvoice.tax / 100));
  };

  const handleSaveInvoice = () => {
    const newInv = {
        id: `INV-${Math.floor(Math.random() * 1000)}`,
        patient: newInvoice.patientName || "Unknown Patient",
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: calculateTotal(),
        status: newInvoice.status,
        items: newInvoice.items,
        tax: calculateTotal() - newInvoice.items.reduce((acc, item) => acc + (Number(item.cost) * Number(item.qty)), 0),
        img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    };
    setInvoices([newInv, ...invoices]);
    setShowCreateModal(false);
    // Reset form logic here
  };

  // Filter
  const filteredInvoices = invoices.filter(inv => {
      const matchStatus = activeTab === 'all' ? true : inv.status.toLowerCase() === activeTab;
      const matchSearch = inv.patient.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
  });

  return (
    <div className="bg-[#f8f9fa] min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="bg-white sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-[#192a56]">Invoices & Payments</h2>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setShowCreateModal(true)} className="hidden md:flex bg-[#192a56] text-white px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all">
                    <Plus size={18}/> Create Invoice
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8">
          
          {/* 1. Finance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><DollarSign size={100} className="text-emerald-600"/></div>
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={24}/></div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Revenue</p>
                      <h3 className="text-3xl font-black text-slate-800">₹{totalRevenue.toLocaleString()}</h3>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><Clock size={100} className="text-orange-500"/></div>
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Clock size={24}/></div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pending Dues</p>
                      <h3 className="text-3xl font-black text-slate-800">₹{pendingDues.toLocaleString()}</h3>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10"><FileText size={100} className="text-blue-500"/></div>
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24}/></div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Invoices</p>
                      <h3 className="text-3xl font-black text-slate-800">{invoices.length}</h3>
                  </div>
              </div>
          </div>

          {/* 2. Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="bg-slate-100 p-1 rounded-xl flex overflow-x-auto max-w-full">
                  {['all', 'paid', 'pending', 'cancelled'].map(tab => (
                      <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                              activeTab === tab ? 'bg-white text-[#192a56] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
              <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute top-3 left-3 text-slate-400"/>
                  <input 
                      type="text" 
                      placeholder="Search Invoice ID or Patient..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-[#00d0f1] outline-none shadow-sm" 
                  />
              </div>
          </div>

          {/* 3. Invoice Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Invoice ID</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Patient</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Amount</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Created On</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Status</th>
                              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {filteredInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 font-bold text-[#00d0f1]">{inv.id}</td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <img src={inv.img} alt="" className="w-8 h-8 rounded-full object-cover" />
                                          <span className="font-bold text-slate-700">{inv.patient}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 font-black text-slate-800">₹{inv.amount.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{inv.date}</td>
                                  <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                          inv.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                          'bg-red-100 text-red-700'
                                      }`}>
                                          {inv.status === 'Paid' && <CheckCircle size={12}/>}
                                          {inv.status === 'Pending' && <Clock size={12}/>}
                                          {inv.status === 'Cancelled' && <XCircle size={12}/>}
                                          {inv.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setViewInvoice(inv)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="View"><FileText size={16}/></button>
                                          <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Print"><Printer size={16}/></button>
                                          <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Download"><Download size={16}/></button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

        </main>
      </div>

      {/* --- CREATE INVOICE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-[#192a56] p-6 text-white flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Plus size={20}/> Create New Invoice</h3>
                    <button onClick={() => setShowCreateModal(false)}><X size={20} className="hover:text-red-400 transition-colors"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Patient Name</label>
                            <input type="text" value={newInvoice.patientName} onChange={(e) => setNewInvoice({...newInvoice, patientName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-[#00d0f1]" placeholder="Search patient..." />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Invoice Date</label>
                            <input type="date" className="w-full p-3 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-[#00d0f1]" />
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Billing Items</label>
                            <button onClick={handleAddItem} className="text-xs text-[#00d0f1] font-bold hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-3">
                            {newInvoice.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input type="text" value={item.desc} onChange={(e) => handleItemChange(idx, 'desc', e.target.value)} className="flex-[2] p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" placeholder="Description" />
                                    <input type="number" value={item.cost} onChange={(e) => handleItemChange(idx, 'cost', e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" placeholder="Cost" />
                                    <input type="number" value={item.qty} onChange={(e) => handleItemChange(idx, 'qty', e.target.value)} className="w-16 p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none" placeholder="Qty" />
                                    <button onClick={() => handleRemoveItem(idx)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Calculation */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-sm mb-2"><span className="text-slate-500">Subtotal</span><span className="font-bold">₹{calculateTotal() / (1 + newInvoice.tax/100)}</span></div>
                        <div className="flex justify-between text-sm mb-4"><span className="text-slate-500">Tax ({newInvoice.tax}%)</span><span className="font-bold">₹{calculateTotal() - (calculateTotal() / (1 + newInvoice.tax/100))}</span></div>
                        <div className="flex justify-between text-lg pt-4 border-t border-slate-200">
                            <span className="font-black text-slate-800">Total Amount</span>
                            <span className="font-black text-[#00d0f1]">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    <button onClick={handleSaveInvoice} className="w-full bg-[#192a56] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg">Generate Invoice</button>
                </div>
            </div>
        </div>
      )}

      {/* --- VIEW INVOICE MODAL (RECEIPT) --- */}
      {viewInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-[#192a56]">INVOICE</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">#{viewInvoice.id}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-slate-800">PetDoc Clinic</h3>
                        <p className="text-xs text-slate-400">123, Health Street, NY</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Billed To</p>
                            <h4 className="font-bold text-slate-800">{viewInvoice.patient}</h4>
                            <p className="text-xs text-slate-500">patient@email.com</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date</p>
                            <h4 className="font-bold text-slate-800">{viewInvoice.date}</h4>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
                            <tr><th className="p-2">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Cost</th></tr>
                        </thead>
                        <tbody className="text-sm">
                            {viewInvoice.items.map((item, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="p-2 font-bold text-slate-700">{item.desc}</td>
                                    <td className="p-2 text-right text-slate-500">{item.qty}</td>
                                    <td className="p-2 text-right font-bold">₹{item.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${viewInvoice.status==='Paid'?'bg-emerald-100 text-emerald-700':'bg-orange-100 text-orange-700'}`}>{viewInvoice.status}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Grand Total</p>
                            <p className="text-2xl font-black text-[#192a56]">₹{viewInvoice.amount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50"><Printer size={16}/> Print</button>
                        <button className="flex items-center justify-center gap-2 py-3 bg-[#00d0f1] text-[#192a56] rounded-xl font-bold text-sm hover:bg-cyan-400"><Share2 size={16}/> Share</button>
                    </div>
                </div>
                <button onClick={() => setViewInvoice(null)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-200"><X size={20}/></button>
            </div>
        </div>
      )}

    </div>
  );
};

export default DoctorInvoices;