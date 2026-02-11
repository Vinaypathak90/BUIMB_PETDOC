import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Heart, ShieldCheck } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Define State for Form Data
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    password: ''
  });

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Signup Submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic Validation: Ensure Role is selected
    if (!formData.role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    try {
      // ✅ API CALL TO BACKEND
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success!
        setLoading(false);
        setSuccess(true);
        
        // Redirect after animation
        setTimeout(() => {
          navigate('/login'); 
        }, 1500);
      } else {
        // Failed (e.g. Email exists)
        setError(data.message || 'Signup Failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Server Error. Is backend running?');
      setLoading(false);
    }
  };

  return (
    <div className="auth-gradient bg-slate-50 min-h-screen flex items-center justify-center p-4">
      {/* Page Specific Styles */}
      <style>{`
        .auth-gradient {
            background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.1), transparent),
                        radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.08), transparent);
        }
        select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 1rem center;
            background-repeat: no-repeat;
            background-size: 1.2em 1.2em;
        }
      `}</style>

      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        
        {/* Left Side (Branding) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-600 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 group cursor-pointer">
              <div className="bg-white/20 backdrop-blur-xl p-2 rounded-xl group-hover:rotate-12 transition-all">
                <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight">VetCare AI</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Empowering <br/> <span className="text-emerald-200">Pet Healthcare</span>.
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium">
              Join the ecosystem built for <br/> veterinary excellence.
            </p>
          </div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">Trusted Security Enabled</p>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-40"></div>
        </div>

        {/* Right Side (Form) */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Get Started</h1>
            <p className="text-slate-500 font-semibold text-sm">Create your professional account.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100 animate-pulse">
                {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="group">
              <label className="block text-[12px] font-bold text-slate-700 mb-1 ml-1 uppercase">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="Dr. John Doe" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm" 
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="group">
              <label className="block text-[12px] font-bold text-slate-700 mb-1 ml-1 uppercase">Identify As</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Briefcase size={18} />
                </span>
                <select 
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="doctor">Doctors / Specialists</option>
                  <option value="patient">Pet Owner (User)</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {(formData.role === 'admin' || formData.role === 'doctor') && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] rounded-lg animate-in fade-in slide-in-from-top-1">
                  Note: {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} accounts need clinic approval.
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="group">
              <label className="block text-[12px] font-bold text-slate-700 mb-1 ml-1 uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="name@clinic.com" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm" 
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[12px] font-bold text-slate-700 mb-1 ml-1 uppercase">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className={`w-full py-4 text-white font-extrabold text-md rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2 uppercase tracking-widest ${
                success ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {loading ? "Creating..." : success ? "Account Created!" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 font-bold text-sm">
            Already member? 
            <Link to="/login" className="ml-1 text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;