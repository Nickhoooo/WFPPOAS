import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderKanban,
  ListTodo,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  dashboardService,
  projectService,
  getCurrentUser,
} from "../../services/api";

import ManagerDashboardSkeleton from "../../components/skeletons/ManagerDashboardSkeleton";

function ManagerDashboard() {
  const [summary, setSummary] = useState({
    total_projects: 0,
    active_projects: 0,
    total_tasks: 0,
    completed_tasks: 0,
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        const [summaryRes, projectsRes] = await Promise.all([
          dashboardService.getManagerSummary(),
          projectService.getAll(),
        ]);

        const projectData = projectsRes.data || [];
        const summaryData = summaryRes.data || {};

        setProjects(projectData);

        setSummary({
          total_projects: projectData.length,
          active_projects: projectData.filter(
            (project) => project.status === "ongoing"
          ).length,
          total_tasks: summaryData.total_tasks || 0,
          completed_tasks: summaryData.completed_tasks || 0,
        });
      } catch (err) {
        console.error(err);
        setError("Hindi ma-load ang manager dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const projectStats = useMemo(() => {
    const total = projects.length;

    const ongoing = projects.filter(
      (project) => project.status === "ongoing"
    ).length;

    const completed = projects.filter(
      (project) => project.status === "completed"
    ).length;

    const pending = projects.filter(
      (project) =>
        project.status === "pending" ||
        project.status === "not_started"
    ).length;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      ongoing,
      completed,
      pending,
      completionRate,
    };
  }, [projects]);

  const taskCompletionRate =
    summary.total_tasks > 0
      ? Math.round(
          (summary.completed_tasks / summary.total_tasks) * 100
        )
      : 0;

  const statCards = [
    {
      label: "Projects",
      value: summary.total_projects,
      note: "All projects",
      icon: FolderKanban,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active",
      value: summary.active_projects,
      note: "Ongoing projects",
      icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Tasks",
      value: summary.total_tasks,
      note: `${summary.completed_tasks} completed`,
      icon: ClipboardList,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Completion",
      value: `${taskCompletionRate}%`,
      note: "Task completion rate",
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  if (loading) {
    return <ManagerDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BriefcaseBusiness size={20} />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Manager Dashboard
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Welcome back,{" "}
          <span className="font-medium text-slate-700">
            {user?.name || "Manager"}
          </span>
          . Monitor your projects, tasks, and team performance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {card.label}
                </p>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {card.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* TASK PERFORMANCE */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />

              <h3 className="text-sm font-semibold text-slate-800">
                Team Task Performance
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Overall completion across tasks assigned to your team
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              {taskCompletionRate}%
            </span>

            <span className="text-xs text-slate-400">
              complete
            </span>
          </div>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{
              width: `${taskCompletionRate}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{summary.completed_tasks} completed</span>

          <span>{summary.total_tasks} total tasks</span>
        </div>
      </div>

      {/* PROJECT OVERVIEW + RECENT PROJECTS */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Project Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" />

              <h3 className="text-sm font-semibold text-slate-800">
                Project Overview
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Current project status distribution
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* Ongoing */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />

                  <span className="text-sm text-slate-600">
                    Ongoing
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {projectStats.ongoing}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${
                      projectStats.total
                        ? (projectStats.ongoing /
                            projectStats.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm text-slate-600">
                    Completed
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {projectStats.completed}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${
                      projectStats.total
                        ? (projectStats.completed /
                            projectStats.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />

                  <span className="text-sm text-slate-600">
                    Pending
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {projectStats.pending}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{
                    width: `${
                      projectStats.total
                        ? (projectStats.pending /
                            projectStats.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban size={18} className="text-blue-600" />

              <h3 className="text-sm font-semibold text-slate-800">
                Recent Projects
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Your latest project activity
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FolderKanban size={22} />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-600">
                No projects yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Projects will appear here once created.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {projects.slice(0, 5).map((project) => {
                const isCompleted =
                  project.status === "completed";

                const isOngoing =
                  project.status === "ongoing";

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <FolderKanban size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {project.project_name ||
                            "Untitled Project"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Project #{project.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-600"
                          : isOngoing
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCompleted
                        ? "Completed"
                        : isOngoing
                        ? "Ongoing"
                        : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Team
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            Team Members
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Manage your project workforce
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ListTodo size={17} className="text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Tasks
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {summary.total_tasks} Total Tasks
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {summary.completed_tasks} successfully completed
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 size={17} className="text-slate-400" />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active Projects
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {summary.active_projects} Ongoing
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Currently in progress
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={17}
              className="text-emerald-500"
            />

            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project Completion
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {projectStats.completionRate}%
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Completed projects
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;