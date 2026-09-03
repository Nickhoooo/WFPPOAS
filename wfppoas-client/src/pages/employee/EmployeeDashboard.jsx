import { useEffect, useState } from "react";
import { dashboardService, projectService, taskService, getCurrentUser } from "../../services/api";


const employeeNavItems = [
  { section: "MAIN", items: [{ icon: "🏠", label: "Dashboard", path: "/employee/dashboard" }] },
  {
    section: "WORK",
    items: [
      { icon: "🧩", label: "Assigned Tasks" },
      { icon: "📦", label: "Projects" },
      { icon: "📄", label: "Documents" },
    ],
  },
  { section: "SYSTEM", items: [{ icon: "🔔", label: "Notifications" }, { icon: "⚙️", label: "Settings" }] },
];

function EmployeeDashboard() {
  const [summary, setSummary] = useState({
    total_tasks: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    for_review_tasks: 0,
    completed_tasks: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getCurrentUser();

  useEffect(() => {
  const fetchEmployeeData = async () => {
    try {
      const [summaryResponse, tasksResponse] = await Promise.all([
        dashboardService.getEmployeeSummary(),
        taskService.getMyTasks(),
      ]);

      const myTasks = (tasksResponse.data || []).map((task) => ({
        id: task.id,
        title: task.task_name || "Untitled task",
        status: task.status || "pending",
        projectName: task.project?.project_name || "Project",
      }));

      setSummary(summaryResponse.data || summary);
      setTasks(myTasks);
    } catch (error) {
      console.error(error);
      setError("Hindi ma-load ang employee dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  fetchEmployeeData();
}, [user?.id]);


  const formatStatus = (status) => {
    if (!status) return "Pending";

    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      for_review: "For Review",
      completed: "Completed",
    };

    return labels[status] || status;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Naglo-load...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">

      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold">Employee Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name || "Employee"} 👋 — your assigned work is listed below.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Assigned Tasks</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.total_tasks || tasks.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.pending_tasks || 0}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">In Progress</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.in_progress_tasks || 0}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{summary.completed_tasks || 0}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Task List</h3>

            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500">Walang assigned tasks sa kasalukuyan.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.projectName}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                      {formatStatus(task.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;