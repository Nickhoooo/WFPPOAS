import { useState, useEffect } from "react";
import { dashboardService, projectService, documentService, getCurrentUser } from "../../services/api";


function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
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
        setProjects(projectsRes.data);
        setDocuments(documentsRes.data);
        setActivity(activityRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Hindi ma-load ang ilang dashboard data. Subukan ulit mamaya.");
      })
      .finally(() => setLoading(false));
  }, []);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Naglo-load...
      </div>
    );
  }

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "ongoing").length;

  const statCards = [
    { label: "Projects", value: totalProjects, note: "All Projects" },
    { label: "Active Projects", value: activeProjects, note: "Ongoing Projects" },
    { label: "Tasks", value: summary.total_tasks, note: `${summary.completed_tasks} tapos na` },
    { label: "Total Staff", value: summary.total_users, note: `${summary.active_users} active` },
  ];

  const statusData = [
    { label: "On Track", value: summary.project_status.on_track, color: "bg-green-500" },
    { label: "Delayed", value: summary.project_status.delayed, color: "bg-red-500" },
    { label: "Completed", value: summary.project_status.completed, color: "bg-blue-500" },
  ];
  const statusTotal = statusData.reduce((sum, s) => sum + s.value, 0) || 1;

  const activityIcons = { task: "✓", document: "📄", project: "📁" };

  return (
    <>
       <div className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, {user?.name || "Admin"} 👋 — Here's an overview of your firm's operations.
      </p>
    </div>

    {error && (
      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    )}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Project Status</h3>
          <div className="space-y-3">
            {statusData.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${s.color} h-2 rounded-full`}
                    style={{ width: `${(s.value / statusTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400">Walang recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-base">{activityIcons[a.type]}</span>
                  <div>
                    <p className="text-gray-700">{a.message}</p>
                    <p className="text-xs text-gray-400">{timeAgo(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Projects</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400">Wala pang mga projects.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                  <th className="pb-2">Project</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium">{p.project_name}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.status === "ongoing"
                            ? "bg-blue-50 text-blue-600"
                            : p.status === "completed"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Documents</h3>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">Wala pang mga documents.</p>
          ) : (
            <ul className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id} className="flex items-start gap-2.5 text-sm">
                  <span className="text-base">📐</span>
                  <div>
                    <p className="font-medium text-gray-700 capitalize">{doc.file_type}</p>
                    <p className="text-xs text-gray-400">
                      {doc.project?.project_name} • v{doc.version} • {timeAgo(doc.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  </>
  );
}

export default AdminDashboard;