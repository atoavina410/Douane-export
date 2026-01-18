import React from 'react';
import { Users, Building2, Database, ShieldCheck, Activity, UserPlus, PieChart as PieIcon } from "lucide-react";
import StatsCard from './StatsCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Couleurs modernes pour les différents rôles
const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardAdmin({ data }) {
  return (
    <div className="space-y-8">
      {/* 1. Les KPI (Compteurs en haut) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          label="Utilisateurs" 
          value={data?.total_users || 0} 
          icon={Users} 
          color="text-blue-600" bg="bg-blue-50" 
        />
        <StatsCard 
          label="Données Total" 
          value={data?.total_valeurs || 0} 
          icon={Database} 
          color="text-emerald-600" bg="bg-emerald-50" 
        />
        <StatsCard 
          label="Directions" 
          value={data?.directions || 0} 
          icon={Building2} 
          color="text-purple-600" bg="bg-purple-50" 
        />
        <StatsCard 
          label="Logs Aujourd'hui" 
          value={data?.logs_today || 0} 
          icon={ShieldCheck} 
          color="text-amber-600" bg="bg-amber-50" 
        />
      </div>

      {/* 2. Graphique : Répartition des Utilisateurs par Rôle */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
            <PieIcon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-none uppercase tracking-tighter">Répartition des Accès</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Utilisateurs groupés par rôle système</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.chart_data || []}
                cx="50%"
                cy="50%"
                innerRadius={70}  // Effet Donut
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {(data?.chart_data || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Section Basse : Journal et Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des Dernières Activités */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <Activity size={20} className="text-blue-600" /> Journal d'activité récent
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline italic">Voir tout</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-50">
                  <th className="pb-4 font-black">Utilisateur</th>
                  <th className="pb-4 font-black">Action</th>
                  <th className="pb-4 font-black">Date</th>
                  <th className="pb-4 font-black text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.recent_logs && data.recent_logs.length > 0 ? (
                  data.recent_logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-700">
                        {log.utilisateur}
                      </td>
                      <td className="py-4 text-sm text-slate-500 italic">
                        {log.action}
                      </td>
                      <td className="py-4 text-[10px] font-mono text-slate-400">
                        {log.date}
                      </td>
                      <td className="py-4 text-right text-[10px]">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase">
                          {log.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-400 italic text-sm">
                      Aucune activité enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widgets de droite */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h4 className="font-black text-blue-400 mb-2 uppercase text-xs tracking-widest">Administration</h4>
            <p className="text-sm opacity-80 mb-6 font-medium">Gérez les accès et les permissions de vos collaborateurs.</p>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-400 transition-all active:scale-95">
              <UserPlus size={16} /> Nouvel Utilisateur
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-black text-slate-400 uppercase mb-2">Santé Système</p>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">98.2%</div>
            <p className="text-[10px] text-green-500 font-bold uppercase mt-1 flex items-center justify-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span> En ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}