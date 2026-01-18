import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import ValeurModal from "../components/ModalC";
import { Plus, Search, Edit, Trash2, FileText, Upload, Database, Loader2 } from "lucide-react";

export default function Valeurs() {
  const [valeurs, setValeurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedValeur, setSelectedValeur] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      const res = await api.get("valeurs/");
      console.log("JSON RECU :", res.data); // OUVREZ VOTRE CONSOLE (F12) POUR VOIR CECI
    
      // On force la détection du tableau peu importe la structure
      const data = res.data.results || res.data; 
      setValeurs(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error("Erreur chargement:", e); 
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- NOUVELLE FONCTION : SUPPRIMER ---
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette valeur ?")) {
      try {
        await api.delete(`valeurs/${id}/`);
        // Mise à jour locale de la liste pour éviter un rechargement complet
        setValeurs(valeurs.filter((v) => v.id_valeur !== id));
        alert("Valeur supprimée avec succès.");
      } catch (e) {
        console.error("Erreur suppression:", e);
        alert("Impossible de supprimer cette valeur. Elle est peut-être liée à un historique.");
      }
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsImporting(true);
      const res = await api.post("valeurs/import-excel/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      loadData();
    } catch (error) {
      alert("Erreur lors de l'import.");
    } finally {
      setIsImporting(false);
      e.target.value = null;
    }
  };

  const filtered = valeurs.filter(v => 
      (v.descrip?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (v.codesh?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Référentiel des Valeurs</h1>
          <p className="text-slate-500 text-sm">Gestion des champs réglementaires</p>
        </div>
        
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          <button onClick={() => fileInputRef.current.click()} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">
            {isImporting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            Import Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs"><Database size={16}/> Sydonia</button>
          <button onClick={() => { setSelectedValeur(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg"><Plus size={16}/> Saisie Manuelle</button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input className="w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-200 shadow-sm" placeholder="Rechercher..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="p-4">SH / Description</th>
              <th className="p-4">Prix (PU)</th>
              <th className="p-4">Logistique</th>
              <th className="p-4">Destination</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
	      <tbody className="divide-y divide-slate-50">
                {filtered.map(v => (
                  <tr key={v.id_valeur} className="hover:bg-blue-50/20">
                    <td className="p-4">
                      <div className="font-bold text-blue-600 text-sm">{v.codesh}</div>
                      <div className="text-[11px] text-slate-500 uppercase">{v.descrip}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">
                      {v.pu_fact} <span className="text-[10px] text-slate-400">{v.devise}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold">{v.incoterm} - {v.quantite} {v.unite}</div>
                      <div className="text-[10px] text-slate-400">Origine: {v.source}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-700">{v.pays_destinataire}</div>
                      <div className="text-[10px] text-slate-400">{v.status}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={()=> { setSelectedValeur(v); setShowModal(true); }} 
                          className="p-2 text-blue-500 hover:bg-white rounded-lg transition-colors"
                        >
                          <Edit size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id_valeur)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                   </td>
                 </tr>
               ))}
           </tbody>
        </table>
      </div>

      <ValeurModal visible={showModal} onClose={()=>setShowModal(false)} onSave={loadData} initialData={selectedValeur} />
    </div>
  );
}