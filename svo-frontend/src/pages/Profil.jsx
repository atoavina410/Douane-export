import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Pour la redirection
import api from "../api/axios";
import { User, Lock, Save, ShieldCheck, AlertCircle, KeyRound, RefreshCcw } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    login: "",
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get("utilisateurs/me/");
      setUser(res.data);
      setFormData(prev => ({ ...prev, login: res.data.login }));
    } catch (err) {
      console.error("Erreur profil:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // 1. Changement de Login
      if (formData.login !== user.login) {
        await api.post(`utilisateurs/${user.id_utilisateur}/change_login/`, {
          new_login: formData.login
        });
      }

      // 2. Changement de Mot de passe
      if (formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        await api.post(`utilisateurs/${user.id_utilisateur}/change_password/`, {
          old_password: formData.old_password,
          new_password: formData.new_password
        });
      }

      setStatus({ type: "success", message: "Profil mis à jour ! Redirection..." });
      
      // Redirection après 2 secondes pour éviter la page blanche
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.detail || err.message || "Erreur" 
      });
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center font-black text-slate-400">CHARGEMENT...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      {/* Overlay de succès pour éviter la page blanche */}
      {status.type === "success" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] text-center shadow-2xl max-w-xs w-full">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Succès</h2>
            <p className="text-slate-500 text-sm font-medium mt-2">{status.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="h-32 bg-douane-primary flex items-end justify-center pb-0">
          <div className="w-24 h-24 bg-white rounded-3xl border-8 border-white translate-y-12 shadow-lg flex items-center justify-center text-douane-primary text-3xl font-black">
            {user.login?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="pt-16 pb-10 px-8">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{user.login}</h1>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">{user.id_role?.role_nom}</p>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Identité</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Login</label>
                <input type="text" value={formData.login} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold"
                  onChange={(e) => setFormData({...formData, login: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Sécurité</h3>
              <input type="password" placeholder="Ancien mot de passe" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm"
                onChange={(e) => setFormData({...formData, old_password: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="password" placeholder="Nouveau" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm"
                  onChange={(e) => setFormData({...formData, new_password: e.target.value})} />
                <input type="password" placeholder="Confirmer" className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm"
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" disabled={loading} className="w-full bg-douane-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                {loading ? <RefreshCcw className="animate-spin" size={16}/> : <Save size={16}/>}
                Enregistrer les changements
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}