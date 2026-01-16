import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const token = localStorage.getItem("svo_access");

  // si aucun token → renvoie vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
