import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Zap, ShieldCheck, Activity, Clock, Phone, Mail, MapPin, Facebook, Twitter } from 'lucide-react';

// --- Navbar Component ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`flex items-center justify-between px-8 sticky top-0 z-50 transition-all duration-500 border-b ${
      isScrolled 
        ? 'py-4 shadow-2xl bg-white/90 border-slate-100 backdrop-blur-xl' 
        : 'py-5 bg-white/60 border-transparent backdrop-blur-xl'
    }`}>
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="bg-emerald-600 p-2.5 rounded-xl group-hover:rotate-[15deg] transition-transform duration-300 shadow-lg shadow-emerald-200">
          <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-slate-800">VetCare<span className="text-emerald-600">AI</span></span>
      </div>
      
      <div className="hidden md:flex items-center gap-10 text-slate-600 font-semibold">
        <Link to="/" className="text-emerald-600 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-emerald-500">Home</Link>
        <Link to="/appointments" className="hover:text-emerald-600 transition-all">Appointments</Link>
        <Link to="/ai-checker" className="hover:text-emerald-600 transition-all">AI Checker</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login" className="px-6 py-2.5 text-slate-700 font-bold hover:text-emerald-600 transition-all cursor-pointer">
          Login
        </Link>
        <Link to="/signup" className="px-7 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-xl transition-all active:scale-95 text-center inline-block">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

// --- Hero Section ---
const Hero = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2500;
    const end = 500;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-8 py-8 lg:py-12 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-6">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          AI-Powered Veterinary Care
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
           Expert Pet Care, <br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Made Simple.</span>
        </h1>
        
        <p className="text-lg text-slate-500 mb-8 max-w-md leading-snug font-medium">
            Book appointments, get AI-powered symptom analysis, and manage your pet's health journey—all in one trusted platform.
        </p>

        <div className="flex flex-wrap gap-4 mb-10">
            <button className="group relative px-7 py-3.5 bg-emerald-600 text-white font-bold rounded-xl overflow-hidden btn-magnetic shadow-lg shadow-emerald-200">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <div className="relative flex items-center gap-2 text-sm">
                    <Calendar className="w-5 h-5" />
                    <span>Book Appointment</span>
                </div>
            </button>

            <button className="group px-7 py-3.5 bg-white border-2 border-emerald-500/20 text-emerald-700 font-bold rounded-xl btn-magnetic hover:border-emerald-500 text-sm">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    <span>Check Symptoms</span>
                </div>
            </button>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Certified Vets</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500" /> 24/7 Available</span>
        </div>
      </div>

      <div className="relative">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
           {/* Replace src with your actual image path */}
           <img src="https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=1000&auto=format&fit=crop" alt="Pet Doctor" className="w-full object-cover aspect-video lg:aspect-[4/3]" />
        </div>
        
        <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl animate-float border border-slate-50 flex items-center gap-3">
            <div className="bg-orange-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 text-white">
                <Calendar className="w-5 h-5" />
            </div>
            <div>
                <div className="text-xl font-black text-slate-900 leading-none">{count}+</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Appointments</div>
            </div>
        </div>
      </div>
    </main>
  );
};

// --- Features Section ---
const Features = () => {
  const FeatureCard = ({ icon: Icon, title, desc, colorClass, badge }) => (
    <div className="group relative bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] hover:border-emerald-200">
        {badge && (
            <div className="absolute -top-4 right-8 bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg animate-pulse">
                {badge}
            </div>
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colorClass}`}>
            <Icon className="w-7 h-7" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        <div className="absolute inset-0 rounded-[2rem] bg-emerald-400/0 group-hover:bg-emerald-400/5 transition-colors pointer-events-none"></div>
    </div>
  );

  return (
    <section className="py-20 bg-[#f8fafc] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Everything Your <span className="text-emerald-600">Clinic Needs</span>
                </h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
                    A complete veterinary management platform powered by advanced neural analysis.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
                <FeatureCard 
                    icon={Calendar} 
                    title="Easy Booking" 
                    desc="Smart scheduling with predictive slot optimization for busy clinics." 
                    colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                />
                <FeatureCard 
                    icon={Zap} 
                    title="AI Symptom Checker" 
                    desc="Neural network analysis of pet symptoms for instant diagnostic support." 
                    colorClass="bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
                    badge="Advanced ML"
                />
                <FeatureCard 
                    icon={ShieldCheck} 
                    title="Secure Payments" 
                    desc="One-click encrypted transactions with automated insurance processing." 
                    colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                />
                <FeatureCard 
                    icon={Activity} 
                    title="Reception Dashboard" 
                    desc="Centralized node for real-time patient flow and inventory management." 
                    colorClass="bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                />
                <FeatureCard 
                    icon={Clock} 
                    title="Queue Display" 
                    desc="Dynamic wait-time prediction using shortest-path queue algorithms." 
                    colorClass="bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
                />
                <FeatureCard 
                    icon={Heart} 
                    title="Predictive History" 
                    desc="ML-based health trend analysis from past visits to prevent future illnesses." 
                    colorClass="bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
                />
            </div>
        </div>
    </section>
  );
};

// --- Footer Section ---
const Footer = () => (
    <footer className="bg-[#1a2b2b] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">VetCare AI</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-sm max-w-xs">
                        AI-powered veterinary care platform making pet health simple, accessible, and smart for every pet owner.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer">
                            <Twitter className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white uppercase tracking-wider">Quick Links</h4>
                    <ul className="space-y-4 text-slate-400 font-medium text-sm">
                        <li><Link to="/booking" className="hover:text-emerald-400 transition-colors">Book Appointment</Link></li>
                        <li><Link to="/ai-checker" className="hover:text-emerald-400 transition-colors">AI Symptom Checker</Link></li>
                        <li><Link to="/portal" className="hover:text-emerald-400 transition-colors">Reception Portal</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white uppercase tracking-wider">Services</h4>
                    <ul className="space-y-4 text-slate-400 font-medium text-sm">
                        <li>General Checkups</li>
                        <li>Vaccinations</li>
                        <li>Surgery</li>
                        <li>Emergency Care</li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white uppercase tracking-wider">Contact Us</h4>
                    <ul className="space-y-4 text-slate-400 font-medium text-sm">
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-emerald-500" />
                            <span>+1 (555) 123-4567</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-500" />
                            <span>hello@vetcare.ai</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-emerald-500 mt-1" />
                            <span>123 Pet Care Lane, Vet City</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm font-medium">
                    © 2026 VetCare AI. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
);

// --- Main Page Assembly ---
const Home = () => {
  return (
    <div className="hero-gradient min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
