import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { navItems } from "../config/navigation";
import { getCurrentUser } from "../services/api";

function RoleLayout({ role }) {
  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar navItems={navItems[role]} />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          userName={user?.name || "User"}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RoleLayout;