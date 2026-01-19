import { useEffect, useState } from "react";
import api from "../api/axios";
import { X, Save, Package, Image as ImageIcon } from "lucide-react";

export default function ValeurModal({ visible, onClose, onSave, initialData }) {
  const isEditMode = !!initialData?.id_valeur; // Si id_valeur existe → on est en mode modification de Valeur

  // Configuration des noms de champs selon le mode
  const fieldMapping = isEditMode
    ? {
        // Mode édition → on travaille sur la table VALEUR
        id: "id_valeur",
        codesh: "codesh",
        descrip: "descrip",
        unite: "unite",
        quantite: "quantite",
        pu_fact: "pu_fact",
        pu_redr: "pu_redr",
        methode: "methode",
        incoterm: "incoterm",
        devise: "devise",
        source: "source",
        ref_fact: "ref_fact",
        status: "status",
        details_marchandises: "details_marchandises",
        poid_brut: "poid_brut",
        poid_net: "poid_net",
        exportateur: "exportateur",
        pays_destinataire: "pays_destinataire",
        importateur: "importateur",
        conditionnement: "conditionnement",
        date_effet: "date_effet",
        image: "image",
      }
    : {
        // Mode création → on travaille sur VALEUR_EXTRAIT
        id: "id_valeur_extrait",
        codesh: "codesh_extrait",
        descrip: "descrip_extrait",
        unite: "unite_extrait",
        quantite: "quantite_extrait",
        pu_fact: "pu_fact_extrait",
        pu_redr: "pu_redr_extrait",
        methode: "methode_extrait",
        incoterm: "incoterm_extrait",
        devise: "devise_extrait",
        source: "source_extrait",
        ref_fact: "ref_fact_extrait",
        status: "status_extrait",
        details_marchandises: "details_marchandises_extrait",
        poid_brut: "poid_brut_extrait",
        poid_net: "poid_net_extrait",
        exportateur: "exportateur_extrait",
        pays_destinataire: "pays_destinataire_extrait",
        importateur: "importateur_extrait",
        conditionnement: "conditionnement_extrait",
        date_effet: "date_effet_extrait",
        image: "image_extrait",
      };

  const defaultValues = {
    [fieldMapping.codesh]: "",
    [fieldMapping.descrip]: "",
    [fieldMapping.unite]: "KG",
    [fieldMapping.quantite]: "",
    [fieldMapping.pu_fact]: "",
    [fieldMapping.pu_redr]: "",
    [fieldMapping.methode]: "1",
    [fieldMapping.incoterm]: "FOB",
    [fieldMapping.devise]: "USD",
    [fieldMapping.source]: "MANUELLE",
    [fieldMapping.ref_fact]: "",
    [fieldMapping.status]: isEditMode ? "VALIDE" : "EN ATTENTE",
    [fieldMapping.details_marchandises]: "",
    [fieldMapping.poid_brut]: "",
    [fieldMapping.poid_net]: "",
    [fieldMapping.exportateur]: "",
    [fieldMapping.pays_destinataire]: "",
    [fieldMapping.importateur]: "",
    [fieldMapping.conditionnement]: "CONTENEUR",
    [fieldMapping.date_effet]: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(defaultValues);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!visible) return;

    if (initialData) {
      // On mappe les données reçues selon les noms de champs attendus
      const mappedData = {};
      Object.keys(fieldMapping).forEach((key) => {
        const dbField = fieldMapping[key];
        if (initialData[dbField] !== undefined) {
          mappedData[dbField] = initialData[dbField];
        }
      });
      setFormData(mappedData);
    } else {
      setFormData(defaultValues);
    }

    setImageFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, visible, isEditMode]);

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // Ajout de tous les champs du formulaire
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    // Gestion de l'image
    if (imageFile) {
      data.append(fieldMapping.image, imageFile);
    }

    try {
      if (isEditMode) {
        // UPDATE - Valeur
        await api.put(`valeurs/${initialData.id_valeur}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // CREATE - ValeurExtrait
        await api.post("extraits/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde:", error.response?.data || error);
      alert("Erreur lors de l'enregistrement. Vérifiez les données saisies.");
    }
  };

  const updateField = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  console.log(formData);

  const title = isEditMode ? "Modifier la Valeur" : "Nouvelle Saisie (Extrait)";

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh]">
        {/* HEADER */}
        <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600" />
            {title}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* IDENTIFICATION */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase border-b pb-1">
            Identification & Origine
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Code SH</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.codesh] || ""}
              onChange={(e) => updateField(fieldMapping.codesh, e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Désignation</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.descrip] || ""}
              onChange={(e) => updateField(fieldMapping.descrip, e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Pays Destinataire</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.pays_destinataire] || ""}
              onChange={(e) => updateField(fieldMapping.pays_destinataire, e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Exportateur</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.exportateur] || ""}
              onChange={(e) => updateField(fieldMapping.exportateur, e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Importateur</label>
            <input
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.importateur] || ""}
              onChange={(e) => updateField(fieldMapping.importateur, e.target.value)}
            />
          </div>

          {/* PRIX */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase border-b mt-4 pb-1">
            Prix et Méthode
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-3">
            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">PU Facturé</label>
              <input
                type="number"
                step="0.01"
                className="w-full border p-2 rounded-lg"
                value={formData[fieldMapping.pu_fact] || ""}
                onChange={(e) => updateField(fieldMapping.pu_fact, e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">PU Redressé</label>
              <input
                type="number"
                step="0.01"
                className="w-full border p-2 rounded-lg"
                value={formData[fieldMapping.pu_redr] || ""}
                onChange={(e) => updateField(fieldMapping.pu_redr, e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">Devise</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={formData[fieldMapping.devise] || "USD"}
                onChange={(e) => updateField(fieldMapping.devise, e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MGA">MGA</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-blue-800 uppercase">Méthode</label>
              <select
                className="w-full border p-2 rounded-lg"
                value={formData[fieldMapping.methode] || "1"}
                onChange={(e) => updateField(fieldMapping.methode, e.target.value)}
              >
                <option value="1">Méthode 1</option>
                <option value="2">Méthode 2</option>
                <option value="3">Méthode 3</option>
              </select>
            </div>
          </div>

          {/* LOGISTIQUE */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase border-b mt-4 pb-1">
            Logistique & Poids
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Incoterm</label>
            <select
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.incoterm] || "FOB"}
              onChange={(e) => updateField(fieldMapping.incoterm, e.target.value)}
            >
              <option value="FOB">FOB</option>
              <option value="CIF">CIF</option>
              <option value="CFR">CFR</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Quantité</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.quantite] || ""}
              onChange={(e) => updateField(fieldMapping.quantite, e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Unité</label>
            <select
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.unite] || "KG"}
              onChange={(e) => updateField(fieldMapping.unite, e.target.value)}
            >
              <option value="KG">KG</option>
              <option value="T">Tonne</option>
              <option value="U">Unité</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Poids Brut / Net</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  placeholder="Brut"
                  type="number"
                  step="0.01"
                  className="w-full border p-2 rounded-lg"
                  value={formData[fieldMapping.poid_brut] || ""}
                  onChange={(e) => updateField(fieldMapping.poid_brut, e.target.value)}
                />
              </div>
              <div className="flex-1">
                <input
                  placeholder="Net"
                  type="number"
                  step="0.01"
                  className="w-full border p-2 rounded-lg"
                  value={formData[fieldMapping.poid_net] || ""}
                  onChange={(e) => updateField(fieldMapping.poid_net, e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Conditionnement</label>
            <select
              className="w-full border p-2 rounded-lg"
              value={formData[fieldMapping.conditionnement] || "CONTENEUR"}
              onChange={(e) => updateField(fieldMapping.conditionnement, e.target.value)}
            >
              <option value="CONTENEUR">Conteneur</option>
              <option value="VRAC">Vrac</option>
              <option value="SAC">Sac</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Réf. Facture / Date</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  placeholder="Référence"
                  className="w-full border p-2 rounded-lg text-sm"
                  value={formData[fieldMapping.ref_fact] || ""}
                  onChange={(e) => updateField(fieldMapping.ref_fact, e.target.value)}
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg text-sm"
                  value={formData[fieldMapping.date_effet] || ""}
                  onChange={(e) => updateField(fieldMapping.date_effet, e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* DETAILS + IMAGE */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase border-b mt-4 pb-1">
            Informations Complémentaires
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Détails Marchandises</label>
            <textarea
              className="w-full border p-2 rounded-lg h-20"
              value={formData[fieldMapping.details_marchandises] || ""}
              onChange={(e) => updateField(fieldMapping.details_marchandises, e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <ImageIcon size={12} /> Justificatif (Image)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center mt-1">
              <input
                type="file"
                id="img"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="img"
                className="cursor-pointer text-xs text-blue-500 hover:underline"
              >
                {imageFile ? imageFile.name : "Cliquez pour uploader ou glisser-déposer"}
              </label>
              {imageFile && (
                <p className="mt-1 text-xs text-slate-500">
                  Fichier sélectionné
                </p>
              )}
            </div>
          </div>

          {/* DETAILS + IMAGE */}
          <div className="md:col-span-3 font-bold text-blue-600 text-xs uppercase border-b mt-4 pb-1">
            Informations Complémentaires
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Détails Marchandises</label>
            <textarea
              className="w-full border p-2 rounded-lg h-20"
              value={formData[fieldMapping.details_marchandises] || ""}
              onChange={(e) => updateField(fieldMapping.details_marchandises, e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <ImageIcon size={12} /> Justificatif (Image)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center mt-1">
              <input
                type="file"
                id="img"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="img"
                className="cursor-pointer text-xs text-blue-500 hover:underline"
              >
                {imageFile ? imageFile.name : "Cliquez pour uploader"}
              </label>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-400 font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-10 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18} />
              {isEditMode ? "Mettre à jour" : "Enregistrer la valeur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}