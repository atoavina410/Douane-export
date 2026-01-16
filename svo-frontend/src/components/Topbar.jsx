// src/components/Topbar.jsx
import React from "react";

export default function Topbar({ user, onToggleSidebar }) {
  return (
    <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-100" aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151">
            <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Tableau de bord</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 hidden md:block">
          Bonjour, <span className="font-medium text-gray-800">{user?.prenom ?? "Utilisateur"}</span>
        </div>

        <button className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-50" title="Notifications">
          Notifications
        </button>

        <div className="flex items-center gap-2 p-1">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.prenom ?? 'U')}&background=E5E7EB`} alt="avatar" className="w-8 h-8 rounded-full"/>
        </div>
      </div>
    </header>
  );
}
