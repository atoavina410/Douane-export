import { useEffect, useState } from "react";
import api from "../api/axios";
import ModalUser from "../components/ModalUser";
import { UserPlus, Edit, Power, Trash2, RefreshCw, Shield, MapPin, Mail, Fingerprint } from "lucide-react";

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("utilisateurs/");
      const fetchedUsers = res.data.results || res.data || [];
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    } catch (e) {
      console.error("Erreur chargement utilisateurs", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!id) return;
    if (window.confirm("Voulez-vous supprimer définitivement cet utilisateur ?")) {
      try {
        await api.delete(`utilisateurs/${id}/`);
        setUsers(users.filter((u) => (u.id_utilisateur || u.id) !== id));
      } catch (e) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const toggleStatus = async (user) => {
    const id = user.id_utilisateur || user.id;
    const newStatus = !user.is_active;
    try {
      await api.patch(`utilisateurs/${id}/`, { is_active: newStatus });
      setUsers(users.map(u => 
        (u.id_utilisateur || u.id) === id ? { ...u, is_active: newStatus } : u
      ));
    } catch (e) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  return (
    <div className="p-6 max-w-[95%] mx-auto font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 font-medium italic">Administration des accès, rôles et structures de la douane.</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={loadUsers} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { setEditUser(null); setShowModal(true); }}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl flex items-center gap-3 hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all font-black text-xs uppercase tracking-widest"
          >
            <UserPlus size={18} /> Nouvel Agent
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">Identité</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">Accès</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">Matricule</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">Structure</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em]">Rôle</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Statut</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const userId = u.id_utilisateur || u.id;
                return (
                  <tr key={userId} className="hover:bg-slate-50/80 transition-all group">
                    {/* NOM & PRENOM */}
                    <td className="p-5">
                      <div className="font-black text-slate-800 uppercase text-xs">{u.nom_utilisateur}</div>
                      <div className="text-xs text-slate-500 font-bold italic">{u.prenom_utilisateur}</div>
                    </td>

                    {/* LOGIN & EMAIL */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-blue-600 font-mono text-[11px] font-bold">
                        <Fingerprint size={12} /> {u.login}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] mt-1 font-medium">
                        <Mail size={12} /> {u.mail || u.email}
                      </div>
                    </td>

                    {/* MATRICULE */}
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-black text-[11px] border border-slate-200">
                        {u.matricule || "---"}
                      </span>
                    </td>

                    {/* SERVICE & DIRECTION */}
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                        <MapPin size={12} className="text-red-400" /> {u.service_nom || "Service N/A"}
                      </div>
                      <div className="text-[9px] text-slate-400 font-black uppercase ml-4 tracking-tighter">
                        {u.direction_nom || "Direction non définie"}
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{u.role_nom || "Agent"}</span>
                      </div>
                    </td>

                    {/* STATUT */}
                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        u.is_active 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {u.is_active ? "Actif" : "Bloqué"}
                      </span>
                    </td>

                    {/* ACTIONS REGROUPÉES */}
                    <td className="p-5">
                      <div className="flex justify-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
                        <button 
                          onClick={() => {
                            const userToEdit = { ...u, id_utilisateur: u.id_utilisateur || u.id };
                            setEditUser(userToEdit); 
                            setShowModal(true); 
                          }}
                          className="p-2.5 text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button 
                          onClick={() => toggleStatus(u)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm ${u.is_active ? 'text-orange-500 hover:bg-white' : 'text-green-500 hover:bg-white'}`}
                          title={u.is_active ? "Suspendre l'accès" : "Réactiver l'accès"}
                        >
                          <Power size={16} />
                        </button>

                        <button 
                          onClick={() => deleteUser(userId)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                          title="Supprimer définitivement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="p-32 text-center bg-slate-50/50">
            <div className="text-slate-300 mb-2 font-black text-2xl uppercase tracking-tighter">Base de données vide</div>
            <p className="text-slate-400 text-sm italic font-medium">Aucun agent n'est actuellement enregistré dans le système.</p>
          </div>
        )}
      </div>

      {showModal && (
        <ModalUser 
          onClose={() => setShowModal(false)} 
          initialData={editUser}
          onSave={() => {
            loadUsers();
            setShowModal(false);
          }} 
        />
      )}
    </div>
  );
}