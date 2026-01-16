import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  Search, FileSearch, Calendar, Globe, User, Hash, FilterX, 
  ChevronLeft, ChevronRight, X, Package, CreditCard, Ship, Database 
} from "lucide-react";

export default function ConsultationValeurs() {
  const [valeurs, setValeurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValeur, setSelectedValeur] = useState(null); // Pour le Modal
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 7; 

  const [filters, setFilters] = useState({
    codesh: "", descrip: "", date: "", pays: "", exportateur: "", importateur: ""
  });

  const loadData = async (page) => {
    setLoading(true);
    try {
      const res = await api.get(`valeurs/?page=${page}`);
      const dataToSet = res.data.results || res.data || [];
      setValeurs(dataToSet);
      setTotalCount(res.data.count || dataToSet.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(currentPage); }, [currentPage]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const filteredData = valeurs.filter((v) => {
    return (
      (v.codesh?.toLowerCase() || "").includes(filters.codesh.toLowerCase()) &&
      (v.descrip?.toLowerCase() || "").includes(filters.descrip.toLowerCase()) &&
      (v.date_effet?.includes(filters.date)) &&
      (v.pays_destinataire?.toLowerCase() || "").includes(filters.pays.toLowerCase()) &&
      (v.exportateur?.toLowerCase() || "").includes(filters.exportateur.toLowerCase()) &&
      (v.importateur?.toLowerCase() || "").includes(filters.importateur.toLowerCase())
    );
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="p-6 bg-slate-50 min-h-screen relative">
      {/* HEADER & FILTRES (Gardés tels quels) */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <FileSearch className="text-blue-600" size={28} />
          Consultation du Référentiel
        </h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input name="codesh" value={filters.codesh} onChange={handleFilterChange} placeholder="Code SH" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          <input name="descrip" value={filters.descrip} onChange={handleFilterChange} placeholder="Description" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          <input name="pays" value={filters.pays} onChange={handleFilterChange} placeholder="Pays" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          <input name="exportateur" value={filters.exportateur} onChange={handleFilterChange} placeholder="Exportateur" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          <button onClick={() => setFilters({codesh:"",descrip:"",date:"",pays:"",exportateur:"",importateur:""})} className="bg-slate-100 text-slate-600 py-2 rounded-xl hover:bg-slate-200 font-bold text-sm">Effacer</button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider italic">
              <th className="p-4">ID User</th>
              <th className="p-4">Produit</th>
              <th className="p-4">Valeur Fonc.</th>
              <th className="p-4">Pays/Inco</th>
              <th className="p-4">Partenaires</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((v) => (
              <tr 
                key={v.id_valeur} 
                onClick={() => setSelectedValeur(v)}
                className="hover:bg-blue-50 cursor-pointer transition-all active:scale-[0.99]"
              >
                <td className="p-4 font-bold text-slate-400 text-xs">#{v.id_utilisateur}</td>
                <td className="p-4">
                  <div className="font-black text-blue-700">{v.codesh}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{v.descrip}</div>
                </td>
                <td className="p-4 font-mono font-bold text-slate-700">{v.pu_fact} {v.devise}</td>
                <td className="p-4 text-xs font-bold text-slate-600">{v.pays_destinataire} / {v.incoterm}</td>
                <td className="p-4 text-[10px] text-slate-500">{v.exportateur}</td>
                <td className="p-4 text-xs font-medium text-slate-400">{v.date_effet}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* PAGINATION (Idem code précédent) */}
        <div className="p-4 bg-slate-50 flex justify-between items-center border-t border-slate-100">
             <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 border rounded-lg hover:bg-white"><ChevronLeft size={16}/></button>
             <span className="text-xs font-bold">Page {currentPage} / {totalPages}</span>
             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="p-2 border rounded-lg hover:bg-white"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* MODAL DE DETAILS */}
      {selectedValeur && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Package className="text-blue-400" /> Détails de la Valeur
                </h2>
                <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">ID Enregistrement: #{selectedValeur.id_valeur}</p>
              </div>
              <button onClick={() => setSelectedValeur(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-8">
              {/* Colonne 1 : Produit & Finances */}
              <div className="space-y-6">
                <section>
                  <h3 className="flex items-center gap-2 text-blue-600 font-black text-sm mb-3 uppercase tracking-tighter">
                    <Database size={16}/> Information Produit
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Code SH</p>
                    <p className="font-black text-lg text-slate-800 mb-2">{selectedValeur.codesh}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Description</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedValeur.descrip}</p>
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 text-green-600 font-black text-sm mb-3 uppercase tracking-tighter">
                    <CreditCard size={16}/> Données Financières
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="bg-green-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-green-600 font-bold">Prix Facturé</p>
                        <p className="font-mono font-black">{selectedValeur.pu_fact} {selectedValeur.devise}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-orange-600 font-bold">Prix Redressé</p>
                        <p className="font-mono font-black text-orange-700">{selectedValeur.pu_redr || '---'}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Colonne 2 : Logistique & Acteurs */}
              <div className="space-y-6">
                <section>
                  <h3 className="flex items-center gap-2 text-purple-600 font-black text-sm mb-3 uppercase tracking-tighter">
                    <Ship size={16}/> Logistique & Expédition
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b pb-1">
                      <span className="text-slate-400">Pays Dest.</span>
                      <span className="font-bold">{selectedValeur.pays_destinataire}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b pb-1">
                      <span className="text-slate-400">Incoterm</span>
                      <span className="font-bold text-purple-700">{selectedValeur.incoterm}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b pb-1">
                      <span className="text-slate-400">Poids Net</span>
                      <span className="font-bold">{selectedValeur.poid_net} KG</span>
                    </div>
                    <div className="flex justify-between text-xs border-b pb-1">
                      <span className="text-slate-400">Conditionnement</span>
                      <span className="font-bold">{selectedValeur.conditionnement}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 text-slate-600 font-black text-sm mb-3 uppercase tracking-tighter">
                    <User size={16}/> Acteurs du Dossier
                  </h3>
                  <div className="bg-slate-900 text-white p-4 rounded-2xl">
                    <div className="mb-2">
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Exportateur</p>
                      <p className="text-xs font-medium truncate">{selectedValeur.exportateur || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Importateur</p>
                      <p className="text-xs font-medium truncate">{selectedValeur.importateur || 'Non renseigné'}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Modal avec Traçabilité */}
            <div className="bg-slate-50 p-6 border-t flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Saisie par</span>
                  <span className="text-xs font-black text-slate-700 uppercase">Utilisateur #{selectedValeur.id_utilisateur}</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Date d'effet</span>
                  <span className="text-xs font-black text-blue-600">{selectedValeur.date_effet}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedValeur(null)}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg"
              >
                Fermer la fiche
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}