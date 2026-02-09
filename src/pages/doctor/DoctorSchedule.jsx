import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/doctor/DoctorSidebar'; 
import { 
  Menu, Bell, Calendar, Clock, Plus, Trash2, Save, 
  CheckCircle, AlertCircle, X, ChevronDown, Monitor
} from 'lucide-react';

const DoctorSchedule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [slotDuration, setSlotDuration] = useState('30'); // Minutes
  const [showAddModal, setShowAddModal] = useState(false);
  
  // --- NEW SLOT STATE ---
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });

  // --- SCHEDULE STATE (Initial Mock Data) ---
  const [schedule, setSchedule] = useState({
    Sunday: [],
    Monday: [
        { id: 1, start: '09:00', end: '10:00' },
        { id: 2, start: '10:00', end: '11:00' }
    ],
    Tuesday: [
        { id: 3, start: '14:00', end: '15:00' }
    ],
    Wednesday: [],
    Thursday: [],
    Friday: [
        { id: 4, start: '09:00', end: '12:00' }
    ],
    Saturday: []
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // --- LOAD DATA ---
  useEffect(() => {
    const savedSchedule = JSON.parse(localStorage.getItem('doctorSchedule'));
    if (savedSchedule) {
        setSchedule(savedSchedule);
    }
  }, []);

  // --- HANDLERS ---
  
  const handleAddSlot = () => {
    if (!newSlot.start || !newSlot.end) return alert("Please select start and end time");
    if (newSlot.start >= newSlot.end) return alert("End time must be after start time");

    const newEntry = { id: Date.now(), start: newSlot.start, end: newSlot.end };
    
    const updatedSchedule = {
        ...schedule,
        [selectedDay]: [...schedule[selectedDay], newEntry]
    };

    setSchedule(updatedSchedule);
    setNewSlot({ start: '', end: '' });
    setShowAddModal(false);
  };

  const removeSlot = (id) => {
    const updatedSchedule = {
        ...schedule,
        [selectedDay]: schedule[selectedDay].filter(slot => slot.id !== id)
    };
    setSchedule(updatedSchedule);
  };

  const handleSave = () => {
    localStorage.setItem('doctorSchedule', JSON.stringify(schedule));
    alert("Schedule Updated Successfully!");
  };

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
                <h2 className="text-xl font-black text-[#192a56]">Schedule Timings</h2>
            </div>
            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"><Bell size={20} /></button>
            </div>
        </header>
        
        <main className="p-6 md:p-8 max-w-5xl mx-auto">
          
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Global Settings Card */}
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Timing Slot Duration</h3>
                    <p className="text-sm text-slate-500">Select the default duration for each appointment slot.</p>
                </div>
                <div className="relative">
                    <select 
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 px-6 py-3 pr-10 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                    >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-4 text-slate-400 pointer-events-none"/>
                </div>
            </div>

            {/* 2. Main Schedule Editor */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Days Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-2">
                    {days.map((day) => (
                        <button 
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                selectedDay === day 
                                ? 'bg-[#192a56] text-white shadow-lg' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Calendar size={20} className="text-[#00d0f1]"/> {selectedDay} Schedule
                        </h3>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#00d0f1] text-[#192a56] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-lg"
                        >
                            <Plus size={18}/> Add Slot
                        </button>
                    </div>

                    {/* Slots Grid */}
                    {schedule[selectedDay].length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {schedule[selectedDay].map((slot) => (
                                <div key={slot.id} className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center hover:border-[#00d0f1] hover:shadow-md transition-all">
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 text-[#192a56] font-black text-lg">
                                            <Clock size={18}/> 
                                            <span>{slot.start} - {slot.end}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase">Available</p>
                                    </div>
                                    
                                    {/* Delete Button (On Hover) */}
                                    <button 
                                        onClick={() => removeSlot(slot.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                    >
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <Monitor size={48} className="mx-auto text-slate-300 mb-4"/>
                            <h4 className="text-lg font-bold text-slate-500">No Slots Available</h4>
                            <p className="text-sm text-slate-400 mb-6">You haven't added any time slots for {selectedDay}.</p>
                            <button onClick={() => setShowAddModal(true)} className="text-[#00d0f1] font-bold hover:underline">Add Now</button>
                        </div>
                    )}
                </div>

                {/* Footer Save */}
                <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-[#192a56] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-900 shadow-xl transition-all"
                    >
                        <Save size={18}/> Save Changes
                    </button>
                </div>
            </div>

          </div>

        </main>
      </div>

      {/* --- ADD SLOT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#192a56]/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative">
                <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
                
                <h3 className="text-xl font-black text-slate-800 mb-2">Add Time Slots</h3>
                <p className="text-sm text-slate-500 mb-6">Set availability for <span className="font-bold text-[#00d0f1]">{selectedDay}</span></p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Start Time</label>
                        <input 
                            type="time" 
                            value={newSlot.start}
                            onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">End Time</label>
                        <input 
                            type="time" 
                            value={newSlot.end}
                            onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#00d0f1]"
                        />
                    </div>

                    <button 
                        onClick={handleAddSlot}
                        className="w-full bg-[#00d0f1] text-[#192a56] py-3.5 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                        <Plus size={18}/> Add Slot
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default DoctorSchedule;
