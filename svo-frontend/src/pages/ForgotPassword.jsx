import { useState } from "react";
import api from "../api/axios";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Appelle la vue PasswordResetRequestView qu'on a préparé dans views.py
      await api.post("password-reset/", { email });
      setSent(true);
    } catch (err) {
      alert("Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/password-reset/", { email });
      alert("Vérifiez votre boîte mail !");
    } catch (error) {
      alert("Une erreur est survenue.");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Email envoyé !</h2>
          <p className="text-slate-500 mt-4 text-sm font-medium">
            Si cette adresse existe dans notre système, vous recevrez un lien de réinitialisation d'ici quelques instants.
          </p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-douane-primary font-bold hover:underline">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Mot de passe oublié ?</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Pas de panique, on s'en occupe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Votre adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                placeholder="exemple@douane.gov"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-douane-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
          >
            {loading ? "Envoi en cours..." : <><Send size={16} /> Envoyer le lien</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-[10px] font-black text-slate-400 uppercase hover:text-douane-primary transition-colors">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}