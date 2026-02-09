import React from 'react';
import { Star, MoreVertical } from 'lucide-react';

const DashboardTables = () => {

  // --- DUMMY DOCTORS DATA ---
  const doctorsData = [
    { id: 1, name: "Dr. Sandeep Gupta", speciality: "Veterinary Surgeon", earned: "₹45,000", rating: 5, img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { id: 2, name: "Dr. Priya Sharma", speciality: "Pet Dermatologist", earned: "₹38,500", rating: 4, img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { id: 3, name: "Dr. Ankit Verma", speciality: "Animal Cardiology", earned: "₹52,000", rating: 5, img: "https://randomuser.me/api/portraits/men/85.jpg" },
    { id: 4, name: "Dr. Neha Singh", speciality: "Pet Nutritionist", earned: "₹28,000", rating: 4, img: "https://randomuser.me/api/portraits/women/65.jpg" },
  ];

  // --- DUMMY PETS & OWNERS DATA ---
  const petsData = [
    { 
      id: 1, 
      petName: "Bruno", 
      type: "Dog (Labrador)", 
      owner: "Amit Kumar", 
      lastVisit: "Today, 10:30 AM", 
      fee: "₹500", 
      img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100" 
    },
    { 
      id: 2, 
      petName: "Bella", 
      type: "Cat (Persian)", 
      owner: "Sneha Reddy", 
      lastVisit: "Yesterday", 
      fee: "₹350", 
      img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=100&h=100" 
    },
    { 
      id: 3, 
      petName: "Rocky", 
      type: "Dog (German Shepherd)", 
      owner: "Rahul Singh", 
      lastVisit: "21 Oct 2026", 
      fee: "₹800", 
      img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=100&h=100" 
    },
    { 
      id: 4, 
      petName: "Coco", 
      type: "Parrot", 
      owner: "Vikram Malhotra", 
      lastVisit: "20 Oct 2026", 
      fee: "₹200", 
      img: "https://images.unsplash.com/photo-1552728089-57bdde30ebd1?auto=format&fit=crop&q=80&w=100&h=100" 
    },
  ];

  // Helper for Stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
      />
    ));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
      
      {/* --- LEFT: DOCTORS LIST --- */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Top Doctors</h3>
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Speciality</th>
                <th className="px-6 py-4">Earned</th>
                <th className="px-6 py-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctorsData.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={doctor.img} alt={doctor.name} className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-emerald-500 transition-all" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{doctor.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Verified</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{doctor.speciality}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{doctor.earned}</td>
                  <td className="px-6 py-4 flex gap-1">{renderStars(doctor.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RIGHT: PETS & OWNERS LIST --- */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Recent Patients (Pets)</h3>
          <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={20}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Pet Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {petsData.map((pet) => (
                <tr key={pet.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Pet Image */}
                      <img src={pet.img} alt={pet.petName} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{pet.petName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{pet.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{pet.owner}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{pet.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-bold">
                      {pet.fee}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardTables;