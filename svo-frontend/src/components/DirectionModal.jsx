import { useEffect, useState } from "react";
import { X, Plus, Trash2, Save, Building } from "lucide-react";

export default function DirectionModal({ visible, onClose, onSubmit, initialData }) {
  const [nom, setNom] = useState("");
  const [services, setServices] = useState([{ id_service: null, service_nom: "" }]);

  useEffect(() => {
    if (visible) {
      setNom(initialData?.nom || "");
      if (initialData?.services && initialData.services.length > 0) {
        setServices(initialData.services);
      } else {
        setServices([{ id_service: null, service_nom: "" }]);
      }
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const updateService = (value, index) => {
    const updated = [...services];
    updated[index].service_nom = value;
    setServices(updated);
  };

  const addServiceField = () => {
    setServices([...services, { id_service: null, service_nom: "" }]);
  };

  const removeServiceField = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated.length ? updated : [{ id_service: null, service_nom: "" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nom.trim()) return alert("Le nom de la direction est obligatoire.");
    
    const cleanedServices = services.filter(s => s.service_nom.trim() !== "");

    onSubmit({
      id: initialData?.id || null,
      nom: nom.trim(),
      services: cleanedServices,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Building size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {initialData?.id ? "Modifier Direction" : "Nouvelle Direction"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-full border border-slate-100 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Section Direction */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom de la direction</label>
            <input
              className="w-full border border-slate-200 bg-slate-50/50 p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all border-dashed focus:border-solid"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Direction de la Logistique"
              required
            />
          </div>

          {/* Section Services */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Services rattachés</label>
              <button
                type="button"
                onClick={addServiceField}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Ajouter un champ
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {services.map((srv, index) => (
                <div key={index} className="flex gap-2 group">
                  <div className="flex-1 relative">
                    <input
                      className="w-full border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm pr-10"
                      value={srv.service_nom}
                      onChange={(e) => updateService(e.target.value, index)}
                      placeholder={`Nom du service ${index + 1}`}
                    />
                    {srv.id_service && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase">Enregistré</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeServiceField(index)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-all">
              Annuler
            </button>
            <button type="submit" className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2">
              <Save size={18} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}