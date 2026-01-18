import React from 'react';

export default function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col transition-transform hover:scale-105">
      <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}