import React, { useState, useEffect } from 'react';
import { Star, MoreVertical, Loader2 } from 'lucide-react';

const DashboardTables = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [petsData, setPetsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH DATA FROM API ---
  useEffect(() => {
    const fetchData = async () => {
      const storedData = JSON.parse(localStorage.getItem('user_token'));
      
      // If not logged in, stop loading
      if (!storedData || !storedData.token) {
          setIsLoading(false);
          return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard-tables', {
          headers: { 'Authorization': `Bearer ${storedData.token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setDoctorsData(data.doctors || []);
          setPetsData(data.patients || []);
        }
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. HELPER FUNCTIONS ---
  
  // Format Currency (₹)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR', 
        maximumSignificantDigits: 3 
    }).format(amount);
  };

  // Format Date (e.g., "12 Oct 2026")
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Render Star Ratings
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
      />
    ));
  };

  // --- 3. LOADING STATE ---
  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20 w-full">
            <Loader2 className="animate-spin text-[#192a56]" size={40} />
        </div>
    );
  }

  // --- 4. RENDER COMPONENT ---
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
      
      {/* --- LEFT TABLE: TOP DOCTORS --- */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Top Doctors</h3>
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
              <tr>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Speciality</th>
                <th className="px-6 py-4">Earned</th>
                <th className="px-6 py-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctorsData.length > 0 ? (
                  doctorsData.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={doctor.img || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                            alt={doctor.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-emerald-500 transition-all" 
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{doctor.name}</p>
                            {doctor.isVerified && (
                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Verified</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {doctor.speciality}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                        {formatCurrency(doctor.earned)}
                      </td>
                      <td className="px-6 py-4 flex gap-1">
                        {renderStars(doctor.rating)}
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                          No doctors found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RIGHT TABLE: RECENT PATIENTS --- */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Recent Patients (Pets)</h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreVertical size={20}/>
          </button>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
              <tr>
                <th className="px-6 py-4">Pet Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {petsData.length > 0 ? (
                  petsData.map((pet) => (
                    <tr key={pet._id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={pet.img || "https://cdn-icons-png.flaticon.com/512/1144/1144760.png"} 
                            alt={pet.name} 
                            className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" 
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{pet.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{pet.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {pet.ownerName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {formatDate(pet.lastVisit)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-bold">
                          {formatCurrency(pet.lastFee)}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">
                          No patients found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardTables;