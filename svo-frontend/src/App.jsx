import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "./api/axios";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Utilisateurs from "./pages/Utilisateurs";
import Valeurs from "./pages/Valeurs";
import Directions from "./pages/Directions";
import LogsActions from "./pages/LogsActions";
import Profil from "./pages/Profil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConsulationValeurs from "./pages/ConsulationValeurs";
import ValeursExtraites from "./pages/ValeursExtraites";

function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const pageNames = {
        "/dashboard": "Tableau de bord",
        "/logactions": "Audit Système",
        "/profil": "Mon Profil",
        "/utilisateurs": "Gestion Utilisateurs"
      };
      
      const page = pageNames[location.pathname] || location.pathname;
      
      // On ne tracke pas les pages publiques pour ne pas polluer les logs
      if (location.pathname !== "/login" && location.pathname !== "/forgot-password") {
        api.post("valeurs/track-visit/", { page }).catch(() => {});
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [location]);

  return null;
}

export default function App() {
  return (
    <>
      <NavigationTracker />
      
      <Routes>
        {/* ==========================================================
            ROUTES PUBLIQUES (Accessibles sans être connecté)
            ========================================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
	<Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        {/* ==========================================================
            ROUTES PROTÉGÉES (Nécessitent une connexion)
            ========================================================== */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/valeurs" element={<Valeurs />} />
            <Route path="/valeur-extrait" element={<ValeursExtraites />} />

            <Route path="/logactions" element={<LogsActions />} />
            <Route path="/directions" element={<Directions />} />
            <Route path="/profil" element={<Profil />} />
	    <Route path="/consultation" element={<ConsulationValeurs />} />
          </Route>
        </Route>

        {/* REDIRECTION PAR DÉFAUT */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}