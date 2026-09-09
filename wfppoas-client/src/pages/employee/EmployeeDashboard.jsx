import { useEffect, useMemo, useState } from "react";
import {
  dashboardService,
  taskService,
  documentService,
  getCurrentUser,
} from "../../services/api";
import {
  Activity,
  CalendarDays,
  Check,
  CircleCheck,
  CircleDot,
  ClipboardList,
  Clock3,
  Eye,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Send,
  TrendingUp,
  UserRound,
} from "lucide-react";

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
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [progressInputs, setProgressInputs] = useState({});
  const [actionError, setActionError] = useState("");
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submitFile, setSubmitFile] = useState(null);
  const [submitComment, setSubmitComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const user = getCurrentUser();

  // --------------------------------------------------
  // MAP TASKS
  // --------------------------------------------------
  const mapTasks = (rawTasks) =>
    (rawTasks || []).map((task) => ({
      id: task.id,
      projectId: task.project_id,
      title: task.task_name || "Untitled task",
      status: task.status || "pending",
      progress: task.progress_percent || 0,
      managerComment: task.manager_comment,
      projectName: task.project?.project_name || "Project",
      deadline: task.deadline,
    }));

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------
  const fetchEmployeeData = async () => {
    try {
      setError("");

      const [summaryResponse, tasksResponse] = await Promise.all([
        dashboardService.getEmployeeSummary(),
        taskService.getMyTasks(),
      ]);

      setSummary(summaryResponse.data || summary);
      setTasks(mapTasks(tasksResponse.data));
    } catch (error) {
      console.error(error);
      setError("Hindi ma-load ang employee dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [user?.id]);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------
  const refreshTasks = async () => {
    try {
      const [tasksResponse, summaryResponse] = await Promise.all([
        taskService.getMyTasks(),
        dashboardService.getEmployeeSummary(),
      ]);

      setTasks(mapTasks(tasksResponse.data));
      setSummary(summaryResponse.data || summary);
    } catch (error) {
      console.error(error);
      setActionError("Hindi ma-refresh ang task data.");
    }
  };

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------
  const handleProgressChange = (taskId, value) => {
    setProgressInputs((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleUpdateProgress = async (task) => {
    const newProgress = progressInputs[task.id];

    if (newProgress === undefined || newProgress === "") {
      return;
    }

    setUpdatingTaskId(task.id);
    setActionError("");

    try {
      await taskService.update(task.projectId, task.id, {
        progress_percent: Number(newProgress),
      });

      setProgressInputs((prev) => {
        const updated = { ...prev };
        delete updated[task.id];
        return updated;
      });

      await refreshTasks();
    } catch (err) {
      setActionError("Hindi ma-update ang progress.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // --------------------------------------------------
  // SUBMIT FOR REVIEW
  // --------------------------------------------------
  const openSubmitModal = (task) => {
    setSubmittingTask(task);
    setSubmitFile(null);
    setSubmitComment("");
    setSubmitError("");
  };

  const handleSubmitForReview = async (e) => {
    e.preventDefault();

    if (!submitFile) {
      setSubmitError("Kailangan ng proof file bago mag-submit.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");

    try {
      const formData = new FormData();

      formData.append("file", submitFile);
      formData.append("file_type", "drawing");
      formData.append("task_id", submittingTask.id);

      await documentService.upload(
        submittingTask.projectId,
        formData
      );

      await taskService.submitForReview(
        submittingTask.projectId,
        submittingTask.id,
        submitComment
      );

      setSubmittingTask(null);
      refreshTasks();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Hindi ma-submit ang task."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // --------------------------------------------------
  // STATUS CONFIG
  // --------------------------------------------------
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock3,
      badge: "bg-slate-100 text-slate-600",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
    },

    in_progress: {
      label: "In Progress",
      icon: CircleDot,
      badge: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    for_review: {
      label: "For Review",
      icon: Eye,
      badge: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },

    completed: {
      label: "Completed",
      icon: CircleCheck,
      badge: "bg-emerald-50 text-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  };

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------
  const stats = useMemo(() => {
    const total = summary.total_tasks ?? tasks.length;

    const pending = summary.pending_tasks ?? 0;

    const inProgress =
      summary.in_progress_tasks ?? 0;

    const forReview =
      summary.for_review_tasks ?? 0;

    const completed =
      summary.completed_tasks ?? 0;

    const active = inProgress + forReview;

    const completionRate =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      pending,
      active,
      forReview,
      completed,
      completionRate,
    };
  }, [summary, tasks]);

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  const formatDate = (date) => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-80 rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-96 rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ClipboardList size={20} />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Employee Dashboard
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Welcome back,{" "}
          <span className="font-medium text-slate-700">
            {user?.name || "Employee"}
          </span>
          . Here's an overview of your assigned work.
        </p>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==========================================
          KPI CARDS
      ========================================== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* TOTAL */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Assigned
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ListTodo size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats.total}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Total assigned tasks
          </p>
        </div>

        {/* PENDING */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Pending
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Clock3 size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats.pending}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Waiting to start
          </p>
        </div>

        {/* ACTIVE */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Activity size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats.active}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            In progress or review
          </p>
        </div>

        {/* COMPLETED */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CircleCheck size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats.completed}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Finished tasks
          </p>
        </div>
      </div>

      {/* ==========================================
          PROGRESS OVERVIEW
      ========================================== */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp
                size={18}
                className="text-blue-600"
              />

              <h3 className="text-sm font-semibold text-slate-800">
                Overall Progress
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Your completed tasks across all projects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              {stats.completionRate}%
            </span>

            <span className="text-xs text-slate-400">
              complete
            </span>
          </div>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{
              width: `${stats.completionRate}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            {stats.completed} completed
          </span>

          <span>
            {stats.total} total
          </span>
        </div>
      </div>

      {/* ==========================================
          TASK SECTION
      ========================================== */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                My Tasks
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Manage your assigned tasks and update progress.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ClipboardList size={14} />
              {tasks.length} tasks
            </div>
          </div>
        </div>

        {/* ACTION ERROR */}
        {actionError && (
          <div className="mx-5 mt-5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {/* ========================================
            TASK GRID
        ======================================== */}
        <div className="p-5">

          {tasks.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ClipboardList size={24} />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-slate-700">
                No assigned tasks
              </h4>

              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Wala kang assigned tasks sa kasalukuyan.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {tasks.map((task) => {
                const config =
                  statusConfig[task.status] ||
                  statusConfig.pending;

                const StatusIcon = config.icon;

                return (
                  <div
                    key={task.id}
                    className="flex min-h-[300px] flex-col rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                  >

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}
                      >
                        <StatusIcon size={19} />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badge}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                        {config.label}
                      </span>
                    </div>

                    {/* TITLE */}
                    <div className="mt-5">
                      <h4 className="line-clamp-2 font-semibold text-slate-800">
                        {task.title}
                      </h4>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <FolderKanban size={13} />

                        <span className="truncate">
                          {task.projectName}
                        </span>
                      </div>
                    </div>

                    {/* MANAGER COMMENT */}
                    {task.managerComment && (
                      <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare
                            size={13}
                            className="text-red-500"
                          />

                          <span className="text-xs font-medium text-red-700">
                            Manager feedback
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs leading-5 text-red-600">
                          {task.managerComment}
                        </p>
                      </div>
                    )}

                    {/* DEADLINE */}
                    {task.deadline && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays
                          size={15}
                          className="text-slate-400"
                        />

                        <span>
                          Due {formatDate(task.deadline)}
                        </span>
                      </div>
                    )}

                    {/* PROGRESS */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Progress
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {task.progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              Math.max(task.progress, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    {(task.status === "pending" ||
                      task.status === "in_progress") && (
                      <div className="mt-auto border-t border-slate-100 pt-4">

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={
                                progressInputs[task.id] ?? ""
                              }
                              placeholder={`${task.progress}%`}
                              onChange={(e) =>
                                handleProgressChange(
                                  task.id,
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>

                          <button
                            onClick={() =>
                              handleUpdateProgress(task)
                            }
                            disabled={
                              updatingTaskId === task.id
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            <Check size={14} />
                            Update
                          </button>
                        </div>

                        <button
                          onClick={() => openSubmitModal(task)}
                          className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Submit for Review
                        </button>

                      </div>
                    )}

                    {/* FOR REVIEW */}
                    {task.status === "for_review" && (
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700">
                          <Eye size={14} />
                          Waiting for manager review
                        </div>
                      </div>
                    )}

                    {/* COMPLETED */}
                    {task.status === "completed" && (
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
                          <CircleCheck size={14} />
                          Task completed
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          SUBMIT FOR REVIEW MODAL
      ========================================== */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h3 className="text-lg font-semibold text-slate-900">
              Submit Task for Review
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {submittingTask.title}
            </p>

            {submitError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <form
              onSubmit={handleSubmitForReview}
              className="mt-4 space-y-4"
            >

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Proof of Completion *
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setSubmitFile(e.target.files[0])
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Comment (optional)
                </label>

                <textarea
                  value={submitComment}
                  onChange={(e) =>
                    setSubmitComment(e.target.value)
                  }
                  rows={3}
                  placeholder="Add a note for your manager"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  disabled={submitLoading}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {submitLoading
                    ? "Uploading..."
                    : "Submit for Review"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeDashboard;