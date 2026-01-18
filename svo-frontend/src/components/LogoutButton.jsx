// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("svo_access");
    localStorage.removeItem("svo_refresh");
    localStorage.removeItem("svo_user"); // si tu stockes l’utilisateur
    nav("/", { replace: true });
  };

  return (
    <button 
      onClick={logout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
      Se déconnecter
    </button>
  );
}
