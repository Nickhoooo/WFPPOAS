import { useEffect, useState } from "react";
import { dashboardService, projectService, getCurrentUser } from "../../services/api";


const managerNavItems = [
  { section: "MAIN", items: [{ icon: "🏠", label: "Dashboard", path: "/manager/dashboard" }] },
  {
    section: "PROJECTS",
    items: [
      { icon: "📁", label: "Projects", path: "/manager/dashboard" },
      { icon: "✓", label: "Tasks", path: "/manager/dashboard" },
      { icon: "📊", label: "Reports", path: "/manager/dashboard" },
    ],
  },
  { section: "WORKFORCE", items: [{ icon: "👥", label: "Team Members" }, { icon: "📄", label: "Documents" }] },
  { section: "SYSTEM", items: [{ icon: "🔔", label: "Notifications" }, { icon: "⚙️", label: "Settings" }] },
];

function ManagerDashboard() {
  const [summary, setSummary] = useState({
    total_projects: 0,
    active_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getCurrentUser();

  useEffect(() => {
    Promise.all([
      dashboardService.getManagerSummary(),
      projectService.getAll(),
    ])
      .then(([summaryRes, projectsRes]) => {
        setSummary({
          total_projects: projectsRes.data.length,
          active_projects: projectsRes.data.filter((project) => project.status === "ongoing").length,
          total_tasks: summaryRes.data.total_tasks || 0,
          completed_tasks: summaryRes.data.completed_tasks || 0,
        });
      })
      .catch(() => {
        setError("Hindi ma-load ang manager dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);



  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Naglo-load...</div>;
  }

  const statCards = [
    { label: "Projects", value: summary.total_projects, note: "All projects" },
    { label: "Active", value: summary.active_projects, note: "Ongoing tasks" },
    { label: "Tasks", value: summary.total_tasks, note: `${summary.completed_tasks} completed` },
    { label: "Team", value: 12, note: "Members" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
     

      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold">Manager Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name || "Manager"} 👋 — monitor team performance and project progress.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-6 grid grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-gray-400">{card.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Project Overview</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>On Track</span><span className="font-medium text-green-600">6</span></div>
                <div className="flex justify-between"><span>Delayed</span><span className="font-medium text-red-600">2</span></div>
                <div className="flex justify-between"><span>Completed</span><span className="font-medium text-blue-600">4</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Updates</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• Team milestone reviewed.</li>
                <li>• Two tasks moved to review.</li>
                <li>• Project schedule approved.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManagerDashboard;