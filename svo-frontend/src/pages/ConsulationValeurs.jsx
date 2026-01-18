import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  FileSearch, Calendar, User, ChevronLeft, ChevronRight, 
  X, Package, CreditCard, Ship, Database, Download, 
  AlertCircle, CheckCircle, Clock, Info, Globe, Tag
} from "lucide-react";

export default function ConsultationValeurs() {
  const [valeurs, setValeurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValeur, setSelectedValeur] = useState(null); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10; 

  const [filters, setFilters] = useState({
    codesh: "", descrip: "", date_ajout: "", pays: "", exportateur: ""
  });

  const loadData = async (page) => {
    setLoading(true);
    try {
      let url = `valeurs/?page=${page}`;
      if (filters.date_ajout) url += `&date_ajout=${filters.date_ajout}`;
      const res = await api.get(url);
      const dataToSet = res.data.results || res.data || [];
      setValeurs(dataToSet);
      setTotalCount(res.data.count || dataToSet.length);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
    
      if (filters.codesh) params.append('codesh', filters.codesh);
      if (filters.pays) params.append('pays_destinataire', filters.pays); 
      if (filters.date_ajout) params.append('date_ajout', filters.date_ajout);

      const url = `valeurs/export-excel/?${params.toString()}`;

      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `export_valeurs_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Erreur export:", error);
      alert("Erreur : Aucune donnée trouvée ou problème serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(currentPage); }, [currentPage, filters.date_ajout]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const filteredData = valeurs.filter((v) => {
    return (
      (v.codesh?.toLowerCase() || "").includes(filters.codesh.toLowerCase()) &&
      (v.descrip?.toLowerCase() || "").includes(filters.descrip.toLowerCase()) &&
      (v.pays_destinataire?.toLowerCase() || "").includes(filters.pays.toLowerCase()) &&
      (v.exportateur?.toLowerCase() || "").includes(filters.exportateur.toLowerCase())
    );
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getDateFin = (dateAjout) => {
    if (!dateAjout) return "---";
    const d = new Date(dateAjout);
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString();
  };

  const getRowStyle = (dateAjout) => {
    if (!dateAjout) return "hover:bg-slate-50";
    
    const aujourdhui = new Date();
    const dateCreation = new Date(dateAjout);
    const diffTemps = aujourdhui - dateCreation;
    const diffJours = Math.ceil(diffTemps / (1000 * 60 * 60 * 24));

    if (diffJours >= 90) {
      return "bg-red-50/40 hover:bg-red-100/60 border-l-4 border-l-red-500";
    } else if (diffJours >= 85) {
      return "bg-orange-50/40 hover:bg-orange-100/60 border-l-4 border-l-orange-500 animate-pulse";
    } else {
      return "bg-green-50/30 hover:bg-green-100/60 border-l-4 border-l-green-500";
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
            <FileSearch className="text-blue-600" size={30} /> Consultation Référentiel
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gestion des valeurs et suivi de validité</p>
        </div>
        
        <div className="flex gap-4 bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase border-r pr-4">
            <CheckCircle size={16}/> Valide
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase border-r pr-4">
            <Clock size={16}/> Alerte (85j+)
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase">
            <AlertCircle size={16}/> Obsolète
          </div>
        </div>
      </div>

      {/* FILTRES (Bouton export enlevé d'ici) */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
            <Tag className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input name="codesh" value={filters.codesh} onChange={handleFilterChange} placeholder="Code SH..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400" />
        </div>
        <input name="descrip" value={filters.descrip} onChange={handleFilterChange} placeholder="Description..." className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400" />
        <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input type="date" name="date_ajout" value={filters.date_ajout} onChange={handleFilterChange} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400" />
        </div>
        <input name="pays" value={filters.pays} onChange={handleFilterChange} placeholder="Pays..." className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400" />
        <button onClick={() => setFilters({codesh:"",descrip:"",date_ajout:"",pays:"",exportateur:""})} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-md">Réinitialiser</button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase tracking-widest italic">
                <th className="p-4 border-r border-slate-800">Code SH</th>
                <th className="p-4 min-w-[180px]">Description</th>
                <th className="p-4 text-center">Unité</th>
                <th className="p-4 text-right">Qté</th>
                <th className="p-4">Source</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Réf Fact</th>
                <th className="p-4">Exportateur</th>
                <th className="p-4">Importateur</th>
                <th className="p-4">Pays Dest.</th>
                <th className="p-4">Date Effet</th>
                <th className="p-4 bg-blue-900">Fin Validité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((v) => (
                <tr 
                  key={v.id_valeur} 
                  onClick={() => setSelectedValeur(v)}
                  className={`cursor-pointer transition-all active:scale-[0.99] ${getRowStyle(v.date_ajout)}`}
                >
                  <td className="p-4 font-black text-blue-700">{v.codesh}</td>
                  <td className="p-4 text-slate-500 italic truncate max-w-[200px]">{v.descrip}</td>
                  <td className="p-4 text-center font-bold text-slate-400">{v.unite}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-700">{v.quantite}</td>
                  <td className="p-4 text-slate-500 font-medium uppercase text-[9px]">{v.source || '---'}</td>
                  <td className="p-4 text-center"><span className="px-2 py-1 bg-white/50 rounded-md border font-bold uppercase text-[9px]">{v.status}</span></td>
                  <td className="p-4 font-mono text-slate-400">{v.ref_fact || '---'}</td>
                  <td className="p-4 truncate max-w-[120px] font-medium">{v.exportateur}</td>
                  <td className="p-4 truncate max-w-[120px] font-medium">{v.importateur}</td>
                  <td className="p-4 font-black text-slate-600">{v.pays_destinataire}</td>
                  <td className="p-4 text-slate-400 font-bold">{v.date_effet}</td>
                  <td className="p-4 font-black text-blue-900 bg-blue-50/50">{getDateFin(v.date_ajout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="p-4 bg-slate-50 flex justify-between items-center border-t border-slate-100 px-8">
             <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p-1)); }} className="p-2 border bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-sm"><ChevronLeft size={18}/></button>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Page {currentPage} sur {totalPages}</span>
             <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p+1)); }} className="p-2 border bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-sm"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* BOUTON EXPORT CENTRÉ EN BAS */}
      <div className="flex justify-center mb-12">
        <button
          onClick={handleExport}
          disabled={loading}
          className={`
            flex items-center gap-3 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl
            ${loading 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95 shadow-emerald-200/50"
            }
          `}
        >
          {loading ? <Clock className="animate-spin" size={18} /> : <Download size={18} />}
          {loading ? "Génération en cours..." : "Exporter le référentiel (Excel)"}
        </button>
      </div>

      {/* MODAL FICHE TECHNIQUE */}
      {selectedValeur && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-500/30">
                    <Package size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Fiche Technique Valeur</h2>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-bold text-blue-400 uppercase">ID: #{selectedValeur.id_valeur}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-bold text-slate-400 uppercase tracking-widest">Saisie: {new Date(selectedValeur.date_ajout).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedValeur(null)} className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
                <X size={30} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-widest border-b pb-2">
                    <Database size={16}/> Identification Produit
                </h3>
                <div className="space-y-4">
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Code SH</p><p className="text-lg font-black text-slate-800">{selectedValeur.codesh}</p></div>
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Désignation</p><p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedValeur.descrip}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">Quantité</p><p className="text-sm font-black">{selectedValeur.quantite} {selectedValeur.unite}</p></div>
                        <div><p className="text-[9px] text-slate-400 font-bold uppercase">Source</p><p className="text-sm font-black text-blue-600">{selectedValeur.source || 'N/A'}</p></div>
                    </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-green-600 font-black text-[11px] uppercase tracking-widest border-b pb-2">
                    <CreditCard size={16}/> Analyse Financière
                </h3>
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">P.U Facturé</span>
                        <span className="text-sm font-mono font-black">{selectedValeur.pu_fact} {selectedValeur.devise}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">P.U Redressé</span>
                        <span className="text-sm font-mono font-black text-green-600">{selectedValeur.pu_redr || '---'}</span>
                    </div>
                    <div><p className="text-[9px] text-slate-400 font-bold uppercase">Référence Facture</p><p className="text-xs font-mono font-bold text-slate-700 mt-1">{selectedValeur.ref_fact || 'Non spécifiée'}</p></div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-purple-600 font-black text-[11px] uppercase tracking-widest border-b pb-2">
                    <Ship size={16}/> Logistique & Partenaires
                </h3>
                <div className="space-y-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><Globe size={14} className="text-slate-400"/><p><strong>Pays:</strong> {selectedValeur.pays_destinataire} ({selectedValeur.incoterm})</p></div>
                    <div className="flex items-start gap-2"><User size={14} className="text-slate-400"/><div><p className="text-[9px] text-slate-400 font-bold uppercase">Exportateur</p><p>{selectedValeur.exportateur}</p></div></div>
                    <div className="flex items-start gap-2"><User size={14} className="text-slate-400"/><div><p className="text-[9px] text-slate-400 font-bold uppercase">Importateur</p><p>{selectedValeur.importateur}</p></div></div>
                    <div className={`p-3 rounded-2xl font-black text-center uppercase text-[10px] ${new Date() - new Date(selectedValeur.date_ajout) >= 90 * 24 * 60 * 60 * 1000 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        Validité: {new Date() - new Date(selectedValeur.date_ajout) >= 90 * 24 * 60 * 60 * 1000 ? 'OBSOLETE' : 'VALIDE'}
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 border-t flex justify-between items-center">
              <div className="flex items-center gap-4 text-slate-400 italic text-[10px] font-bold">
                 <Info size={16}/> Cliquez sur "Fermer" pour revenir à la liste.
              </div>
              <button onClick={() => setSelectedValeur(null)} className="bg-slate-900 text-white px-10 py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}