import DashboardIcon from "../assets/DashboardIcon.png";
import UsersIcon from "../assets/UserIcon.png";
import EmployeesIcon from "../assets/EmployeeIcon.png";
import ProjectsIcon from "../assets/ProjectsIcon.png";
import MilestonesIcon from "../assets/MilestonesIcon.png";
import TasksIcon from "../assets/TasksIcon.png";
import DocumentsIcon from "../assets/DocumentsIcon.png";
import PerformanceIcon from "../assets/PerformanceIcon.png";
import NotificationsIcon from "../assets/NotificationIcon.png";
import SettingsIcon from "../assets/SettingsIcon.png";


export const navItems = {

  // ADMIN
  admin: [
    {
      section: "MAIN",
      items: [
        {
          icon: DashboardIcon,
          label: "Dashboard",
          path: "/admin/dashboard",
        },
      ],
    },
    {
      section: "WORKFORCE",
      items: [
        {
          icon: UsersIcon,
          label: "Users",
          path: "/admin/users",
        },
        {
          icon: EmployeesIcon,
          label: "Employees",
          path: "/admin/employees",
        },
      ],
    },
    {
      section: "PROJECT MANAGEMENT",
      items: [
        {
          icon: ProjectsIcon,
          label: "Projects",
          path: "/admin/projects",
        },
        {
          icon: MilestonesIcon,
          label: "Milestones",
          path: "/admin/milestones",
        },
        {
          icon: TasksIcon,
          label: "Tasks",
          path: "/admin/tasks",
        },
      ],
    },
    {
      section: "DOCUMENTS",
      items: [
        {
          icon: DocumentsIcon,
          label: "Documents",
          path: "/admin/documents",
        },
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        {
          icon: PerformanceIcon,
          label: "Performance",
          path: "/admin/performance",
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          icon: NotificationsIcon,
          label: "Notifications",
          path: "/admin/notifications",
        },
        {
          icon: SettingsIcon,
          label: "Settings",
          path: "/admin/settings",
        },
      ],
    },
  ],

  // MANAGER

  manager: [
    {
      section: "MAIN",
      items: [
        {
          icon: DashboardIcon,
          label: "Dashboard",
          path: "/manager/dashboard",
        },
      ],
    },
    {
      section: "PROJECTS",
      items: [
        {
          icon: ProjectsIcon,
          label: "Projects",
          path: "/manager/projects",
        },
        {
          icon: TasksIcon,
          label: "Tasks",
          path: "/manager/tasks",
        },
        {
          icon: MilestonesIcon,
          label: "Milestones",
          path: "/manager/milestones",
        },
      ],
    },
    {
      section: "WORKFORCE",
      items: [
        {
          icon: DocumentsIcon,
          label: "Documents",
          path: "/manager/documents",
        },
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        {
          icon: PerformanceIcon,
          label: "Performance",
          path: "/manager/performance",
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          icon: NotificationsIcon,
          label: "Notifications",
          path: "/manager/notifications",
        },
        {
          icon: SettingsIcon,
          label: "Settings",
          path: "/manager/settings",
        },
      ],
    },
  ],

  // EMPLOYEE
  employee: [
    {
      section: "MAIN",
      items: [
        {
          icon: DashboardIcon,
          label: "Dashboard",
          path: "/employee/dashboard",
        },
      ],
    },
    {
      section: "WORK",
      items: [
        {
          icon: TasksIcon,
          label: "My Tasks",
          path: "/employee/tasks",
        },
        {
          icon: DocumentsIcon,
          label: "Documents",
          path: "/employee/documents",
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          icon: NotificationsIcon,
          label: "Notifications",
          path: "/employee/notifications",
        },
        {
          icon: SettingsIcon,
          label: "Settings",
          path: "/employee/settings",
        },
      ],
    },
  ],
};