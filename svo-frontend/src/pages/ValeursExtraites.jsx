import { useEffect, useState } from "react";
import api from "../api/axios";
import { FileText, Calendar, Package, DollarSign, RefreshCw, Eye } from "lucide-react";

const DetailExtraitModal = ({ item, onClose, onValidationSuccess }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState(null);
  
    const handleValidate = async () => {
      if (!window.confirm("Confirmez-vous la validation de cette extraction ?\nCela créera une entrée dans la table VALEUR et marquera l'extrait comme Validé.")) {
        return;
      }
  
      setIsValidating(true);
      setError(null);
  
      try {
        // 1. Création dans la table VALEUR
        const payload = {
          codesh: item.codesh_extrait,
          descrip: item.descrip_extrait,
          unite: item.unite_extrait,
          quantite: item.quantite_extrait,
          pu_fact: item.pu_fact_extrait,
          pu_redr: item.pu_redr_extrait || null,
          methode: item.methode_extrait,
          incoterm: item.incoterm_extrait,
          devise: item.devise_extrait,
          source: item.source_extrait,
          ref_fact: item.ref_fact_extrait,
          status: "Validé",
          details_marchandises: item.details_marchandises_extrait,
          poid_brut: item.poid_brut_extrait,
          poid_net: item.poid_net_extrait,
          exportateur: item.exportateur_extrait,
          pays_destinataire: item.pays_destinataire_extrait,
          importateur: item.importateur_extrait,
          conditionnement: item.conditionnement_extrait,
          date_effet: item.date_effet_extrait ? new Date(item.date_effet_extrait).toISOString().split('T')[0] : null,
          // date_ajout sera géré automatiquement côté backend
          // image : pas transféré ici (à gérer séparément si besoin)
          id_utilisateur: 125,
          id_extraction: item.id_valeur_extrait,            // lien vers l'extrait source
        };

  
        await api.post("/valeurs/", payload);

        // 2. Mise à jour du statut de l'extrait
        await api.patch(`/extraits/${item.id_valeur_extrait}/`, {
          status_extrait: "Validé"
        });

        // 3. Suppression de l'extrait
        // await api.delete(`/extraits/${item.id_valeur_extrait}/`);
  
        // Succès
        alert("Validation effectuée avec succès !");
        onValidationSuccess?.();
        onClose();
  
      } catch (err) {
        console.error("Erreur lors de la validation:", err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Une erreur est survenue lors de la validation"
        );
      } finally {
        setIsValidating(false);
      }
    };

    const handleReject = async () => {
      if (!item) return;
      setIsRejecting(true);
    
      try {

        // 2. Mise à jour du statut de l'extrait
        await api.patch(`/extraits/${item.id_valeur_extrait}/`, {
          status_extrait: "rejeté"
        });

        onValidationSuccess?.();
        onClose();
      
      } catch (error) {
        console.error("Erreur lors du rejet :", error);
      } finally {
        setIsRejecting(false);
      }
    };
    
    if (!item) return null;

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString("fr-FR") : "—");
    const formatNumber = (num) =>
      num != null ? num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : "—";
  
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-douane-primary">
              Détails de l'extrait – Ref: {item.ref_fact_extrait || "—"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            >
              ×
            </button>
          </div>
  
          {/* Message d'erreur */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
  
        {/* Contenu */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DetailField label="Référence facture" value={item.ref_fact_extrait} />
            <DetailField label="Date d'effet" value={formatDate(item.date_effet_extrait)} />
            <DetailField label="Date d'ajout" value={formatDate(item.date_ajout_extrait)} />
            <DetailField label="Exportateur" value={item.exportateur_extrait} />
            <DetailField label="Importateur" value={item.importateur_extrait} />
            <DetailField label="Pays destinataire" value={item.pays_destinataire_extrait} />
            <DetailField label="Incoterm" value={item.incoterm_extrait} />
          </div>

          <div>
            <DetailField label="Conditionnement" value={item.conditionnement_extrait} />
            <DetailField label="Quantité" value={`${formatNumber(item.quantite_extrait)} ${item.unite_extrait || ""}`} />
            <DetailField label="Poids brut" value={`${formatNumber(item.poid_brut_extrait)} kg`} />
            <DetailField label="Poids net" value={`${formatNumber(item.poid_net_extrait)} kg`} />
            <DetailField
              label="Prix unitaire facturé"
              value={`${formatNumber(item.pu_fact_extrait)} ${item.devise_extrait || "XOF"}`}
            />
            <DetailField
              label="Valeur totale facturée"
              value={`${formatNumber((item.quantite_extrait || 0) * (item.pu_fact_extrait || 0))} ${
                item.devise_extrait || "XOF"
              }`}
              important
            />
            <DetailField label="Statut" value={item.status_extrait} badge />
          </div>

          <div className="md:col-span-2">
            <DetailField label="Description" value={item.descrip_extrait} isLongText />
            <DetailField label="Détails marchandises" value={item.details_marchandises_extrait} isLongText />
          </div>
        </div>
  
          {/* Footer avec les deux boutons */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isValidating}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              Fermer
            </button>
  
            <button
              onClick={handleValidate}
              disabled={isValidating || item.status_extrait?.toLowerCase() === "validé" || item.status_extrait?.toLowerCase() === "rejeté"}
              className={`
                px-6 py-2 rounded-lg text-white transition flex items-center gap-2
                ${item.status_extrait?.toLowerCase() === "validé" || item.status_extrait?.toLowerCase() === "rejeté"
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"}
                disabled:opacity-50
              `}
            >
              {isValidating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Validation en cours...
                </>
              ) : item.status_extrait?.toLowerCase() === "validé" ? (
                "Déjà validé"
              ) : (
                "Valider"
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={isValidating || isRejecting || item.status_extrait?.toLowerCase() === "rejeté"}
              className={`
                px-6 py-2 rounded-lg text-white transition flex items-center gap-2
                ${item.status_extrait?.toLowerCase() === "rejeté"
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"}
                disabled:opacity-50
              `}
            >
              {isRejecting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Rejet en cours...
                </>
              ) : item.status_extrait?.toLowerCase() === "rejeté" ? (
                "Déjà rejeté"
              ) : (
                "Rejeter"
              )}
            </button>

          </div>
        </div>
      </div>
    );
  };

