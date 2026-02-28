import React, { useState, useRef, useEffect } from 'react';
import UserSidebar from '../../components/user/UserSidebar'; 
import { 
  Menu, Bell, Upload, FileText, Send, Bot, User, 
  Activity, ChevronRight, Layout, X, Stethoscope, Dog, ShieldAlert, ScanLine,
  Clock, MoreHorizontal, Sparkles, Languages, Trash2, File,
  FileSearch, Mic, MicOff, Edit3, Save, Plus, History, Settings, Share2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AiAnalysis = () => {
  // --- STATES ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(true); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]); 
  const [historyItems, setHistoryItems] = useState([]); 
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("en"); // "en" for English, "hi" for Hindi
  
  // 🚨 NAYA STATE: Current Chat Track karne ke liye
  const [currentChatId, setCurrentChatId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAnalyzing]);

  // Load History from Backend
  useEffect(() => {
    fetchHistoryFromDB();
  }, []);

  const fetchHistoryFromDB = async () => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    if(!storedData) return;

    try {
      const response = await fetch('http://localhost:5000/api/ai/history', {
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      const data = await response.json();
      if (response.ok) setHistoryItems(data.history || []);
    } catch (err) { console.error("History Load Error:", err); }
  };

  // 🚨 NAYA FUNCTION: Click karne par purani chat load karega
  const loadSpecificChat = async (id) => {
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    if(!storedData) return;

    try {
      const response = await fetch(`http://localhost:5000/api/ai/history/${id}`, {
        headers: { 'Authorization': `Bearer ${storedData.token}` }
      });
      const data = await response.json();
      if (response.ok && data.chat) {
        setCurrentChatId(data.chat._id);
        setMessages(data.chat.messages || []);
      }
    } catch (err) { console.error("Error loading specific chat", err); }
  };

  // 🚨 NAYA FUNCTION: Nayi chat shuru karne ke liye
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputText("");
    setSelectedFile(null);
  };

  // --- 🟢 REAL API FUNCTION ---
  const fetchAiResponse = async (userInput, fileData = null) => {
    setIsAnalyzing(true);
    const storedData = JSON.parse(localStorage.getItem('user_token'));
    
    if(!storedData) {
        navigate('/login');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/ai/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedData.token}`
            },
            body: JSON.stringify({
                prompt: userInput,
                imageBase64: fileData?.base64,
                language: language,
                chatId: currentChatId // 🚨 Pura context bhej rahe hain
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Update chatId if it's the first message of a new chat
            if (data.chatId && !currentChatId) {
                setCurrentChatId(data.chatId);
                fetchHistoryFromDB(); // Sidebar list update karega
            }

            // Smart Logic: General Chat vs Report
            if (data.disease && data.disease !== "General Query") {
                const analysisResult = {
                    id: Date.now().toString(),
                    disease: data.disease,
                    confidence: data.confidence || "N/A",
                    severity: data.severity || "Low",
                    symptoms: data.symptoms || [],
                    findings: data.findings || "Analysis complete.",
                    doctorType: data.doctorType || "General Physician",
                    date: new Date().toLocaleDateString(),
                    status: "Pending Action"
                };
                addMessage('ai', null, 'report', analysisResult);
            } else {
                addMessage('ai', data.message || data.findings || data.text || "Hello! How can I help you today?");
            }
        } else {
            if (response.status === 401) {
                addMessage('ai', "Session expired. Please log in again.");
                navigate('/login');
            } else if (response.status === 429) {
                addMessage('ai', "AI is busy (Quota limit). Please try again in a few seconds.");
            } else {
                addMessage('ai', "I'm having trouble connecting to the server. Please try again.");
            }
        }
    } catch (error) {
        console.error("Network Error:", error);
        addMessage('ai', "Server unreachable. Is the backend running?");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // --- 📁 FILE HANDLING & DRAG-DROP LOGIC ---
  const processFile = (file) => {
    if (!file) return;

    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload Images, PDFs, or Word (.docx) files only!");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        base64: reader.result
      });
    };
  };

  const handleFileUpload = (e) => processFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };

  // --- ✉️ SEND MESSAGE LOGIC ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let messageType = 'text';
    if (selectedFile) {
        if (selectedFile.type.includes('image')) messageType = 'image';
        else if (selectedFile.type.includes('pdf')) messageType = 'pdf';
        else messageType = 'document';
    }

    const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: inputText,
        type: messageType,
        fileData: selectedFile?.base64,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMsg]);
    
    const finalPrompt = inputText || "Analyze this attached file.";
    fetchAiResponse(finalPrompt, selectedFile);
    
    setInputText("");
    setSelectedFile(null); 
  };

  const handleQuickPrompt = (text) => {
    addMessage('user', text);
    fetchAiResponse(text);
  };

  const addMessage = (sender, text, type = 'text', data = null) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, type, data, time: getCurrentTime() }]);
  };

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className="bg-slate-50 min-h-screen relative font-sans flex flex-col h-screen overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* 🚀 DRAG & DROP OVERLAY */}
      {isDragging && (
        <div className="absolute inset-0 z-[60] bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-[#00d0f1] flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
            <Upload size={48} className="text-[#00d0f1]" />
          </div>
          <h2 className="text-2xl font-black text-[#192a56] mt-4">Drop your reports here!</h2>
        </div>
      )}

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
                    {/* 🌐 LANGUAGE TOGGLE BUTTON */}
                    <button 
                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} 
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#192a56] bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-slate-200"
                    >
                        <Languages size={16} className={language === 'hi' ? 'text-[#00d0f1]' : ''} />
                        {language === 'en' ? 'English' : 'हिंदी'}
                    </button>

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
                            <h1 className="text-3xl font-black text-slate-800 mb-2">
                                {language === 'en' ? 'Hello! How can I help?' : 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?'} 👋
                            </h1>
                            <p className="text-slate-500 text-sm max-w-md mx-auto">
                                {language === 'en' ? 'Upload an Image, PDF, Word Document, or simply say "Hi" to start chatting.' : 'कोई इमेज, PDF, Word डॉक्यूमेंट अपलोड करें या बस "Hi" कहें।'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full px-4 mb-10">
                            <div onClick={() => handleQuickPrompt(language === 'en' ? "Analyze this blood report" : "इस ब्लड रिपोर्ट की जांच करें")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group text-left">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ScanLine size={20} /></div>
                                <h3 className="font-bold text-slate-800 text-sm">Analyze Reports</h3>
                                <p className="text-xs text-slate-500 mt-1">Upload Lab Reports, X-Rays or PDFs.</p>
                            </div>

                            <div onClick={() => handleQuickPrompt(language === 'en' ? "I have a severe headache" : "मुझे बहुत तेज़ सिरदर्द है")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group text-left">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Stethoscope size={20} /></div>
                                <h3 className="font-bold text-slate-800 text-sm">Symptom Checker</h3>
                                <p className="text-xs text-slate-500 mt-1">Describe feelings to get a potential diagnosis.</p>
                            </div>

                            <div onClick={() => handleQuickPrompt(language === 'en' ? "My dog is sleeping a lot" : "मेरा कुत्ता बहुत सो रहा है")} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group text-left">
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
                                
                                {/* TEXT MESSAGE */}
                                {msg.text && (
                                    <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-[#00d0f1] text-[#192a56] font-bold rounded-2xl rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'}`}>{msg.text}</div>
                                )}

                                {/* IMAGE MESSAGE */}
                                {msg.type === 'image' && (
                                    <div className="bg-white p-2 rounded-2xl rounded-tr-sm border border-slate-200 shadow-sm flex flex-col items-end">
                                        <img src={msg.fileData} alt="Uploaded report" className="w-48 h-auto max-h-48 object-cover rounded-xl border border-slate-100 mb-2" />
                                        <p className="text-[10px] text-slate-400 font-medium px-2 pb-1 w-full text-left">{msg.fileName} ({msg.fileSize})</p>
                                    </div>
                                )}

                                {/* PDF / WORD DOCUMENT MESSAGE */}
                                {(msg.type === 'pdf' || msg.type === 'document') && (
                                    <div className="bg-white p-4 rounded-2xl rounded-tr-sm border border-slate-200 shadow-sm flex items-center gap-4 min-w-[200px]">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${msg.type === 'pdf' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{msg.fileName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase">{msg.fileSize} • {msg.type}</p>
                                        </div>
                                    </div>
                                )}

                                {/* AI REPORT CARD */}
                                {msg.type === 'report' && msg.data && (
                                    <div className="bg-white rounded-2xl rounded-tl-sm border border-slate-200 shadow-xl overflow-hidden w-full sm:w-[420px]">
                                        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4 flex justify-between items-center">
                                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Activity size={16} className="text-[#00d0f1]" /> {language === 'en' ? 'AI Diagnosis' : 'AI निदान'}</h3>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">{msg.data.confidence} Match</span>
                                        </div>
                                        <div className="p-5 space-y-5">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{language === 'en' ? 'Detected Condition' : 'संभावित बीमारी'}</p>
                                                <div className="flex justify-between items-start"><p className="text-xl font-black text-slate-800">{msg.data.disease}</p><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${msg.data.severity === 'High' || msg.data.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{msg.data.severity} Risk</span></div>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2"><FileSearch size={12}/> {language === 'en' ? 'Analysis Summary' : 'विश्लेषण सारांश'}</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">{msg.data.findings}</p>
                                                {msg.data.symptoms && <div className="mt-3 flex flex-wrap gap-2">{msg.data.symptoms.map((sym, i) => (<span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 font-medium">{sym}</span>))}</div>}
                                            </div>
                                            <div className="pt-2">
                                                <Link to={`/user/book-appointment?specialty=${encodeURIComponent(msg.data.doctorType)}`} className="w-full bg-[#192a56] hover:bg-blue-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10">
                                                    {language === 'en' ? 'Consult' : 'परामर्श लें'} {msg.data.doctorType} <ChevronRight size={16} />
                                                </Link>
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
                    
                    {/* 🚀 FILE PREVIEW BEFORE SENDING */}
                    {selectedFile && (
                        <div className="mb-3 flex items-center gap-3 bg-slate-100 p-2 rounded-xl border border-slate-200 animate-in slide-in-from-bottom-2">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-300 overflow-hidden text-blue-500">
                                {selectedFile.type.includes('image') ? (
                                    <img src={selectedFile.base64} alt="pre" className="w-full h-full object-cover"/>
                                ) : (
                                    <File size={20}/>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-slate-500">{selectedFile.size}</p>
                            </div>
                            <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-[#00d0f1] focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all">
                        <div className="relative group">
                            <button type="button" onClick={() => fileInputRef.current.click()} className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-400 hover:text-[#00d0f1] rounded-xl flex items-center justify-center cursor-pointer transition-all border border-slate-200 shadow-sm">
                                <Upload size={18} />
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                    onChange={handleFileUpload} 
                                />
                            </button>
                        </div>
                        <input 
                            type="text" 
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)} 
                            placeholder={language === 'en' ? "Type a message or drop files here..." : "कोई संदेश लिखें या फाइल यहाँ छोड़ें..."} 
                            className="flex-1 bg-transparent outline-none text-sm text-slate-700 font-medium placeholder-slate-400 py-2.5 px-2" 
                        />
                        <button type="submit" disabled={!inputText.trim() && !selectedFile} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${inputText.trim() || selectedFile ? 'bg-[#192a56] text-white hover:bg-blue-900 shadow-blue-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Send size={18} /></button>
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
                    
                    {/* 🚨 NAYA: Clickable History List */}
                    {historyItems.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center mt-5">No previous analysis found.</p>
                    ) : (
                        historyItems.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => loadSpecificChat(item.id)} // 🚨 Load on click
                                className={`group p-3 rounded-xl border cursor-pointer transition-all ${currentChatId === item.id ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-xs font-bold line-clamp-1 ${currentChatId === item.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-[#00d0f1]'}`}>{item.title}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400"><Clock size={10} /> {item.date}</div>
                            </div>
                        ))
                    )}

                    {/* 🚨 NAYA: Naya start chat karne ka button */}
                    <button onClick={startNewChat} className="w-full mt-4 py-3 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-400 hover:text-[#00d0f1] hover:border-[#00d0f1] transition-all flex items-center justify-center gap-2">
                        <Plus size={16}/> Start New Chat
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AiAnalysis;