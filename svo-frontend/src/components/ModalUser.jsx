import { useState, useEffect } from "react";
import api from "../api/axios";
import { X, Save, Loader2 } from "lucide-react";

export default function ModalUser({ onClose, onSave, initialData }) {
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nom_utilisateur: "",
    prenom_utilisateur: "",
    matricule: "",
    email: "",
    login: "",
    id_role: "",
    id_service: "",
    password: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resR, resS] = await Promise.all([
          api.get("roles/"),
          api.get("services/")
        ]);
        const rolesData = resR.data.results || resR.data || [];
        const servicesData = resS.data.results || resS.data || [];
        setRoles(rolesData);
        setServices(servicesData);
      } catch (e) {
        console.error("Erreur chargement données modale:", e);
      }
    };
    fetchData();

    if (initialData) {
      setForm({
        nom_utilisateur: initialData.nom_utilisateur || "",
        prenom_utilisateur: initialData.prenom_utilisateur || "",
        matricule: initialData.matricule || "",
        email: initialData.mail || initialData.email || "",
        login: initialData.login || "",
        id_role: initialData.id_role?.id_role || initialData.id_role || "",
        id_service: initialData.id_service?.id_service || initialData.id_service || "",
        password: ""
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Extraction de l'ID pour la modification
    const userId = initialData?.id_utilisateur || initialData?.id;

    const dataToSend = {
      nom_utilisateur: form.nom_utilisateur,
      prenom_utilisateur: form.prenom_utilisateur,
      matricule: form.matricule,
      mail: form.email,
      login: form.login,
      // Mapping vers les noms attendus par le CreateUserSerializer de Django
      role: form.id_role ? Number(form.id_role) : null,
      service: form.id_service ? Number(form.id_service) : null
    };

    if (form.password && form.password.trim() !== "") {
      dataToSend.password = form.password;
    }

    try {
      if (userId) {
        // ✅ PUT : Modification d'un existant
        console.log(`Action: PUT sur utilisateurs/${userId}/`);
        await api.put(`utilisateurs/${userId}/`, dataToSend);
      } else {
        // ✅ POST : Création d'un nouveau
        console.log("Action: POST sur utilisateurs/");
        await api.post("utilisateurs/", dataToSend);
      }
      onSave(); 
    } catch (err) {
      console.error("Détails erreur serveur:", err.response?.data);
      alert("Erreur : " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  }; // <--- L'accolade fermante manquante a été ajoutée ici

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? `Modifier : ${initialData.login}` : "Nouvel utilisateur"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nom</label>
              <input required className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={form.nom_utilisateur} onChange={e => setForm({ ...form, nom_utilisateur: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Prénom</label>
              <input className="w-full border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={form.prenom_utilisateur} onChange={e => setForm({ ...form, prenom_utilisateur: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Rôle</label>
              <select required className="w-full border border-slate-300 p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={form.id_role} onChange={e => setForm({ ...form, id_role: e.target.value })}>
                <option value="">-- Choisir --</option>
                {roles.map(r => (
                  <option key={r.id_role} value={r.id_role}>{r.role_nom}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Service</label>
              <select required className="w-full border border-slate-300 p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={form.id_service} onChange={e => setForm({ ...form, id_service: e.target.value })}>
                <option value="">-- Choisir --</option>
                {services.map(s => (
                  <option key={s.id_service} value={s.id_service}>{s.service_nom}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Matricule</label>
              <input required className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input required type="email" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Identifiant (Login)</label>
              <input required className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe</label>
              <input type="password" required={!initialData} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={initialData ? "Laissez vide pour ne pas changer" : "****"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md disabled:bg-blue-300">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}