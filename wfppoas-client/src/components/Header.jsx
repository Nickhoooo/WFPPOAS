import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Check,
} from "lucide-react";
import { notificationService } from "../services/api";
import ProjectSearch from "./ProjectSearch";
import ProfileAvatar from "./ProfileAvatar";

function Header({ userName, onLogout, onOpenMenu, menuOpen = false }) {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const profilePath = user?.role
    ? `/${user.role}/profile`
    : "/";

  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  // =========================
  // LOAD NOTIFICATIONS
  // =========================
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await notificationService.getAll();

      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notifications when Header mounts
  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 15 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // CLICK OUTSIDE DROPDOWNS
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
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

  // =========================
  // PROFILE
  // =========================
  const handleProfile = () => {
    setShowMenu(false);
    navigate(profilePath);
  };

  // =========================
  // LOGOUT
  // =========================
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

  // =========================
  // NOTIFICATIONS
  // =========================
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const handleNotificationClick = async (notification) => {
  try {
    // Mark notification as read
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    }

    if (['account_setup_completed', 'password_reset', 'password_changed'].includes(notification.type) && user.role === 'admin') {
      navigate(notification.subject_user_id ? `/admin/users?user=${notification.subject_user_id}` : '/admin/users');
    } else if (['project_created', 'project_completed'].includes(notification.type)) {
      navigate(`/${user.role}/projects${notification.project_id ? `?project=${notification.project_id}` : ''}`);
    } else if (notification.project_id && notification.task_id) {
      navigate(
        `/${user.role}/tasks?project=${notification.project_id}&task=${notification.task_id}`
      );

      setShowNotifications(false);
    }
    setShowNotifications(false);
  } catch (error) {
    console.error(
      "Failed to handle notification:",
      error
    );
  }
};

  const formatNotificationTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <>
      {/* =========================
          HEADER
      ========================= */}
      <header className="h-20 shrink-0 gap-3 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button type="button" onClick={onOpenMenu} aria-label="Open navigation" aria-controls="mobile-navigation" aria-expanded={menuOpen} className="shrink-0 rounded-lg p-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 lg:hidden"><Menu size={24} /></button>
        
        {/* LEFT SIDE */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-sm sm:text-lg font-semibold text-slate-800">
            Welcome back
          </h2>

          <p className="truncate text-xs text-slate-500 mt-0.5">
            {userName}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">

          <ProjectSearch role={user.role} />

          {/* =========================
              NOTIFICATIONS
          ========================= */}
          <div
            className="relative"
            ref={notificationRef}
          >
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowMenu(false);
              }}
              className="
                relative
                w-10 h-10
                flex items-center justify-center
                rounded-xl
                border border-slate-200
                bg-white
                text-slate-500
                hover:bg-slate-50
                hover:text-slate-800
                transition
              "
              title="Notifications"
            >
              <Bell size={19} />

              {/* UNREAD BADGE */}
              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    min-w-[18px]
                    h-[18px]
                    px-1
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    text-white
                    text-[10px]
                    font-bold
                    border-2
                    border-white
                  "
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div
                className="
                  fixed sm:absolute
                  right-3 sm:right-0
                  top-20 sm:top-full
                  z-50
                  mt-2
                  w-96 max-w-[calc(100vw-1.5rem)]
                  overflow-hidden
                  rounded-xl
                  border border-slate-200
                  bg-white
                  shadow-xl
                "
              >
                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Notifications
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <Bell
                    size={17}
                    className="text-slate-400"
                  />
                </div>

                {/* NOTIFICATION LIST */}
                <div className="max-h-[380px] overflow-y-auto">

                  {loadingNotifications && notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-slate-400">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Bell
                          size={18}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="text-sm font-medium text-slate-600">
                        No notifications
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        New updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className={`
                          w-full
                          text-left
                          px-4
                          py-3
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                          ${
                            !notification.is_read
                              ? "bg-blue-50/50"
                              : "bg-white"
                          }
                        `}
                      >
                        <div className="flex gap-3">

                          {/* ICON */}
                          <div
                            className={`
                              flex-shrink-0
                              w-8
                              h-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              ${
                                !notification.is_read
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-slate-100 text-slate-400"
                              }
                            `}
                          >
                            {notification.is_read ? (
                              <Check size={15} />
                            ) : (
                              <Bell size={15} />
                            )}
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`
                                text-xs
                                leading-5
                                ${
                                  !notification.is_read
                                    ? "font-medium text-slate-800"
                                    : "text-slate-600"
                                }
                              `}
                            >
                              {notification.message}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatNotificationTime(
                                notification.created_at
                              )}
                            </p>
                          </div>

                          {/* UNREAD DOT */}
                          {!notification.is_read && (
                            <div className="flex-shrink-0 pt-1">
                              <span className="block w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* FOOTER */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-center text-slate-400">
                      Notifications are automatically updated
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="h-8 w-px bg-slate-200" />

          {/* =========================
              PROFILE MENU
          ========================= */}
          <div
            className="relative"
            ref={menuRef}
          >
            <button
              onClick={() => {
                setShowMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              className="
                flex
                items-center
                gap-3
                px-2
                py-1.5
                rounded-xl
                hover:bg-slate-50
                transition
              "
            >
              {/* AVATAR */}
              <ProfileAvatar className="h-9 w-9" />

              {/* USER INFO */}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {userName}
                </p>

                <p className="text-[11px] text-slate-500">
                  {userRole}
                </p>
              </div>

              {/* CHEVRON */}
              <ChevronDown
                size={16}
                className={`
                  text-slate-400
                  transition-transform
                  ${
                    showMenu
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {showMenu && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-50
                  mt-2
                  w-52
                  overflow-hidden
                  rounded-xl
                  border border-slate-200
                  bg-white
                  p-1.5
                  shadow-lg
                "
              >
                {/* PROFILE */}
                <button
                  onClick={handleProfile}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  <User
                    size={17}
                    className="text-slate-400"
                  />

                  <span>Profile</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* LOGOUT */}
                <button
                  onClick={handleLogoutClick}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <LogOut size={17} />

                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================
          LOGOUT CONFIRMATION MODAL
      ========================= */}
      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/40
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-sm
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            {/* ICON */}
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut
                size={22}
                className="text-red-500"
              />
            </div>

            {/* TITLE */}
            <h3 className="text-center text-lg font-semibold text-slate-800">
              Logout?
            </h3>

            {/* MESSAGE */}
            <p className="mt-2 text-center text-sm text-slate-500">
              Are you sure you want to logout from your account?
            </p>

            {/* BUTTONS */}
            <div className="mt-6 flex gap-3">

              {/* CANCEL */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                  transition
                "
              >
                Cancel
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleConfirmLogout}
                className="
                  flex-1
                  rounded-xl
                  bg-red-500
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  hover:bg-red-600
                  transition
                "
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;

