import { useEffect, useState } from "react";
import api from "../api/axios";
import DirectionModal from "../components/DirectionModal";
import { Plus, Edit, Trash2, RefreshCw, Building2, Layers } from "lucide-react";

export default function Directions() {
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDir, setSelectedDir] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("directions/");
      
      // ✅ PROTECTION : On vérifie si les données sont dans res.data.results (pagination)
      // ou directement dans res.data
      const rawData = res.data.results || res.data;
      
      // On s'assure que directions est toujours un tableau
      setDirections(Array.isArray(rawData) ? rawData : []);
    } catch (e) {
      console.error("Erreur lors du chargement des directions", e);
      setDirections([]); // Évite que directions ne devienne null ou undefined
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (dir) => {
    setSelectedDir({
      id: dir.id_direction,
      nom: dir.direction_nom,
      services: dir.services_details || [] 
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (data.id) {
        // 1. Mettre à jour le nom de la direction
        await api.put(`directions/${data.id}/`, { direction_nom: data.nom });

        // 2. Trouver les services à supprimer
        // On compare les services initiaux (ceux de selectedDir) 
        // avec ceux renvoyés par le formulaire (data.services)
        const servicesInitiaux = selectedDir.services;
        const servicesRestantsIds = data.services
          .filter(s => s.id_service)
          .map(s => s.id_service);

        const servicesASupprimer = servicesInitiaux.filter(
          s => !servicesRestantsIds.includes(s.id_service)
        );

        // Exécution des suppressions
        for (const srv of servicesASupprimer) {
          await api.delete(`services/${srv.id_service}/`);
        }

        // 3. Ajouter les nouveaux services (ceux qui n'ont pas d'ID)
        for (const srv of data.services) {
          if (!srv.id_service && srv.service_nom.trim()) {
            await api.post("services/", {
              service_nom: srv.service_nom,
              id_direction: data.id
            });
          }
        }
      } else {
        // Logique de création (inchangée)
        const resDir = await api.post("directions/", { direction_nom: data.nom });
        const newDirId = resDir.data.id_direction;
        for (const srv of data.services) {
          if (srv.service_nom.trim()) {
            await api.post("services/", { 
              service_nom: srv.service_nom, 
              id_direction: newDirId 
            });
          }
        }
      }

      setShowModal(false);
      loadData();
      alert("Modification enregistrée avec succès");
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.detail || "Erreur lors de l'enregistrement. Certains services sont peut-être liés à des utilisateurs.";
      alert(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous supprimer cette direction ? Cela échouera si des utilisateurs y sont liés.")) {
      try {
        await api.delete(`directions/${id}/`);
        loadData();
      } catch (e) {
        alert("Action impossible : des données sont encore liées à cette direction.");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} /> Gestion des Directions
          </h1>
          <p className="text-slate-500 mt-1">Visualisez et gérez les directions et leurs services rattachés.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setSelectedDir(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-semibold"
          >
            <Plus size={20} /> Nouvelle Direction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ✅ On utilise l'opérateur de chaînage optionnel et une fallback */}
        {(directions || []).map((d) => (
          <div key={d.id_direction} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(d.id_direction)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-xl mb-3">{d.direction_nom}</h3>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Layers size={12} /> Services rattachés
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.services_details && d.services_details.length > 0 ? (
                    d.services_details.map((s) => (
                      <span key={s.id_service} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg border border-slate-100 shadow-sm">
                        {s.service_nom}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aucun service enregistré</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 tracking-tighter">REF: DIR-{d.id_direction}</span>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                {d.services_details?.length || 0} Service(s)
              </span>
            </div>
          </div>
        ))}
      </div>

      <DirectionModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        onSubmit={handleFormSubmit}
        initialData={selectedDir}
      />
    </div>
  );
}