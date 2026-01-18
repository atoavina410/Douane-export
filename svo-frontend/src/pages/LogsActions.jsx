import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import { 
  Search, Calendar, RefreshCcw, ChevronLeft, ChevronRight, 
  User, ShieldAlert, Activity, Download, Clock, Filter
} from "lucide-react";

export default function LogsActions() {
  const [logs, setLogs] = useState([]); 
  const [meta, setMeta] = useState({ count: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  // Ajout de 'action' dans les filtres
  const [filters, setFilters] = useState({ login: "", dateDebut: "", dateFin: "", action: "" });

  const fetchLogs = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    try {
        const queryParams = { page: page };

        if (filters.login) {
            queryParams.user_login__icontains = filters.login;
        }
        if (filters.dateDebut) {
            queryParams.date_action__gte = filters.dateDebut;
        }
        if (filters.date) {
            queryParams.date_action__lte = `${filters.date}T23:59:59`;
        }
        // Prise en compte du filtre action
        if (filters.action) {
            queryParams.action = filters.action;
        }

        const res = await api.get("logactions/", { params: queryParams });
        
        const dataReceived = res.data.results || res.data || [];
        const totalCount = res.data.count || dataReceived.length;

        setLogs(dataReceived);
        setMeta({
            count: totalCount,
            totalPages: Math.ceil(totalCount / 7) || 1
        });
    } catch (err) {
        console.error("Erreur récupération logs:", err);
        if (!isAutoRefresh) setLogs([]); 
    } finally {
        if (!isAutoRefresh) setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const queryParams = {};
      if (filters.login) queryParams.user_login__icontains = filters.login;
      if (filters.dateDebut) queryParams.date_action__gte = filters.dateDebut;
      if (filters.dateFin) queryParams.date_action__lte = `${filters.dateFin}T23:59:59`;
      if (filters.action) queryParams.action = filters.action;

      const response = await api.get("logactions/export-logs/", {
        params: queryParams,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'exportation des logs.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };
  
  const resetFilters = () => {
    setFilters({ login: "", dateDebut: "", dateFin: "", action: "" });
    setPage(1);
    document.querySelectorAll('input[type="date"], input[type="text"], select').forEach(input => input.value = "");
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-blue-600" size={24} /> AUDIT SYSTÈME
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            <Activity size={12} className="inline mr-1 text-emerald-500" /> 
            {meta.count} Événements enregistrés
          </p>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filtrer par login..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs w-40 focus:ring-2 focus:ring-blue-500"
              value={filters.login}
              onChange={(e) => handleFilterChange({ login: e.target.value })}
            />
          </div>

          {/* SÉLECTEUR D'ACTION AJOUTÉ ICI */}
          <div className="relative border-l border-slate-100 pl-2">
            <select 
                className="pl-3 pr-8 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                value={filters.action}
                onChange={(e) => handleFilterChange({ action: e.target.value })}
            >
                <option value="">TOUTES ACTIONS</option>
                <option value="VISIT">VISIT</option>
                <option value="LOGOUT">DÉCONNEXION</option>
                <option value="CREATE">CRÉATION</option>
                <option value="UPDATE">MODIFICATION</option>
                <option value="DELETE">SUPPRESSION</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
             <Calendar size={14} className="text-slate-400" />
             <input type="date" className="text-[11px] border-none bg-transparent p-0 focus:ring-0" onChange={(e) => handleFilterChange({ date: e.target.value })} />
             <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all border border-red-100"
                title="Réinitialiser les filtres"
             >
                <RefreshCcw size={14} />
                <span>EFFACER</span>
             </button>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Action</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Description</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Date</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Array.isArray(logs) && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors h-[48px]">
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                        {log.user_login?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{log.user_login}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <span className={`px-2 py-1 rounded text-[9px] font-black ${
                      log.action === 'DELETE' ? 'bg-red-50 text-red-600' : 
                      log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-xs text-slate-500 truncate max-w-[200px] font-medium">
                    {log.description}
                  </td>
                  <td className="px-6 py-2 text-[10px] font-bold text-slate-400">
                    {new Date(log.date_action).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-2 text-right font-mono text-[10px] text-slate-300">
                    {log.ip_address}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs italic">
                  {loading ? "Chargement des données..." : "Aucun log trouvé pour cette recherche"}
                </td>
              </tr>
            )}
            {Array.isArray(logs) && logs.length > 0 && logs.length < 7 && (
              [...Array(7 - logs.length)].map((_, i) => (
                <tr key={`empty-${i}`} className="h-[48px] opacity-0"><td colSpan="5"></td></tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Page {page} sur {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8 mb-12">
        <button
          onClick={handleExport}
          disabled={exportLoading || logs.length === 0}
          className={`
            flex items-center gap-3 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl
            ${exportLoading 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
              : "bg-slate-900 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-blue-200/50"
            }
          `}
        >
          {exportLoading ? (
            <Clock className="animate-spin" size={18} />
          ) : (
            <Download size={18} />
          )}
          {exportLoading ? "Génération en cours..." : "Exporter l'Historique (Excel)"}
        </button>
      </div>
    </div>
  );
}