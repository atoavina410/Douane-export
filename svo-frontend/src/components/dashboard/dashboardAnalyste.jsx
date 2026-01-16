import React from 'react';
import { FileText, UploadCloud, CheckCircle, BarChart3 } from "lucide-react";
import StatCard from './StatsCard';

export default function AnalysteDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Saisie Manuelle" value="156" icon={FileText} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Import Excel" value="1,2k" icon={UploadCloud} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Extractions" value="45" icon={BarChart3} color="text-cyan-600" bg="bg-cyan-50" />
        <StatCard label="Qualité" value="99%" icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[300px] flex items-center justify-center italic text-slate-300">
           [ Graphique de production hebdomadaire ici ]
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
           <h4 className="font-bold text-blue-400 mb-4 uppercase text-xs tracking-widest">Conseil du jour</h4>
           <p className="text-sm leading-relaxed opacity-80 italic">"Pensez à vérifier les codes SH du chapitre 84 pour les nouvelles régulations d'importation."</p>
        </div>
      </div>
    </div>
  );
}