import Header from "./Header";
import Sidebar from "./Sidebar";

function DashboardLayout({ navItems, title, subtitle, children, userName, onLogout }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <Sidebar navItems={navItems} onLogout={onLogout} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={userName || "User"} />

        <main className="flex-1 overflow-y-auto p-8">
          {title && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
