import { useEffect, useState } from "react";
import api from "../api/axios";
import { X, Save, Package, Globe, CreditCard, Truck, ClipboardList, Image as ImageIcon } from "lucide-react";

export default function ValeurModal({ visible, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    codesh: "", descrip: "", unite: "KG", quantite: "",
    pu_fact: "", pu_redr: "", methode: "1", incoterm: "FOB",
    devise: "USD", source: "MANUELLE", ref_fact: "", status: "VALIDE",
    details_marchandises: "", poid_brut: "", poid_net: "",
    exportateur: "", pays_destinataire: "", importateur: "",
    conditionnement: "CONTENEUR", date_effet: new Date().toISOString().split('T')[0],
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          codesh: "", descrip: "", unite: "KG", quantite: "",
          pu_fact: "", pu_redr: "", methode: "1", incoterm: "FOB",
          devise: "USD", source: "MANUELLE", ref_fact: "", status: "VALIDE",
          details_marchandises: "", poid_brut: "", poid_net: "",
          exportateur: "", pays_destinataire: "", importateur: "",
          conditionnement: "CONTENEUR", date_effet: new Date().toISOString().split('T')[0]
        });
      }
      setImageFile(null);
    }
  }, [initialData, visible]);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // On ajoute tous les champs texte/numérique
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // On ajoute l'image si elle a été sélectionnée
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      if (initialData?.id_valeur) {
        await api.put(`valeurs/${initialData.id_valeur}/`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("valeurs/", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onSave();
      onClose();
    } catch (e) {
      console.error(e.response?.data);
      alert("Erreur lors de l'enregistrement. Vérifiez vos données.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600" />
            {initialData ? "Modifier la Valeur" : "Nouvelle Saisie"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* IDENTIFICATION */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase tracking-widest border-b pb-1">Identification & Origine</div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Code SH</label>
            <input className="w-full border p-2 rounded-lg" value={formData.codesh} onChange={(e)=>setFormData({...formData, codesh: e.target.value})} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Désignation (Descrip)</label>
            <input className="w-full border p-2 rounded-lg" value={formData.descrip} onChange={(e)=>setFormData({...formData, descrip: e.target.value})} required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Pays Destinataire</label>
            <input className="w-full border p-2 rounded-lg" value={formData.pays_destinataire} onChange={(e)=>setFormData({...formData, pays_destinataire: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Exportateur</label>
            <input className="w-full border p-2 rounded-lg" value={formData.exportateur} onChange={(e)=>setFormData({...formData, exportateur: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Importateur</label>
            <input className="w-full border p-2 rounded-lg" value={formData.importateur} onChange={(e)=>setFormData({...formData, importateur: e.target.value})} />
          </div>

          {/* VALEURS ET PRIX */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase tracking-widest border-b pb-1 mt-4">Prix et Méthode</div>
          <div className="bg-blue-50/50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-3">
            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">PU Facturé</label>
              <input type="number" step="0.01" className="w-full border-blue-200 border p-2 rounded-lg" value={formData.pu_fact} onChange={(e)=>setFormData({...formData, pu_fact: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">PU Redressé</label>
              <input type="number" step="0.01" className="w-full border-blue-200 border p-2 rounded-lg" value={formData.pu_redr} onChange={(e)=>setFormData({...formData, pu_redr: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">Devise</label>
              <select className="w-full border-blue-200 border p-2 rounded-lg" value={formData.devise} onChange={(e)=>setFormData({...formData, devise: e.target.value})}>
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="MGA">MGA</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">Méthode</label>
              <select className="w-full border-blue-200 border p-2 rounded-lg" value={formData.methode} onChange={(e)=>setFormData({...formData, methode: e.target.value})}>
                <option value="1">Méthode 1</option><option value="2">Méthode 2</option><option value="3">Méthode 3</option>
              </select>
            </div>
          </div>

          {/* LOGISTIQUE */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase tracking-widest border-b pb-1 mt-4">Logistique & Poids</div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Incoterm</label>
            <select className="w-full border p-2 rounded-lg" value={formData.incoterm} onChange={(e)=>setFormData({...formData, incoterm: e.target.value})}>
              <option value="FOB">FOB</option><option value="CIF">CIF</option><option value="CFR">CFR</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Quantité</label>
            <input type="number" className="w-full border p-2 rounded-lg" value={formData.quantite} onChange={(e)=>setFormData({...formData, quantite: e.target.value})} required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Unité</label>
            <select className="w-full border p-2 rounded-lg" value={formData.unite} onChange={(e)=>setFormData({...formData, unite: e.target.value})}>
              <option value="KG">KG</option><option value="T">Tonne</option><option value="U">Unité</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Poids Brut / Net</label>
            <div className="flex gap-1">
              <input placeholder="Brut" type="number" className="w-1/2 border p-2 rounded-lg" value={formData.poid_brut} onChange={(e)=>setFormData({...formData, poid_brut: e.target.value})} />
              <input placeholder="Net" type="number" className="w-1/2 border p-2 rounded-lg" value={formData.poid_net} onChange={(e)=>setFormData({...formData, poid_net: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Conditionnement</label>
            <select className="w-full border p-2 rounded-lg" value={formData.conditionnement} onChange={(e)=>setFormData({...formData, conditionnement: e.target.value})}>
              <option value="CONTENEUR">Conteneur</option><option value="VRAC">Vrac</option><option value="SAC">Sac</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Réf. Facture / Date</label>
            <div className="flex gap-1">
              <input placeholder="Réf" className="w-1/2 border p-2 rounded-lg text-xs" value={formData.ref_fact} onChange={(e)=>setFormData({...formData, ref_fact: e.target.value})} />
              <input type="date" className="w-1/2 border p-2 rounded-lg text-xs" value={formData.date_effet} onChange={(e)=>setFormData({...formData, date_effet: e.target.value})} />
            </div>
          </div>

          {/* DÉTAILS ET IMAGE */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase tracking-widest border-b pb-1 mt-4">Informations Complémentaires</div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Détails Marchandises</label>
            <textarea className="w-full border p-2 rounded-lg h-20" value={formData.details_marchandises} onChange={(e)=>setFormData({...formData, details_marchandises: e.target.value})} />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><ImageIcon size={12}/> Justificatif (Image)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center mt-1">
              <input type="file" id="img" className="hidden" onChange={(e)=>setImageFile(e.target.files[0])} />
              <label htmlFor="img" className="cursor-pointer text-xs text-blue-500 hover:underline">
                {imageFile ? imageFile.name : "Cliquez pour uploader"}
              </label>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-400 font-bold">Annuler</button>
            <button type="submit" className="px-10 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Save size={18} /> Enregistrer la valeur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}