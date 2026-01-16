import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("svo_user");

    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("svo_user");
      }
    }

    setReady(true);
  }, []);

  const login = (data) => {
    localStorage.setItem("svo_access", data.access);
    localStorage.setItem("svo_refresh", data.refresh);
    localStorage.setItem("svo_user", JSON.stringify(data.utilisateur));
    setUser(data.utilisateur);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("logout/"); // Appelle la vue Django pour logger l'action
    } catch (err) {
      console.error("Erreur lors du log de déconnexion", err);
    } finally {
      logout(); // Ta fonction actuelle qui supprime le token et redirige
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
