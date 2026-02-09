import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
        >
            <X size={18}/>
        </button>

        <div className="flex flex-col items-center text-center">
            
            {/* Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                <LogOut size={32} className="text-red-500 ml-1"/>
            </div>

            {/* Content */}
            <h3 className="text-xl font-black text-slate-800 mb-2">Logging Out?</h3>
            <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
                Are you sure you want to end your session? You will be redirected to the login screen.
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full mt-8">
                <button 
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wide hover:bg-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                    Yes, Logout
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
