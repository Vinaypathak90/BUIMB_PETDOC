import React, { useState, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, Search, Filter, Download, FileText, 
  CreditCard, ArrowUpRight, ArrowDownLeft, Wallet, 
  CheckCircle, Clock, RotateCcw, MoreHorizontal, ShieldCheck, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, paid, pending, refunded
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE FOR REAL DATA ---
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // --- FETCH REAL DATA FROM BACKEND ---
  useEffect(() => {
    const fetchTransactions = async () => {
        const storedData = JSON.parse(localStorage.getItem('user_token'));
        if (!storedData) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/transactions/my-history', {
                headers: { 'Authorization': `Bearer ${storedData.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                
                // Format data for UI
                const formattedData = data.map(t => {
                    // Safe Date Parsing
                    const txDate = t.date ? new Date(t.date) : new Date();
                    
                    return {
                        id: t.invoiceId || (t._id ? t._id.substr(-8).toUpperCase() : "UNKNOWN"),
                        doctor: t.doctorName || "Unknown Doctor",
                        service: t.service || "General Service",
                        date: txDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        time: txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        amount: t.amount || 0,
                        status: t.status || "Pending",
                        method: t.method || "Cash"
                    };
                });
                
                setTransactions(formattedData);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchTransactions();
  }, [navigate]);

  // --- CALCULATE STATS ---
  const totalSpent = transactions
    .filter(t => t.status.toLowerCase() === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = transactions
    .filter(t => t.status.toLowerCase() === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => {
    // 1. Filter by Tab (Status) - Case Insensitive
    const statusMatch = filter === 'all' 
        ? true 
        : t.status.toLowerCase() === filter.toLowerCase();
    
    // 2. Filter by Search Term
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = (t.doctor && t.doctor.toLowerCase().includes(searchLower)) || 
                        (t.service && t.service.toLowerCase().includes(searchLower)) ||
                        (t.id && t.id.toLowerCase().includes(searchLower));
                        
    return statusMatch && searchMatch;
  });

  // --- DOWNLOAD PDF FUNCTION ---
const handleDownloadInvoice = (txn) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFillColor(25, 42, 86);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("PetDoc Invoice", 14, 25);
    
    doc.setFontSize(10);
    doc.text("Original Receipt", 170, 25);

    // -- Invoice Details --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${txn.id}`, 14, 50);
    doc.text(`Date: ${txn.date} at ${txn.time}`, 14, 56);
    doc.text(`Status: ${txn.status}`, 14, 62);

    // -- Table (UPDATED SYNTAX) --
    autoTable(doc, {  // 👈 CHANGED: Use the imported function
      startY: 70,
      head: [['Description', 'Doctor / Service', 'Payment Method', 'Amount']],
      body: [
        ['Medical Service', txn.doctor, txn.method, `Rs. ${txn.amount}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [25, 42, 86] },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    // -- Footer Total --
    // Check if lastAutoTable exists safely
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 120;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Paid: Rs. ${txn.amount}/-`, 140, finalY);

    // -- Footer Note --
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150);
    doc.text("Thank you for choosing PetDoc. This is a computer-generated invoice.", 14, 280);

    // Save File
    doc.save(`Invoice_${txn.id}.pdf`);
  };

  // --- LOADING STATE ---
  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <Loader2 size={40} className="text-[#192a56] animate-spin mb-4" />
                  <h3 className="text-lg font-black text-slate-800">Loading Transactions...</h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">Fetching your financial history securely</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:ml-64 transition-all">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-20 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                <h2 className="text-xl font-black text-slate-800">Transactions & Invoices</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            
            {/* 1. FINANCIAL OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Spent */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Wallet size={100} className="text-[#192a56]" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUpRight size={20}/></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Spent</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">₹{totalSpent.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-2">Lifetime medical expenses</p>
                </div>

                {/* Pending Dues */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Clock size={100} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={20}/></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Dues</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">₹{totalPending.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-2">Pay at clinic or update payment</p>
                </div>

                {/* Virtual Card UI */}
                <div className="bg-gradient-to-br from-[#192a56] to-blue-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-48">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#00d0f1] rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start z-10">
                        <span className="text-xs font-mono opacity-70">PetDoc Wallet</span>
                        <CreditCard size={24} className="opacity-80"/>
                    </div>
                    <div className="z-10">
                        <p className="font-mono text-xl tracking-widest mb-1">•••• •••• •••• 4242</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] opacity-60 uppercase">Card Holder</p>
                                <p className="text-sm font-bold">VINAY PATHAK</p>
                            </div>
                            <div>
                                <p className="text-[10px] opacity-60 uppercase">Expires</p>
                                <p className="text-sm font-bold">12/28</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                    {['all', 'paid', 'pending', 'refunded'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                filter === tab ? 'bg-[#192a56] text-white shadow' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search size={16} className="absolute top-3 left-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search invoice ID or doctor..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-[#00d0f1] outline-none font-medium text-slate-700 text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* 3. TRANSACTION TABLE */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Service / Doctor</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t, index) => (
                                    <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{t.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{t.doctor}</p>
                                            <p className="text-xs text-slate-500">{t.service}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">{t.date}</p>
                                            <p className="text-xs text-slate-400">{t.time}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-slate-800">₹{t.amount}</p>
                                            <p className="text-[10px] text-slate-400">{t.method}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                t.status.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                t.status.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {t.status.toLowerCase() === 'paid' && <CheckCircle size={12}/>}
                                                {t.status.toLowerCase() === 'pending' && <Clock size={12}/>}
                                                {t.status.toLowerCase() === 'refunded' && <RotateCcw size={12}/>}
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDownloadInvoice(t)}
                                                className="p-2 text-slate-400 hover:text-[#192a56] hover:bg-blue-50 rounded-lg transition-colors" 
                                                title="Download Invoice"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <FileText size={40} className="mx-auto text-slate-200 mb-3"/>
                                        <p className="text-slate-400 font-medium">No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500"/>
                <span>Payments are secured by 256-bit SSL encryption.</span>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default TransactionHistory;