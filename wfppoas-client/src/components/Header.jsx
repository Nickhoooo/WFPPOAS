function Header({ userName }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <input
        type="text"
        placeholder="Search projects..."
        className="w-72 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-800"
      />
      <div className="flex items-center gap-4">
        <span className="text-lg">🔔</span>
        <span className="text-sm font-medium">{userName} ▾</span>
      </div>
    </header>
  );
}

export default Header;