// Petit composant utilitaire pour afficher les champs du modal
const DetailField = ({ label, value, isLongText = false, important = false, badge = false }) => (
  <div className="mb-4">
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div
      className={`${
        important ? "font-bold text-lg text-emerald-700" : "font-medium text-gray-800"
      } ${isLongText ? "whitespace-pre-wrap" : ""} ${
        badge
          ? "inline-block px-3 py-1 rounded-full text-sm " +
            (value?.toLowerCase()=== "validé" || value?.toLowerCase().includes("validé")
              ? "bg-green-100 text-green-800"
              : value?.toLowerCase() === "rejeté" || value?.toLowerCase().includes("rejeté")
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800")
          : ""
      }`}
    >
      {value || "—"}
    </div>
  </div>
);

export default function ValeursExtraites() {
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadExtractions();
  }, []);

  const loadExtractions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/extraits/");
      setExtractions(res.data.results || []);
    } catch (e) {
      console.error("Erreur chargement extractions", e);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) =>
    num != null ? num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) : "—";

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-douane-primary">Valeurs Extraites</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {extractions.length} ligne{extractions.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={loadExtractions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium">Réf Facture</th>
                <th className="p-4 font-medium">Date Effet</th>
                <th className="p-4 font-medium">Exportateur</th>
                <th className="p-4 font-medium">Pays Dest.</th>
                <th className="p-4 font-medium text-right">Quantité</th>
                <th className="p-4 font-medium text-right">PU Facturé</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 w-20 text-center">Détails</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : extractions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                extractions.map((item) => (
                  <tr key={item.id_valeur_extrait} className="hover:bg-gray-50/70">
                    <td className="p-4 font-medium">{item.ref_fact_extrait || "—"}</td>
                    <td className="p-4 whitespace-nowrap">
                      {new Date(item.date_effet_extrait).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4 max-w-xs truncate">{item.exportateur_extrait || "—"}</td>
                    <td className="p-4">{item.pays_destinataire_extrait || "—"}</td>
                    <td className="p-4 text-right">
                      {formatNumber(item.quantite_extrait)} {item.unite_extrait}
                    </td>
                    <td className="p-4 text-right font-medium text-emerald-700">
                      {formatNumber(item.pu_fact_extrait)} {item.devise_extrait || "XOF"}
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatNumber((item.quantite_extrait || 0) * (item.pu_fact_extrait || 0))}{" "}
                      {item.devise_extrait || "XOF"}
                    </td>
                    <td className="p-4">
                      <div
                        className={`${
                          true ? "font-bold text-lg text-emerald-700" : "font-medium text-gray-800"
                        } ${true ? "whitespace-pre-wrap" : ""} ${
                          true
                            ? "inline-block px-3 py-1 rounded-full text-sm " +
                              (item.status_extrait?.toLowerCase()=== "validé" || item.status_extrait?.toLowerCase().includes("validé")
                                ? "bg-green-100 text-green-800"
                                : item.status_extrait?.toLowerCase() === "rejeté" || item.status_extrait?.toLowerCase().includes("rejeté")
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800")
                            : ""
                        }`}
                      >
                        {item.status_extrait || "—"}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Voir les détails"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}

    {selectedItem && (
    <DetailExtraitModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onValidationSuccess={loadExtractions}
    />
    )}
    </div>
  );
}