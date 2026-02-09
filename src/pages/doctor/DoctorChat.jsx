import React, { useState, useEffect, useRef } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Search, MoreVertical, Phone, Video, 
  Paperclip, Send, Smile, Mic, ChevronLeft,
  Check, CheckCheck
} from 'lucide-react';

const DoctorChat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); 
  
  const messagesEndRef = useRef(null);

  // --- MOCK CONTACTS ---
  const [contacts, setContacts] = useState([
    { id: 'admin', name: "Super Admin", role: "Admin", status: "online", img: "https://cdn-icons-png.flaticon.com/512/2942/2942813.png", unread: 0, lastMsg: "Please update your license." },
    { id: 'recep1', name: "Sarah (Reception)", role: "Staff", status: "online", img: "https://randomuser.me/api/portraits/women/44.jpg", unread: 3, lastMsg: "Patient is waiting in lobby." },
    { id: 'pt001', name: "Charlene Reed", role: "Patient", status: "offline", img: "https://randomuser.me/api/portraits/women/65.jpg", unread: 0, lastMsg: "Thank you doctor!" },
    { id: 'pt002', name: "Travis Trimble", role: "Patient", status: "online", img: "https://randomuser.me/api/portraits/men/32.jpg", unread: 1, lastMsg: "Can I take this medicine?" },
    { id: 'pt003', name: "Carl Kelly", role: "Patient", status: "offline", img: "https://randomuser.me/api/portraits/men/85.jpg", unread: 0, lastMsg: "See you tomorrow." },
  ]);

  // --- MOCK MESSAGES HISTORY ---
  const [messages, setMessages] = useState({
    'recep1': [
        { id: 1, sender: 'them', text: "Doctor, are you available?", time: "10:00 AM", status: 'read' },
        { id: 2, sender: 'me', text: "Yes, currently in OPD.", time: "10:05 AM", status: 'read' },
        { id: 3, sender: 'them', text: "Okay, sending next patient.", time: "10:06 AM", status: 'read' },
        { id: 4, sender: 'them', text: "Patient is waiting in lobby.", time: "10:15 AM", status: 'unread' }
    ],
    'admin': [
        { id: 1, sender: 'them', text: "Welcome Dr. Edalin!", time: "Yesterday", status: 'read' }
    ],
    'pt002': [
        { id: 1, sender: 'me', text: "How is the pain now?", time: "09:00 AM", status: 'read' },
        { id: 2, sender: 'them', text: "Can I take this medicine with milk?", time: "09:30 AM", status: 'unread' }
    ]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
        id: Date.now(),
        sender: 'me',
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
    };

    setMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), newMsg]
    }));

    setMessageInput("");

    setIsTyping(true);
    setTimeout(() => {
        setIsTyping(false);
        const replyMsg = {
            id: Date.now() + 1,
            sender: 'them',
            text: "Okay, I understood. Thank you!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
        };
        setMessages(prev => ({
            ...prev,
            [activeChat]: [...(prev[activeChat] || []), replyMsg]
        }));
    }, 2000);
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeContact = contacts.find(c => c.id === activeChat);

  return (
    // FIX 1: Root container fixed to screen height, no window scrolling
    <div className="bg-[#f0f2f5] h-screen w-full relative font-sans overflow-hidden flex">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <DoctorSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative lg:ml-64 w-full transition-all duration-300">
        
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* LEFT SIDE: CONTACT LIST */}
            {/* FIX 2: Added logic to hide list on mobile when chat is active */}
            <div className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                
                <div className="p-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-full"><Menu size={20}/></button>
                             <h2 className="text-xl font-black text-[#192a56]">Chats</h2>
                        </div>
                        <div className="flex gap-2">
                             <button className="p-2 hover:bg-slate-100 rounded-full"><MoreVertical size={20} className="text-slate-500"/></button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute top-3 left-3 text-slate-400"/>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00d0f1]/50" 
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredContacts.map(contact => (
                        <div 
                            key={contact.id}
                            onClick={() => setActiveChat(contact.id)}
                            className={`flex items-center gap-3 p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${activeChat === contact.id ? 'bg-blue-50 border-l-4 border-l-[#192a56]' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <img src={contact.img} alt="" className="w-12 h-12 rounded-full object-cover" />
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            </div>
                            {/* FIX 3: min-w-0 prevents text from pushing layout out */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-sm truncate ${activeChat === contact.id ? 'text-[#192a56]' : 'text-slate-800'}`}>{contact.name}</h4>
                                    <span className="text-[10px] text-slate-400 shrink-0">10:00 AM</span>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-xs text-slate-500 truncate">{contact.lastMsg}</p>
                                    {contact.unread > 0 && (
                                        <span className="bg-[#00d0f1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center ml-2">
                                            {contact.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: CHAT WINDOW */}
            {/* FIX 4: min-w-0 ensures this panel doesn't expand parent container */}
            <div className={`flex-1 flex flex-col h-full bg-[#f0f2f5] relative min-w-0 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 bg-white border-b border-slate-200 px-4 flex justify-between items-center shadow-sm shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-600"><ChevronLeft size={24}/></button>
                                <img src={activeContact.img} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800 truncate">{activeContact.name}</h3>
                                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                        {activeContact.status === 'online' ? 'Online' : 'Last seen recently'}
                                    </p>
                                </div>
                                <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded hidden sm:inline-block ${
                                    activeContact.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                                    activeContact.role === 'Staff' ? 'bg-orange-100 text-orange-700' : 
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {activeContact.role}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-3">
                                <button className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"><Phone size={18}/></button>
                                <button className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"><Video size={18}/></button>
                                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><MoreVertical size={20}/></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed bg-opacity-5">
                            <div className="flex justify-center">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full shadow-sm">Today</span>
                            </div>

                            {(messages[activeChat] || []).map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm font-medium break-words ${
                                        msg.sender === 'me' 
                                        ? 'bg-[#192a56] text-white rounded-br-none' 
                                        : 'bg-white text-slate-800 rounded-bl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className={`flex justify-end items-center gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                                            <span>{msg.time}</span>
                                            {msg.sender === 'me' && (
                                                msg.status === 'read' 
                                                ? <CheckCheck size={12} className="text-[#00d0f1]"/> 
                                                : <Check size={12}/>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-200 shrink-0 z-10">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"><Smile size={24}/></button>
                                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Paperclip size={24}/></button>
                                
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#192a56]/20 transition-all min-w-0"
                                />
                                
                                {messageInput.trim() ? (
                                    <button type="submit" className="p-3 bg-[#192a56] text-white rounded-xl hover:bg-blue-900 transition-all shadow-md transform hover:scale-105 shrink-0">
                                        <Send size={20} fill="currentColor" className="ml-0.5"/>
                                    </button>
                                ) : (
                                    <button type="button" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 shrink-0">
                                        <Mic size={20}/>
                                    </button>
                                )}
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/50">
                        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <div className="w-20 h-20 bg-[#192a56] rounded-full flex items-center justify-center">
                                <Send size={40} className="text-white ml-1"/>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">PetDoc Messenger</h2>
                        <p className="text-slate-500 mt-2 max-w-sm">
                            Connect with patients, staff, and admin instantly.
                        </p>
                        <div className="mt-8 flex gap-4 text-xs font-bold text-slate-400 uppercase">
                            <span className="flex items-center gap-1"><CheckCheck size={14}/> Secure</span>
                            <span className="flex items-center gap-1"><CheckCheck size={14}/> Private</span>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorChat;