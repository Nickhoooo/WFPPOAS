import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  X,
} from "lucide-react";

function Header({ userName, onLogout }) {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const profilePath = user?.role
    ? `/${user.role}/profile`
    : "/";

  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleProfile = () => {
    setShowMenu(false);
    navigate(profilePath);
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800">
            Welcome back
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            {userName}
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search projects..."
              className="w-72 h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl
              text-slate-700 placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-300
              transition"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative w-10 h-10 flex items-center justify-center
            rounded-xl border border-slate-200 bg-white
            text-slate-500 hover:bg-slate-50 hover:text-slate-800
            transition"
          >
            <Bell size={19} />

            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-xl
              hover:bg-slate-50 transition"
            >
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {userName}
                </p>

                <p className="text-[11px] text-slate-500">
                  {userRole}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  showMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {/* Profile */}
                <button
                  onClick={handleProfile}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <User size={17} className="text-slate-400" />

                  <span>Profile</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Logout */}
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={17} />

                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
              <LogOut size={20} />
            </div>

            {/* Content */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Log out?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to log out of your account?
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmLogout}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute"
              aria-label="Close"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;