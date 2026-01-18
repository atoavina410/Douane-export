import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Vérifie que ton axios n'a pas d'intercepteur bloquant
import { Lock, CheckCircle, RefreshCcw } from "lucide-react";

export default function ResetPassword() {
  const { uid, token } = useParams(); // Récupère les DEUX paramètres de l'URL
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setStatus({ type: "error", message: "Les mots de passe ne correspondent pas" });
    }

    setLoading(true);
    try {
      // Appel à l'URL dynamique avec uid et token
      await api.post(`password-reset-confirm/${uid}/${token}/`, { 
        new_password: passwords.new 
      });
      
      setStatus({ type: "success", message: "Mot de passe modifié avec succès ! Redirection..." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Le lien a expiré ou est invalide.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl">
        <h2 className="text-2xl font-black text-slate-800 text-center uppercase mb-8">Nouveau mot de passe</h2>
        
        {status.type === "success" ? (
          <div className="text-center text-emerald-600 font-bold">
            <CheckCircle className="mx-auto mb-4" size={48} />
            <p>{status.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input 
                type="password" required placeholder="Nouveau mot de passe"
                className="w-full p-3 pl-10 bg-slate-50 rounded-xl outline-none border focus:border-blue-500"
                onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
            
            <div className="relative">
              <input 
                type="password" required placeholder="Confirmer le mot de passe"
                className="w-full p-3 pl-10 bg-slate-50 rounded-xl outline-none border focus:border-blue-500"
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              />
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>

            <button 
              disabled={loading} 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 transition-colors"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : "RÉINITIALISER"}
            </button>
            
            {status.type === "error" && (
              <p className="text-red-500 text-sm text-center font-medium mt-2">{status.message}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}