import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, Upload, FileText, Send, Bot, User, 
  CheckCircle, Activity, ChevronRight, Layout, X, Stethoscope, Dog, ShieldAlert, ScanLine,
  Clock, MoreHorizontal, Sparkles // Added Sparkles here
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AiAnalysis = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(true); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // --- USER DATA ---
  const userName = "Vinay"; 

  // --- MOCK HISTORY ---
  const historyItems = [
    { id: 1, title: "Blood Count Report", date: "Yesterday" },
    { id: 2, title: "Chest X-Ray Analysis", date: "2 Oct 2023" },
  ];

  const [messages, setMessages] = useState([]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  // --- FAKE API FUNCTION (UPDATED TO SAVE TO DASHBOARD) ---
  const fetchAiResponse = async (userInput, type = 'text') => {
    setIsAnalyzing(true);

    setTimeout(() => {
      // Logic: Agar user "report" ya "x-ray" bolega, toh AI medical report generate karega
      if (type === 'report' || userInput.toLowerCase().includes('report') || userInput.toLowerCase().includes('x-ray')) {
        
        // 1. Create the Report Data Object
        const analysisResult = {
          id: Date.now(), // Unique ID
          disease: "Mild Bronchitis (Viral)", 
          confidence: "94%", 
          severity: "Moderate",
          symptoms: ["Wheezing", "Dry Cough", "Fatigue"],
          findings: "Bronchial wall thickening observed. No fluid in lungs.",
          doctorType: "Pulmonologist",
          date: new Date().toLocaleDateString(), // Today's Date
          status: "Pending Action"
        };

        // 2. SAVE TO LOCAL STORAGE (This sends data to Dashboard)
        const existingReports = JSON.parse(localStorage.getItem('dashboardReports')) || [];
        localStorage.setItem('dashboardReports', JSON.stringify([analysisResult, ...existingReports]));

        // 3. Show in Chat
        addMessage('ai', null, 'report', analysisResult);

      } else {
        addMessage('ai', "Based on your symptoms, it sounds like a seasonal viral infection. Please keep hydrated and monitor your temperature. If fever persists > 3 days, consult a doctor.");
      }
      setIsAnalyzing(false);
    }, 2000); 
  };

  // --- HANDLERS ---
  const handleQuickPrompt = (text) => {
    addMessage('user', text);
    fetchAiResponse(text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userMsg = {
      id: Date.now(), sender: 'user', type: 'file', 
      fileName: file.name, fileSize: (file.size / 1024).toFixed(2) + " KB", 
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, userMsg]);
    fetchAiResponse("Analyze this report", 'report');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addMessage('user', inputText);
    fetchAiResponse(inputText);
    setInputText("");
  };

  const addMessage = (sender, text, type = 'text', data = null) => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text, type, data, time: getCurrentTime() }]);
  };

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-50 min-h-screen relative font-sans flex flex-col h-screen overflow-hidden">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#192a56] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <UserSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex h-screen">
        
        {/* CENTER CHAT AREA */}
        <div className="flex-1 flex flex-col relative transition-all duration-300">
            
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Sparkles size={18} className="text-[#00d0f1]" fill="currentColor"/> PetDoc AI <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 uppercase">Beta</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowHistory(!showHistory)} className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#192a56] bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                        <Layout size={16} /> {showHistory ? 'Hide History' : 'Show History'}
                    </button>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Bell size={20} /></button>
                </div>
            </header>

            {/* Chat Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] relative custom-scrollbar">
                
                {/* --- 1. WELCOME SCREEN --- */}
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-10 animate-in fade-in duration-700">
                        <div className="mb-8 relative">
                            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto mb-6 relative border-4 border-slate-50">
                                <Bot size={48} className="text-[#192a56]" />
                                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome, {userName}! 👋</h1>
                            <p className="text-slate-500 text-lg max-w-lg mx-auto">I'm your personal health assistant. Upload a medical report or describe your symptoms to get started.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full px-4 mb-10">
                            <div onClick={() => handleQuickPrompt("Analyze this blood report")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group text-left">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ScanLine size={20} /></div>
                                <h3 className="font-bold text-slate-800 text-sm">Analyze Reports</h3>
                                <p className="text-xs text-slate-500 mt-1">Upload Lab Reports, X-Rays or Prescriptions.</p>
                            </div>

                            <div onClick={() => handleQuickPrompt("I have a severe headache")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group text-left">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Stethoscope size={20} /></div>
                                <h3 className="font-bold text-slate-800 text-sm">Symptom Checker</h3>
                                <p className="text-xs text-slate-500 mt-1">Describe feelings to get potential diagnosis.</p>
                            </div>

                            <div onClick={() => handleQuickPrompt("My dog is not eating")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group text-left">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Dog size={20} /></div>
                                <h3 className="font-bold text-slate-800 text-sm">Pet Health</h3>
                                <p className="text-xs text-slate-500 mt-1">Veterinary advice for your furry friends.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. CHAT MESSAGES --- */}
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            
                            {msg.sender === 'ai' && (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#192a56] to-blue-900 flex items-center justify-center text-white shrink-0 shadow-lg mt-1"><Sparkles size={16} /></div>
                            )}

                            <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.sender === 'user' ? 'items-end flex flex-col' : ''}`}>
                                
                                {/* TEXT */}
                                {msg.text && (
                                    <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#00d0f1] text-[#192a56] font-bold rounded-2xl rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'}`}>{msg.text}</div>
                                )}

                                {/* FILE */}
                                {msg.type === 'file' && (
                                    <div className="bg-white p-4 rounded-2xl rounded-tr-sm border border-slate-200 shadow-sm flex items-center gap-4 min-w-[280px]">
                                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100"><FileText size={20} /></div>
                                        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{msg.fileName}</p><p className="text-[10px] text-slate-400 font-medium">{msg.fileSize}</p></div><CheckCircle size={18} className="text-emerald-500" />
                                    </div>
                                )}

                                {/* AI REPORT CARD */}
                                {msg.type === 'report' && msg.data && (
                                    <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-200 shadow-xl overflow-hidden w-full sm:w-[420px]">
                                        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 flex justify-between items-center">
                                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Activity size={16} className="text-[#00d0f1]" /> AI Diagnosis</h3>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">{msg.data.confidence} Match</span>
                                        </div>
                                        <div className="p-5 space-y-5">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detected Condition</p>
                                                <div className="flex justify-between items-start"><p className="text-xl font-black text-slate-800">{msg.data.disease}</p><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${msg.data.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{msg.data.severity} Risk</span></div>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2"><FileText size={12}/> Analysis Summary</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">{msg.data.findings}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">{msg.data.symptoms.map((sym, i) => (<span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 font-medium">{sym}</span>))}</div>
                                            </div>
                                            <div className="pt-2">
                                                <Link to="/user/book-appointment" className="w-full bg-[#192a56] hover:bg-blue-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10">Consult {msg.data.doctorType} <ChevronRight size={16} /></Link>
                                                <p className="text-[10px] text-center text-slate-400 mt-2">Recommended based on severity.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <span className="text-[10px] text-slate-300 font-medium px-1">{msg.time}</span>
                            </div>
                            {msg.sender === 'user' && <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-1"><User size={18} /></div>}
                        </div>
                    ))}

                    {/* Loading Animation */}
                    {isAnalyzing && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-9 h-9 rounded-xl bg-[#192a56] flex items-center justify-center text-white shrink-0"><Sparkles size={16} /></div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-2 w-fit">
                                <div className="flex space-x-1"><div className="w-1.5 h-1.5 bg-[#00d0f1] rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-[#00d0f1] rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-[#00d0f1] rounded-full animate-bounce delay-150"></div></div>
                                <span className="text-xs font-bold text-slate-400 ml-2">Analyzing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 sm:px-8 sm:py-5 shrink-0 z-20">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-[#00d0f1] focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                        <div className="relative group">
                            <label className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-slate-200 shadow-sm">
                                <Upload size={18} />
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message or upload a report..." className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-medium placeholder-slate-400 py-2.5 px-2" />
                        <button type="submit" disabled={!inputText.trim()} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${inputText.trim() ? 'bg-[#192a56] text-white hover:bg-blue-900 shadow-blue-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Send size={18} /></button>
                    </form>
                    <div className="flex justify-center items-center gap-2 mt-3 text-[10px] text-slate-400">
                        <ShieldAlert size={12} className="text-amber-500"/> <span>AI insights are for reference only. Consult a doctor for medical decisions.</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar (History) */}
        <div className={`fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-200 transform transition-transform duration-300 z-40 lg:relative lg:transform-none ${showHistory ? 'translate-x-0' : 'translate-x-full lg:hidden'}`}>
            <div className="h-full flex flex-col">
                <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
                    <h3 className="font-black text-slate-800 text-sm">Recent Analysis</h3>
                    <button onClick={() => setShowHistory(false)} className="lg:hidden p-1 hover:bg-slate-100 rounded"><X size={18}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {historyItems.map((item) => (
                        <div key={item.id} className="group p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all">
                            <div className="flex justify-between items-start mb-1"><p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-[#00d0f1]">{item.title}</p><button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={14}/></button></div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400"><Clock size={10} /> {item.date}</div>
                        </div>
                    ))}
                    <button className="w-full mt-4 py-3 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all flex items-center justify-center gap-2">+ Start New Chat</button>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="bg-[#192a56] rounded-xl p-4 text-white relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 bg-[#00d0f1] w-12 h-12 rounded-full blur-xl opacity-30"></div>
                        <p className="text-xs font-bold mb-1">Upgrade to Pro</p>
                        <p className="text-[10px] text-blue-200 mb-3">Get unlimited AI analysis & priority doctor support.</p>
                        <button className="w-full bg-white text-[#192a56] py-2 rounded-lg text-[10px] font-black hover:bg-blue-50 transition-colors">Upgrade Now</button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AiAnalysis;