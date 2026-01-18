import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  FileSearch,
  Users,
  LogOut,
  Building2,
  ShieldCheck,
  UserCircle,
  BarChart3 
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import api from "../api/axios";

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = user?.role || user?.id_role?.role_nom || "UTILISATEUR";
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await api.post("logout/"); 
    } catch (err) {
      console.error("Erreur log logout:", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const menus = {
    ANALYSTE: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      {
        label: "Gestion valeur",
        icon: FileText,
        children: [
          { label: "Saisie manuelle", path: "/valeurs" },
          { label: "Extraction Sydonia", path: "/extraction" },
        ],
      },
      { label: "Consultation valeur", path: "/consultation", icon: FileSearch },
      { label: "Rapport", path: "/rapports", icon: BarChart3 },
    ],
    VALIDATEUR: [
      { label: "Gestion ValeurExtrait", path: "/valeur-extrait", icon: ClipboardCheck },
      { label: "Consultation valeur", path: "/consultation", icon: FileSearch },
      { label: "Rapport", path: "/rapports", icon: BarChart3 },
    ],
    UTILISATEUR: [
      { label: "Consultation valeur", path: "/consultation", icon: FileSearch },
      { label: "Rapport", path: "/rapports", icon: BarChart3 },
    ],
    ADMIN: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      {
        label: "Gestion valeur",
        icon: FileText,
        children: [
          { label: "Saisie manuelle", path: "/valeurs" },
          { label: "Extraction Sydonia", path: "/extraction" },
        ],
      },
      { label: "Utilisateurs", path: "/utilisateurs", icon: Users },
      { label: "Directions", path: "/directions", icon: Building2 },
      { label: "Consultation valeur", path: "/consultation", icon: FileSearch },
      { label: "Logs Actions", path: "/logactions", icon: ShieldCheck },
    ]
  };

  const currentMenu = menus[role] || menus["UTILISATEUR"];

  return (
    // AJOUT DE overflow-visible ICI
    <aside className={`h-screen bg-douane-primary text-white transition-all duration-300 flex flex-col z-50 sticky top-0 overflow-visible ${collapsed ? "w-20" : "w-64"}`}>
      <div className="p-5 border-b border-white/10 text-center bg-black/10">
        <h1 className="font-black text-xl tracking-tighter italic">
          {collapsed ? "SVO" : "SVO-EXPORT"}
        </h1>
        {!collapsed && <p className="text-[10px] text-blue-300 font-bold mt-1 uppercase">{role}</p>}
      </div>

      {/* CHANGEMENT : suppression de overflow-y-auto pour permettre au sous-menu de sortir */}
      <nav className="mt-4 flex flex-col gap-1 flex-1 px-3 overflow-visible">
        {currentMenu.map((item, index) => {
          const Icon = item.icon;
          const isItemActive = item.path && isActive(item.path);

          if (item.children) {
            return (
              <div key={index} className="group relative">
                <div className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl hover:bg-white/10 transition-colors">
                  {Icon && <Icon size={20} className="text-blue-200" />}
                  {!collapsed && <span className="flex-1 text-sm font-medium">{item.label}</span>}
                  {!collapsed && <span className="text-[8px] opacity-40 group-hover:rotate-90 transition-transform">▶</span>}
                </div>
                
                {/* Sous-menu au survol corrigé */}
                <div className={`absolute left-full top-0 ml-2 hidden group-hover:block bg-white text-slate-800 rounded-2xl shadow-2xl min-w-[220px] z-[110] border border-slate-200 overflow-hidden`}>
                  <div className="py-2">
                    <p className="px-4 py-2 text-[10px] font-black text-douane-primary uppercase bg-slate-50 border-b mb-1">{item.label}</p>
                    {item.children.map((sub, subIndex) => (
                      <Link key={subIndex} to={sub.path} className={`block px-4 py-2.5 text-sm ${isActive(sub.path) ? "bg-blue-50 text-douane-primary font-bold" : "text-slate-600 hover:bg-slate-50"}`}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link key={index} to={item.path} className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative ${isItemActive ? "bg-white text-douane-primary font-bold" : "text-blue-100/70 hover:bg-white/10"}`}>
              {Icon && <Icon size={20} className={isItemActive ? "text-douane-primary" : "text-blue-200"} />}
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 bg-black/10 flex flex-col gap-1">
        <Link to="/profil" className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative ${isActive('/profil') ? "bg-white text-douane-primary font-bold" : "text-blue-100/70 hover:bg-white/10"}`}>
          <UserCircle size={20} className={isActive('/profil') ? "text-douane-primary" : "text-blue-200"} />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold truncate w-32">{user?.login || "Profil"}</span>
              <span className="text-[9px] opacity-50 uppercase tracking-tighter">{role}</span>
            </div>
          )}
        </Link>

        <button onClick={handleLogout} className={`w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={20} />
          {!collapsed && <span className="font-bold text-sm">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}