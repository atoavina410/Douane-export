import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-douane-light">
      <Sidebar collapsed={collapsed} />

      <main className="flex-1 p-8">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-4 text-sm text-douane-primary underline"
        >
          {collapsed ? "Afficher menu" : "Réduire menu"}
        </button>

        <Outlet />
      </main>
    </div>
  );
}
