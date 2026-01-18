import React from 'react';
import { Search, Globe, PieChart, Zap } from "lucide-react";
import StatCard from './StatsCard';

export default function UtilisateurDashboard() {
  return (
    <div className="space-y-8">
      {/* Aperçu Marché */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pays Actifs" value="42" icon={Globe} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Top Catégorie" value="Machines" icon={Zap} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Consultations" value="1.2k" icon={Search} color="text-slate-600" bg="bg-slate-50" />
      </div>

      {/* Zone de recherche rapide simplifiée */}
      <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <Search size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Besoin d'une valeur précise ?</h3>
        <p className="text-slate-400 max-w-md mb-8">Accédez instantanément aux derniers prix certifiés par la douane pour vos opérations d'exportation.</p>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl">
          Aller à la consultation
        </button>
      </div>
    </div>
  );
}