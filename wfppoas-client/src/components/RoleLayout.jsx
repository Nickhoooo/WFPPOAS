import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import GuidedTour from "./GuidedTour";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { navItems } from "../config/navigation";
import { getCurrentUser } from "../services/api";

function RoleLayout({ role }) {
  const user = getCurrentUser();
  const drawer = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => drawer.current?.close();
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) drawer.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50 font-sans text-slate-800">
      <GuidedTour key={`${user?.id}-${role}`} userId={user?.id} role={role} />
      {/* Sidebar */}
      <div className="hidden h-full lg:block"><Sidebar navItems={navItems[role]} /></div>
      <dialog ref={drawer} id="mobile-navigation" aria-label="Navigation" onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }} className="sidebar-drawer">
        <Sidebar navItems={navItems[role]} mobile onNavigate={closeMenu} />
      </dialog>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          userName={user?.name || "User"}
          onLogout={handleLogout}
          menuOpen={menuOpen}
          onOpenMenu={() => { drawer.current?.showModal(); setMenuOpen(true); }}
        />

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RoleLayout;
