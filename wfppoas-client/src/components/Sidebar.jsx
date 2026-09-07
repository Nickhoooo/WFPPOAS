import { useNavigate } from "react-router-dom";

function Sidebar({ navItems }) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-white text-xl font-bold">WFPPOAS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          A&E Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 mb-2">
              {group.section}
            </p>

            {group.items.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 hover:text-white transition"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-5 h-5 object-contain"
                />

                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;