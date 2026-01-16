import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function PrivateRoute() {
  const { user, ready } = useAuth();

  // On attend que le système vérifie le localStorage
  if (!ready) return null; 

  // Si pas d'utilisateur, redirection FORCÉE vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si utilisateur présent, on affiche le contenu (Dashboard, etc.)
  return <Outlet />;
}