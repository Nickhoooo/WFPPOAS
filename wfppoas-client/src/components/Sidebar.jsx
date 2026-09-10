import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

function Sidebar({ navItems, onNavigate, mobile = false }) {

  return (
    <aside className="app-sidebar h-full w-64 shrink-0 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="relative px-6 py-6 border-b border-slate-800">
        {mobile && <button type="button" onClick={onNavigate} aria-label="Close navigation" className="absolute right-3 top-3 rounded-lg p-2 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-400"><X size={20} /></button>}
        <h1 className="text-white text-xl font-bold">WFPPOAS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          A&E Management
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 mb-2">
              {group.section}
            </p>

            {group.items.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                data-tour={`nav-${item.path.split("/").pop()}`}
                onClick={onNavigate}
                className={({ isActive }) => `sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-sky-400 ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-5 h-5 object-contain"
                />

                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
