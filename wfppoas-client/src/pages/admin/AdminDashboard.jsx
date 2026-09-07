import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  ListTodo,
  Users,
  AlertTriangle,
  CircleCheck,
  CircleDot,
  Upload,
} from "lucide-react";

import {
  dashboardService,
  projectService,
  documentService,
  getCurrentUser,
} from "../../services/api";

import AdminDashboardSkeleton from "../../components/skeletons/AdminDashboardSkeleton";


function timeAgo(dateString) {
  const seconds = Math.floor(
    (new Date() - new Date(dateString)) / 1000
  );

  if (seconds < 60) return "ngayon lang";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minuto ang nakalipas`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} oras ang nakalipas`;

  const days = Math.floor(hours / 24);
  return `${days} araw ang nakalipas`;
}


function AdminDashboard() {
  const [summary, setSummary] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    total_users: 0,
    active_users: 0,
    project_status: {
      on_track: 0,
      delayed: 0,
      completed: 0,
    },
  });

  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();

  useEffect(() => {
    Promise.all([
      dashboardService.getAdminSummary(),
      projectService.getAll(),
      documentService.getAll(),
      dashboardService.getActivity(),
    ])
      .then(([summaryRes, projectsRes, documentsRes, activityRes]) => {
        setSummary(summaryRes.data);
        setProjects(projectsRes.data || []);
        setDocuments(documentsRes.data || []);
        setActivity(activityRes.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Hindi ma-load ang ilang dashboard data. Subukan ulit mamaya."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => project.status === "ongoing"
  ).length;

  const statCards = [
    {
      label: "Projects",
      value: totalProjects,
      note: "All Projects",
      icon: FolderKanban,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      note: "Ongoing Projects",
      icon: Activity,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Tasks",
      value: summary.total_tasks,
      note: `${summary.completed_tasks} completed`,
      icon: ListTodo,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      label: "Total Staff",
      value: summary.total_users,
      note: `${summary.active_users} active`,
      icon: Users,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  const statusData = [
    {
      label: "On Track",
      value: summary.project_status.on_track,
      icon: CircleDot,
      style: "bg-blue-500",
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Delayed",
      value: summary.project_status.delayed,
      icon: AlertTriangle,
      style: "bg-red-500",
      iconStyle: "bg-red-50 text-red-600",
    },
    {
      label: "Completed",
      value: summary.project_status.completed,
      icon: CircleCheck,
      style: "bg-emerald-500",
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  const statusTotal =
    statusData.reduce((sum, status) => sum + status.value, 0) || 1;

  const activityIcons = {
    task: CheckCircle2,
    document: FileText,
    project: FolderKanban,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.name || "Admin"}. Here's an overview of your
          firm's operations.
        </p>
      </div>


      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {card.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {card.note}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconStyle}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Project Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Project Status
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Current status of all projects
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {statusData.map((status) => {
              const Icon = status.icon;
              const percentage =
                (status.value / statusTotal) * 100;

              return (
                <div key={status.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${status.iconStyle}`}
                      >
                        <Icon size={15} />
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {status.label}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {status.value}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${status.style} transition-all`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-[11px] text-slate-400">
                    {Math.round(percentage)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>


        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Recent Activity
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest activity across the system
            </p>
          </div>

          {activity.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center">
              <div className="text-center">
                <Activity
                  size={24}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm text-slate-400">
                  Walang recent activity.
                </p>
              </div>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {activity.slice(0, 5).map((item, index) => {
                const Icon =
                  activityIcons[item.type] || Activity;

                return (
                  <li
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 text-slate-700">
                        {item.message}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 size={12} />
                        {timeAgo(item.created_at)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>


      {/* Recent Data */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Recent Projects */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-800">
              Recent Projects
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest projects in the system
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 text-center">
              <FolderKanban
                size={26}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm text-slate-400">
                Wala pang mga projects.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3 font-medium">
                      Project
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {projects.slice(0, 5).map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <FolderKanban size={17} />
                          </div>

                          <span className="font-medium text-slate-700">
                            {project.project_name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            project.status === "ongoing"
                              ? "bg-blue-50 text-blue-600"
                              : project.status === "completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Recent Documents */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-800">
              Recent Documents
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Latest uploaded project documents
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="p-6 text-center">
              <FileText
                size={26}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm text-slate-400">
                Wala pang mga documents.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {documents.slice(0, 5).map((document) => (
                <li
                  key={document.id}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50/70"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize text-slate-700">
                      {document.file_type}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {document.project?.project_name || "Project"}{" "}
                      • v{document.version} •{" "}
                      {timeAgo(document.created_at)}
                    </p>
                  </div>

                  <Upload
                    size={15}
                    className="shrink-0 text-slate-300"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;