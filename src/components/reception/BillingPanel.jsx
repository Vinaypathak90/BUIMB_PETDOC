import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Trash2, Printer, FileText, 
  CreditCard, Save, History, ChevronRight, RefreshCw 
} from 'lucide-react';

const BillingPanel = () => {
  // --- STATE ---
  const [view, setView] = useState('create'); // 'create' | 'history'
  
  // Data States
  const [patients, setPatients] = useState([]);
  const [savedInvoices, setSavedInvoices] = useState([]);
  
  // Current Form States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [items, setItems] = useState([{ id: 1, desc: 'Consultation Fee', price: 500, qty: 1 }]);
  
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString(),
    paymentMode: 'Cash',
    discount: 0
  });

  // --- 1. LOAD DATA (Patients & History) ---
  useEffect(() => {
    // Load Patients
    const storedPatients = JSON.parse(localStorage.getItem('reception_data')) || [];
    setPatients(storedPatients);

    // Load Billing History
    const history = JSON.parse(localStorage.getItem('billing_records')) || [];
    setSavedInvoices(history);
  }, []);

  // --- 2. LIVE CALCULATIONS ---
  const subTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const grandTotal = subTotal - invoiceMeta.discount;

  // --- 3. HANDLERS ---
  
  // Add/Remove Items
  const handleAddItem = () => setItems([...items, { id: Date.now(), desc: '', price: 0, qty: 1 }]);
  const handleRemoveItem = (id) => setItems(items.filter(i => i.id !== id));
  const handleItemChange = (id, field, value) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // Save Invoice to Storage
  const handleSaveInvoice = () => {
    const newInvoice = {
        id: invoiceMeta.invoiceNo,
        patientName: selectedPatient ? selectedPatient.name : 'Walk-in Customer',
        phone: selectedPatient ? selectedPatient.contact : '---',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        items: items,
        meta: invoiceMeta,
        totals: { subTotal, grandTotal }
    };

    const updatedHistory = [newInvoice, ...savedInvoices];
    setSavedInvoices(updatedHistory);
    localStorage.setItem('billing_records', JSON.stringify(updatedHistory));
    
    alert('Invoice Saved Successfully!');
    handleReset(); // Reset for next bill
  };

  // Reset Form
  const handleReset = () => {
    setItems([{ id: Date.now(), desc: 'Consultation Fee', price: 500, qty: 1 }]);
    setSelectedPatient(null);
    setInvoiceMeta({
        invoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(),
        paymentMode: 'Cash',
        discount: 0
    });
    setSearchQuery('');
  };

  // Load Old Invoice to View/Print
  const handleViewInvoice = (inv) => {
    setInvoiceMeta(inv.meta);
    setItems(inv.items);
    setSelectedPatient({ name: inv.patientName, contact: inv.phone }); // Mock object for display
    setView('create'); // Go to preview view
  };

  const handlePrint = () => window.print();

  // Patient Filter
  const filteredPatients = patients.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (p.contact && p.contact.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in space-y-4">
      
      {/* --- TOP TAB SWITCHER --- */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        <button 
            onClick={() => setView('create')} 
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'create' ? 'bg-[#1e293b] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            <Plus size={16}/> New Invoice
        </button>
        <button 
            onClick={() => setView('history')} 
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'history' ? 'bg-[#1e293b] text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            <History size={16}/> History
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden">
        
        {/* ======================= */}
        {/* LEFT PANEL: INPUT / LIST */}
        {/* ======================= */}
        
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* VIEW 1: CREATE NEW BILL */}
            {view === 'create' ? (
                <>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-[#00d0f1]"/> Billing Details
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600" title="Reset"><RefreshCw size={16}/></button>
                            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{invoiceMeta.invoiceNo}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                        {/* A. Patient Search */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Customer / Patient</label>
                            {selectedPatient ? (
                                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{selectedPatient.name}</p>
                                        <p className="text-xs text-slate-500">{selectedPatient.contact || selectedPatient.phone}</p>
                                    </div>
                                    <button onClick={() => setSelectedPatient(null)} className="text-xs font-bold text-red-500 hover:underline">Change</button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                                    <input 
                                        type="text" 
                                        placeholder="Search Registered Patient..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#00d0f1]"
                                    />
                                    {searchQuery && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-2 shadow-xl z-20 max-h-40 overflow-y-auto">
                                            {filteredPatients.map(p => (
                                                <div key={p.id} onClick={() => {setSelectedPatient(p); setSearchQuery('');}} className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0">
                                                    <p className="font-bold text-sm">{p.name}</p>
                                                    <p className="text-xs text-slate-400">{p.phone}</p>
                                                </div>
                                            ))}
                                            <div onClick={() => {setSelectedPatient({name: 'Walk-in', contact: '---'}); setSearchQuery('');}} className="p-3 hover:bg-slate-50 cursor-pointer text-[#00d0f1] font-bold text-xs">
                                                + Use as Walk-in Customer
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* B. Items List */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Items / Services</label>
                                <button onClick={handleAddItem} className="text-xs font-bold text-[#00d0f1] flex items-center gap-1 hover:underline"><Plus size={14}/> Add Item</button>
                            </div>
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <span className="text-xs font-bold text-slate-300 w-4">{index + 1}.</span>
                                        <input type="text" placeholder="Item Name" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} className="flex-[2] p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#00d0f1]" />
                                        <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#00d0f1]" />
                                        <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 1)} className="w-14 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#00d0f1]" />
                                        <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* C. Payment Meta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Mode</label>
                                <select 
                                    value={invoiceMeta.paymentMode} 
                                    onChange={(e) => setInvoiceMeta({...invoiceMeta, paymentMode: e.target.value})}
                                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                >
                                    <option>Cash</option><option>UPI</option><option>Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Discount (₹)</label>
                                <input type="number" value={invoiceMeta.discount} onChange={(e) => setInvoiceMeta({...invoiceMeta, discount: parseFloat(e.target.value) || 0})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-[#00d0f1]" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100">
                        <button onClick={handleSaveInvoice} className="w-full py-3 bg-[#1e293b] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00d0f1] hover:text-[#1e293b] transition-all shadow-lg">
                            <Save size={18}/> Save & Print Invoice
                        </button>
                    </div>
                </>
            ) : (
                /* VIEW 2: HISTORY LIST */
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-slate-800">Invoice History</h3>
                        <p className="text-xs text-slate-400">Total Records: {savedInvoices.length}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {savedInvoices.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-xs font-bold">No saved invoices.</div>
                        ) : (
                            savedInvoices.map((inv) => (
                                <div key={inv.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 flex justify-between items-center cursor-pointer group" onClick={() => handleViewInvoice(inv)}>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{inv.patientName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{inv.id} • {inv.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#1e293b]">₹{inv.totals.grandTotal}</p>
                                        <span className="text-[10px] text-[#00d0f1] font-bold group-hover:underline">View & Print</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* ======================= */}
        {/* RIGHT PANEL: LIVE PREVIEW */}
        {/* ======================= */}
        
        <div className="w-full xl:w-[480px] bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative print:w-full print:absolute print:top-0 print:left-0 print:z-50 print:h-screen">
            
            <div className="absolute top-4 right-4 print:hidden">
                <button onClick={handlePrint} className="p-2 bg-slate-100 rounded-full hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors" title="Print Bill">
                    <Printer size={20}/>
                </button>
            </div>

            <div className="p-10 flex-1 flex flex-col text-slate-800 font-mono">
                
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-3xl font-black tracking-tight text-[#1e293b]">PETDOC CLINIC</h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">123, Health Avenue, Medical City, India</p>
                    <p className="text-xs font-medium text-slate-500">Helpline: +91 98765 43210</p>
                </div>

                {/* Bill To */}
                <div className="flex justify-between mb-6 text-xs">
                    <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Billed To:</p>
                        <p className="font-bold text-base">{selectedPatient ? selectedPatient.name : 'Walk-in Customer'}</p>
                        <p className="text-slate-500">{selectedPatient?.contact || selectedPatient?.phone || '---'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 font-bold uppercase mb-1">Invoice Details:</p>
                        <p className="font-bold">#{invoiceMeta.invoiceNo}</p>
                        <p className="text-slate-500">{invoiceMeta.date}</p>
                        <p className="text-slate-500 font-bold uppercase mt-1">{invoiceMeta.paymentMode}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b-2 border-slate-200 text-slate-500 uppercase">
                            <tr>
                                <th className="py-2">Item Description</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3 font-bold">{item.desc || 'Item'}</td>
                                    <td className="py-3 text-center text-slate-500">{item.qty}</td>
                                    <td className="py-3 text-right text-slate-500">₹{item.price}</td>
                                    <td className="py-3 text-right font-bold">₹{item.price * item.qty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Calculations */}
                <div className="border-t-2 border-slate-800 pt-4 mt-6 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>₹{subTotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Discount</span>
                        <span>- ₹{invoiceMeta.discount}</span>
                    </div>
                    <div className="flex justify-between font-black text-xl text-[#1e293b] pt-2 border-t border-dashed border-slate-300 mt-2">
                        <span>Grand Total</span>
                        <span>₹{grandTotal}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-400 font-bold mb-10">Authorized Signature</p>
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Thank you for visiting us!</p>
                        <p className="text-[9px] text-slate-300">Get well soon.</p>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default BillingPanel;