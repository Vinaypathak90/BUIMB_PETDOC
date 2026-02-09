import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- AUTH & PUBLIC PAGES ---
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// --- ADMIN PAGES ---
import AdminDashboard from './pages/admin/AdminDashboard';
import Appointments from './pages/admin/Appointments';
import Doctors from './pages/admin/Doctors';
import Patients from './pages/admin/Patients';
import Reviews from './pages/admin/Reviews';
import Transactions from './pages/admin/Transactions';
import Settings from './pages/admin/Settings'; 
import Profile from './components/admin/Profile';
import Authentication from './pages/admin/Authentication';
import Specialities from './pages/admin/Specialities';

// --- USER (PATIENT) PAGES ---
import UserDashboard from './pages/user/UserDashboard';
import BookAppointment from './pages/user/BookAppointment';
import TrackAppointment from './pages/user/TrackAppointment';
import AiAnalysis from './pages/user/AiAnalysis';
import PastAppointments from './pages/user/PastAppointments';
import TransactionHistory from './pages/user/TransactionHistory';
import Setting from './pages/user/uSettings';

// --- DOCTOR PAGES ---
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorInvoices from './pages/doctor/DoctorInvoices';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorChat from './pages/doctor/DoctorChat';
import DoctorProfileSettings from './pages/doctor/DoctorProfileSettings';
import DoctorSpecialties from './pages/doctor/DoctorSpecialties';

// --- RECEPTION PAGES ---
import ReceptionPanel from './pages/reception/ReceptionPanel';

// ==========================================
// 🛡️ PROTECTED ROUTE COMPONENT
// ==========================================
// This wrapper checks if the user is logged in and has the correct role.
const ProtectedRoute = ({ children, allowedRole }) => {
  const storedUser = JSON.parse(localStorage.getItem('user_token'));

  // 1. If not logged in, redirect to Login
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but wrong role (e.g. Patient trying to access Admin), redirect to Home
  if (allowedRole && storedUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // 3. Access Granted
  return children;
};

// ==========================================
// 🚀 MAIN APP COMPONENT
// ==========================================
function App() {
  const [user, setUser] = useState(null);

  // Check login status on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user_token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handler to update state when Login component succeeds
  const handleLogin = (role) => {
    const storedUser = localStorage.getItem('user_token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return (
    <Router>
      <Routes>
        
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        
        {/* Pass handleLogin to Login so it can update App state */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- 🔒 ADMIN ROUTES (Protected) --- */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="patients" element={<Patients />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="authentication" element={<Authentication />} />
              <Route path="specialities" element={<Specialities />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* --- 🔒 RECEPTION ROUTES (Protected) --- */}
        <Route path="/reception" element={
          <ProtectedRoute allowedRole="receptionist">
            <ReceptionPanel />
          </ProtectedRoute>
        } />

        {/* --- 🔒 DOCTOR ROUTES (Protected) --- */}
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRole="doctor">
            <Routes>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="invoices" element={<DoctorInvoices />} />
              <Route path="reviews" element={<DoctorReviews />} />
              <Route path="messages" element={<DoctorChat />} />
              <Route path="profile-settings" element={<DoctorProfileSettings />} />
              <Route path="specialties" element={<DoctorSpecialties />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* --- 🔒 USER/PATIENT ROUTES (Protected) --- */}
        <Route path="/user/*" element={
          <ProtectedRoute allowedRole="patient">
            <Routes>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="book-appointment" element={<BookAppointment />} />
              <Route path="track-appointment" element={<TrackAppointment />} />
              <Route path="ai-analysis" element={<AiAnalysis />} />
              <Route path="appointment-history" element={<PastAppointments />} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="settings" element={<Setting />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Fallback Route (404) */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;