export const navItems = {
  admin: [
    { section: "MAIN", items: [{ icon: "🏠", label: "Dashboard", path: "/admin/dashboard" }] },
    {
      section: "WORKFORCE",
      items: [
        { icon: "👥", label: "Users", path: "/admin/users" },
        { icon: "👷", label: "Employees", path: "/admin/employees" },
      ],
    },
    {
      section: "PROJECT MANAGEMENT",
      items: [
        { icon: "📁", label: "Projects", path: "/projects" },
        { icon: "📐", label: "Milestones", path: "/milestones" },
        { icon: "✓", label: "Tasks", path: "/task" },
      ],
    },
    { section: "DOCUMENTS", items: [{ icon: "📄", label: "Documents", path: "/documents" }] },
    { section: "ANALYTICS", items: [{ icon: "📊", label: "Performance", path: "/admin/performance" }] },
    {
      section: "SYSTEM",
      items: [
        { icon: "🔔", label: "Notifications", path: "/admin/notification" },
        { icon: "⚙️", label: "Settings", path: "/admin/settings" },
      ],
    },
  ],
  manager: [
    { section: "MAIN", items: [{ icon: "🏠", label: "Dashboard", path: "/manager/dashboard" }] },
    {
      section: "PROJECTS",
      items: [
        { icon: "📁", label: "Projects", path: "/projects" },
        { icon: "✓", label: "Tasks", path: "/projects" },
        { icon: "📊", label: "Reports", path: "/manager/dashboard" },
      ],
    },
    {
      section: "WORKFORCE",
      items: [
        { icon: "👥", label: "Team Members", path: "/projects" },
        { icon: "📄", label: "Documents", path: "/projects" },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        { icon: "🔔", label: "Notifications", path: "/manager/dashboard" },
        { icon: "⚙️", label: "Settings", path: "/manager/profile" },
      ],
    },
  ],
  employee: [
    { section: "MAIN", items: [{ icon: "🏠", label: "Dashboard", path: "/employee/dashboard" }] },
    {
      section: "WORK",
      items: [
        { icon: "🧩", label: "Assigned Tasks", path: "/employee/dashboard" },
        { icon: "📦", label: "Projects", path: "/projects" },
        { icon: "📄", label: "Documents", path: "/employee/dashboard" },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        { icon: "🔔", label: "Notifications", path: "/employee/dashboard" },
        { icon: "⚙️", label: "Settings", path: "/employee/profile" },
      ],
    },
  ],
};
