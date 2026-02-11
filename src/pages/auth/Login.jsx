import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Heart, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin }) => { // Accept onLogin prop from App.js
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ REAL BACKEND CALL
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Login Success
        setLoading(false);
        setSuccess(true);
        
        // Save Session
        localStorage.setItem('user_token', JSON.stringify(data)); 

        // Redirect based on role
        setTimeout(() => {
          if (onLogin) onLogin(data.role);

          if (data.role === 'receptionist') navigate('/reception');
          else if (data.role === 'admin') navigate('/admin/dashboard');
          else if (data.role === 'doctor') navigate('/doctor/dashboard');
          else navigate('/user/dashboard');
        }, 1000);
      } else {
        // ❌ Login Failed
        setLoading(false);
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setLoading(false);
      setError('Server Error. Ensure backend is running.');
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
      `}</style>

      <div className="max-w-4xl w-full grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        
        {/* Left Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-emerald-600 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10 group cursor-pointer">
              <div className="bg-white/20 backdrop-blur-xl p-2 rounded-xl group-hover:rotate-12 transition-all">
                <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight">VetCare AI</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Welcome <br/> <span className="text-emerald-200">Back Home</span>.
            </h2>
            <p className="text-emerald-50/80 text-lg font-medium">
              Access your dashboard to manage <br/> patient care and records.
            </p>
          </div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider leading-none mb-1">Encrypted Session</p>
                <p className="text-[10px] text-emerald-100/70">AES-256 Bit Security Active</p>
              </div>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-40"></div>
        </div>

        {/* Right Login Form Side */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-slate-500 font-semibold text-sm">Welcome back! Please enter your details.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center animate-pulse">
                {error}
            </div>
          )}

          <button className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 mb-6">
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="w-full h-px bg-slate-100"></div>
            <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 uppercase">Or with email</span>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="group">
              <label className="block text-[12px] font-bold text-slate-700 mb-1 ml-1 transition-colors group-focus-within:text-emerald-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vetcare.ai" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-1 px-1">
                <label className="block text-[12px] font-bold text-slate-700 transition-colors group-focus-within:text-emerald-600 uppercase tracking-wider">Password</label>
                <Link to="#" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">Keep me logged in</label>
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className={`w-full py-4 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all active:scale-[0.98] mt-2 uppercase tracking-widest ${
                success ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-emerald-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : success ? (
                "Success! Redirecting..."
              ) : (
                "Authorize & Login"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold text-slate-500">
            New to the platform? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 decoration-2">Create Identity</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;