import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar'; 
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  Search, Trash2, Eye, ArrowUpRight, ArrowDownLeft, DollarSign, 
  FileText, Download, ChevronLeft, ChevronRight, X, Briefcase, Wallet 
} from 'lucide-react';

const Transactions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- PAGINATION & FILTER STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, credit, debit

  // --- DUMMY TRANSACTION DATA (2026) ---
  const [transactions, setTransactions] = useState([
    { id: 1, invoiceId: "#TRX-9901", name: "Charlene Reed", type: "Patient Fee", amount: 200, status: "paid", method: "Credit Card", date: "12 Jan 2026", flow: "credit" },
    { id: 2, invoiceId: "#SAL-1001", name: "Dr. Ruby Perrin", type: "Doctor Salary", amount: 4500, status: "paid", method: "Bank Transfer", date: "30 Jan 2026", flow: "debit" },
    { id: 3, invoiceId: "#TRX-9902", name: "Travis Trimble", type: "Pet Surgery Fee", amount: 850, status: "pending", method: "Insurance", date: "02 Feb 2026", flow: "credit" },
    { id: 4, invoiceId: "#EXP-5021", name: "Medical Supplies Co.", type: "Equipment Purchase", amount: 1200, status: "paid", method: "Wire Transfer", date: "05 Feb 2026", flow: "debit" },
    { id: 5, invoiceId: "#TRX-9903", name: "Carl Kelly", type: "Consultation", amount: 150, status: "paid", method: "Cash", date: "08 Feb 2026", flow: "credit" },
    { id: 6, invoiceId: "#SAL-1002", name: "Dr. Darren Elder", type: "Doctor Salary", amount: 5000, status: "paid", method: "Bank Transfer", date: "28 Feb 2026", flow: "debit" },
    { id: 7, invoiceId: "#TRX-9904", name: "Gina Moore", type: "Vaccination", amount: 80, status: "failed", method: "Card", date: "01 Mar 2026", flow: "credit" },
    { id: 8, invoiceId: "#MNT-3001", name: "TechFix Solutions", type: "Server Maintenance", amount: 300, status: "pending", method: "PayPal", date: "05 Mar 2026", flow: "debit" },
    { id: 9, invoiceId: "#TRX-9905", name: "Elsie Gilley", type: "Dental Cleaning", amount: 400, status: "paid", method: "Credit Card", date: "10 Mar 2026", flow: "credit" },
    { id: 10, invoiceId: "#SAL-1003", name: "Nurse Sarah Connor", type: "Staff Salary", amount: 2500, status: "paid", method: "Bank Transfer", date: "30 Mar 2026", flow: "debit" },
    { id: 11, invoiceId: "#TRX-9906", name: "Walter Roberson", type: "Pet Grooming", amount: 120, status: "paid", method: "Cash", date: "02 Apr 2026", flow: "credit" },
    { id: 12, invoiceId: "#EXP-5022", name: "City Electricity Board", type: "Utility Bill", amount: 600, status: "paid", method: "Auto-Debit", date: "05 Apr 2026", flow: "debit" },
  ]);

  // --- STATS CALCULATION ---
  const totalIncome = transactions.filter(t => t.flow === 'credit' && t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.flow === 'debit' && t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // --- FILTER & PAGINATION LOGIC ---
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' ? true : t.flow === filterType;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // --- HANDLERS ---
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this transaction record?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleViewInvoice = (transaction) => {
    setSelectedInvoice(transaction);
    setIsModalOpen(true);
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
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Financial Overview (2026)</h1>
            <p className="text-slate-500 text-sm">Manage salaries, payments, and clinic expenses.</p>
          </div>

          {/* --- FUTURISTIC STATS CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Income Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><ArrowUpRight className="w-6 h-6 text-white" /></div>
                    <span className="text-emerald-100 font-bold text-sm uppercase tracking-wider">Total Income</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">${totalIncome.toLocaleString()}</h2>
            </div>

            {/* Expense Card */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-red-200 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><ArrowDownLeft className="w-6 h-6 text-white" /></div>
                    <span className="text-red-100 font-bold text-sm uppercase tracking-wider">Total Expenses</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">${totalExpense.toLocaleString()}</h2>
            </div>

            {/* Net Balance Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
                    <span className="text-blue-100 font-bold text-sm uppercase tracking-wider">Net Profit</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">${netBalance.toLocaleString()}</h2>
            </div>
          </div>

          {/* --- MAIN TABLE SECTION --- */}
          <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden p-6">
            
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                
                {/* Filter Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                    <button onClick={() => setFilterType('credit')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'credit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
                    <button onClick={() => setFilterType('debit')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'debit' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Expenses</button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search ID or Name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none text-sm font-bold text-slate-700"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Beneficiary / Payer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 font-mono">
                        {item.invoiceId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${item.flow === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {item.flow === 'credit' ? <ArrowUpRight size={14} /> : <Briefcase size={14} />}
                           </div>
                           <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{item.type}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.date}</td>

                      <td className="px-6 py-4">
                        <span className={`text-sm font-black ${item.flow === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                           {item.flow === 'credit' ? '+' : '-'} ${item.amount}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {item.status === 'paid' && <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">Paid</span>}
                        {item.status === 'pending' && <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase border border-amber-200">Pending</span>}
                        {item.status === 'failed' && <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200">Failed</span>}
                      </td>

                      <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleViewInvoice(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="View Invoice">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Delete Record">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 border-t border-slate-100 pt-4">
               <p className="text-xs font-bold text-slate-400">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}</p>
               <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16} /></button>
               </div>
            </div>

          </div>
        </main>
      </div>

      {/* --- INVOICE MODAL (Futuristic Receipt) --- */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
              
              {/* Receipt Header */}
              <div className="bg-[#192a56] p-6 text-center relative">
                 <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={20}/></button>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white backdrop-blur-md">
                    <FileText size={24} />
                 </div>
                 <h2 className="text-white font-bold text-lg">Transaction Receipt</h2>
                 <p className="text-blue-200 text-xs font-mono mt-1">{selectedInvoice.date} • {selectedInvoice.invoiceId}</p>
              </div>

              {/* Receipt Body */}
              <div className="p-8">
                 <div className="text-center mb-8">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <h1 className={`text-4xl font-black ${selectedInvoice.flow === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        ${selectedInvoice.amount}.00
                    </h1>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mt-2 ${selectedInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedInvoice.status}
                    </span>
                 </div>

                 <div className="space-y-4 border-t border-slate-100 pt-6">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Subject</span>
                       <span className="text-slate-800 font-bold">{selectedInvoice.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Category</span>
                       <span className="text-slate-800 font-bold">{selectedInvoice.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Payment Method</span>
                       <span className="text-slate-800 font-bold">{selectedInvoice.method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Transaction ID</span>
                       <span className="text-slate-800 font-mono text-xs">{selectedInvoice.invoiceId}</span>
                    </div>
                 </div>

                 <button className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                    <Download size={18} /> Download Invoice
                 </button>
              </div>

              {/* Receipt Cut Effect (Design Element) */}
              <div className="absolute top-[140px] -left-3 w-6 h-6 bg-slate-800 rounded-full"></div>
              <div className="absolute top-[140px] -right-3 w-6 h-6 bg-slate-800 rounded-full"></div>
              <div className="absolute top-[150px] left-4 right-4 border-b-2 border-dashed border-slate-200"></div>

           </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;