import React, { useEffect, useState } from 'react';
import { useAuth } from "../Context/AuthContext";
import api from "../api/axios";
import DashboardAdmin from "../components/dashboard/DashboardAdmin";
import DashboardAnalyste from "../components/dashboard/DashboardAnalyste";
import DashboardValidateur from "../components/dashboard/DashboardValidateur";
import DashboardUtilisateur from "../components/dashboard/DashboardUtilisateurs";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role || user?.id_role?.role_nom || "UTILISATEUR";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('dashboard/stats/');
        setStats(response.data);
      } catch (error) {
        console.error("Erreur stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center font-black animate-pulse">Chargement des indicateurs...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">TABLEAU DE BORD</h1>
        <p className="text-slate-500 font-medium italic">Content de vous revoir, {user?.login}</p>
      </div>

      {/* On passe l'objet 'stats' à chaque composant via la prop 'data' */}
      {role === "ADMIN" && <DashboardAdmin data={stats} />}
      {role === "ANALYSTE" && <DashboardAnalyste data={stats} />}
      {role === "VALIDATEUR" && <DashboardValidateur data={stats} />}
      {role === "UTILISATEUR" && <DashboardUtilisateur data={stats} />}
    </div>
  );
}