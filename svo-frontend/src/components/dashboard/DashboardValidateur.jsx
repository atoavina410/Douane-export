import React from 'react';
import { ClipboardCheck, AlertCircle, Clock, TrendingDown, ChevronRight } from "lucide-react";
import StatCard from './StatsCard'; 

export default function DashboardValidateur({ data }) {
  return (
    <div className="space-y-8">
      {/* KPIs de validation dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="À Valider" 
          value={data?.a_valider || 0} 
          icon={Clock} 
          color="text-orange-600" 
          bg="bg-orange-50" 
        />
        <StatCard 
          label="Validés / Mois" 
          value={data?.valides_mois || 0} 
          icon={ClipboardCheck} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
        <StatCard 
          label="Alertes Prix" 
          value={data?.alertes_prix || 0} 
          icon={AlertCircle} 
          color="text-red-600" 
          bg="bg-red-50" 
        />
        <StatCard 
          label="Variation" 
          value={data?.variation || "0%"} 
          icon={TrendingDown} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des dossiers urgents */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">
            Fichiers en attente de visa
          </h3>
          <div className="space-y-4">
            {/* Si tu as plus de 0 dossiers à valider, on affiche un message ou une liste */}
            {data?.a_valider > 0 ? (
              [...Array(Math.min(data.a_valider, 3))].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-bold text-blue-600 shadow-sm">SH</div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Dossier en attente #{i + 1}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Vérification de valeur requise</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-sm text-center py-4">Aucun dossier en attente de validation.</p>
            )}
          </div>
        </div>

        {/* Note de conformité */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center">
          <h4 className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Rappel Procédure</h4>
          <p className="text-xl font-bold leading-snug">
            "Toute variation de prix supérieure à 15% par rapport au référentiel trimestriel doit faire l'objet d'un redressement systématique."
          </p>
          <div className="mt-6 pt-6 border-t border-blue-500">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-sm uppercase shadow-lg hover:bg-blue-50 transition-all">
              Consulter le manuel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}