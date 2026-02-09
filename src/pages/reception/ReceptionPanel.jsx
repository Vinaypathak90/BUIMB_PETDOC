import React, { useState, useEffect } from 'react';
import ReceptionSidebar from '../../components/reception/ReceptionSidebar';
import ReceptionHeader from '../../components/reception/ReceptionHeader';
import DashboardHome from '../../components/reception/DashboardHome';
import NewRegistrationForm from '../../components/reception/NewRegistrationForm'; 
import AppointmentsList from '../../components/reception/AppointmentsList';
import PatientsList from '../../components/reception/PatientsList';
import LiveQueueSnapshot from '../../components/reception/LiveQueueSnapshot';

import DoctorAvailability from '../../components/reception/DoctorAvailability'; // ✅ New Import
import BillingPanel from '../../components/reception/BillingPanel';
import  NotificationsWidget from '../../components/reception/NotificationsWidget'; // ✅ New Import
import NotificationsPage from '../../components/reception/NotificationsPage'; // ✅ New Import
import DailyReports from '../../components/reception/DailyReports';

import MyProfile from '../../components/reception/MyProfile';

const ReceptionPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [queueData, setQueueData] = useState([]);

  // ✅ Navigation Helper Function
  const handleNavigation = (tabName) => {
    setActiveTab(tabName);
  };

  // ✅ Effect: Refresh Queue Data when 'queue' tab is active
  useEffect(() => {
    if (activeTab === 'queue') {
      const storedData = JSON.parse(localStorage.getItem('reception_data')) || [];
      setQueueData(storedData.filter(item => item.status === 'Waiting'));
    }
  }, [activeTab]);

  // ✅ Helper: Handle Status Update from Queue Page (e.g., Send to Doctor)
  const handleQueueUpdate = (id, newStatus) => {
    const allData = JSON.parse(localStorage.getItem('reception_data')) || [];
    const updatedData = allData.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    localStorage.setItem('reception_data', JSON.stringify(updatedData));
    
    // Update local state to reflect change immediately
    setQueueData(updatedData.filter(item => item.status === 'Waiting'));
  };

  return (
    <div className="flex h-screen bg-[#f0f4f8] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <ReceptionSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* HEADER */}
        <ReceptionHeader 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen} 
        />

        {/* DYNAMIC CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            {/* Page Title */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-2">
                    {activeTab === 'dashboard' && 'Dashboard Overview'}
                    {activeTab === 'walkin' && 'Patient Registration'}
                    {activeTab === 'appointments' && 'Scheduled Appointments'}
                    {activeTab === 'patients' && 'All Patients List'}
                    {activeTab === 'queue' && 'Live Token Queue'}
                    
                    {!['dashboard', 'walkin', 'appointments', 'patients', 'queue'].includes(activeTab) && 
                      `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                    }
                </h2>
                <p className="text-sm font-medium text-slate-500">
                    {activeTab === 'walkin' ? 'Enter patient details below.' : `Manage ${activeTab} section details here.`}
                </p>
            </div>

            {/* CONTENT SWITCHER */}
            <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                
                {/* 1. Dashboard View */}
                {activeTab === 'dashboard' && (
                    <DashboardHome onNavigate={handleNavigation} /> 
                )}

                {/* 2. Walk-in View (New Registration Form) */}
                {activeTab === 'walkin' && (
                    <NewRegistrationForm 
                        onCancel={() => setActiveTab('dashboard')} 
                        onSave={() => setActiveTab('dashboard')} 
                    />
                )}

                {/* 3. Appointments List View */}
                {activeTab === 'appointments' && (
                    <AppointmentsList />
                )}

                {/* 4. Patients List View */}
                {activeTab === 'patients' && (
                    <PatientsList />
                )}

                {/* 5. Live Queue View */}
                {activeTab === 'queue' && (
                    <div className="h-[calc(100vh-200px)]">
                        <LiveQueueSnapshot 
                            queueData={queueData} 
                            onUpdateStatus={handleQueueUpdate} 
                        />
                    </div>
                )}
{/* 5. Doctor Availability View */}
{activeTab === 'doctors' && (
    <DoctorAvailability />
)}
                
{/* 6. Billing Module */}
{activeTab === 'billing' && (
    <BillingPanel />
)}
{/*-* 7. Notifications View */}
{activeTab === 'notifications' && (
    <NotificationsPage />
)}
{/*- 7. Daily Reports View */}
{activeTab === 'reports' && (
    <DailyReports />
)}

{activeTab === 'profile' && (
    <MyProfile />
)}

            </div>

        </main>
      </div>
    </div>
  );
};

export default ReceptionPanel;