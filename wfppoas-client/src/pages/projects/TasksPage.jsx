import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  CircleCheck,
  CircleDot,
  ClipboardList,
  Clock3,
  Eye,
  Flag,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Plus,
  Search,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  projectService,
  taskService,
  getUserRole,
} from "../../services/api";

import TasksPageSkeleton from "../../components/skeletons/TasksPageSkeleton";

function TasksPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const [newTask, setNewTask] = useState({
    task_name: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    deadline: "",
  });

  const [rejectingTask, setRejectingTask] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectError, setRejectError] = useState("");

  const userRole = getUserRole();
  const isManager = userRole === "manager";

  // --------------------------------------------------
  // LOAD PROJECTS
  // --------------------------------------------------
  useEffect(() => {
    projectService
      .getAll()
      .then((res) => setProjects(res.data || []))
      .catch(() => setError("Hindi ma-load ang projects."))
      .finally(() => setLoading(false));
  }, []);

  // --------------------------------------------------
  // LOAD TASKS + TEAM
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      setTeamMembers([]);
      return;
    }

    setTasksLoading(true);
    setError("");

    Promise.all([
      taskService.getByProject(selectedProjectId),
      projectService.getTeam(selectedProjectId),
    ])
      .then(([tasksRes, teamRes]) => {
        setTasks(tasksRes.data || []);
        setTeamMembers(teamRes.data || []);
      })
      .catch(() => setError("Hindi ma-load ang tasks."))
      .finally(() => setTasksLoading(false));
  }, [selectedProjectId]);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------
  const refreshTasks = () => {
    if (!selectedProjectId) return;

    taskService
      .getByProject(selectedProjectId)
      .then((res) => setTasks(res.data || []))
      .catch(() => setError("Hindi ma-refresh ang tasks."));
  };

  // --------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------
  const handleCreateTask = async (e) => {
    e.preventDefault();

    setModalLoading(true);
    setModalError("");

    try {
      await taskService.create(selectedProjectId, newTask);

      setShowModal(false);

      setNewTask({
        task_name: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        deadline: "",
      });

      refreshTasks();
    } catch (err) {
      setModalError(
        err.response?.data?.message || "Hindi ma-create ang task."
      );
    } finally {
      setModalLoading(false);
    }
  };

  // --------------------------------------------------
  // APPROVE
  // --------------------------------------------------
  const handleApprove = async (taskId) => {
    try {
      await taskService.approve(selectedProjectId, taskId);
      refreshTasks();
    } catch (err) {
      setError("Hindi ma-approve ang task.");
    }
  };

  // --------------------------------------------------
  // REJECT
  // --------------------------------------------------
  const openRejectModal = (task) => {
    setRejectingTask(task);
    setRejectComment("");
    setRejectError("");
  };

  const handleReject = async (e) => {
    e.preventDefault();

    try {
      await taskService.reject(
        selectedProjectId,
        rejectingTask.id,
        rejectComment
      );

      setRejectingTask(null);
      refreshTasks();
    } catch (err) {
      setRejectError("Hindi ma-reject ang task.");
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
  // PRIORITY
  // --------------------------------------------------
  const priorityStyles = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-50 text-blue-600",
    high: "bg-red-50 text-red-600",
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  // --------------------------------------------------
  // SELECTED PROJECT
  // --------------------------------------------------
  const selectedProject = projects.find(
    (project) => String(project.id) === String(selectedProjectId)
  );

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------
  const stats = useMemo(() => {
    return {
      total: tasks.length,

      pending: tasks.filter(
        (task) => task.status === "pending"
      ).length,

      active: tasks.filter(
        (task) =>
          task.status === "in_progress" ||
          task.status === "for_review"
      ).length,

      completed: tasks.filter(
        (task) => task.status === "completed"
      ).length,
    };
  }, [tasks]);

  // --------------------------------------------------
  // FILTER TASKS
  // --------------------------------------------------
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        task.task_name?.toLowerCase().includes(searchText) ||
        task.description?.toLowerCase().includes(searchText) ||
        task.employee?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  // --------------------------------------------------
  // DATE FORMAT
  // --------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "No deadline";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

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
    return <TasksPageSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ClipboardList size={20} />
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Tasks
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {isManager
                ? "Manage and track tasks across your projects."
                : "View task progress across all projects."}
            </p>
          </div>

          {isManager && selectedProjectId && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={17} />
              New Task
            </button>
          )}
        </div>

        {/* ==========================================
            PROJECT SELECTOR
        ========================================== */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FolderKanban size={19} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Project
              </p>

              <p className="mt-0.5 text-sm font-medium text-slate-700">
                Select a project to view tasks
              </p>
            </div>
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setStatusFilter("all");
              setSearch("");
            }}
            className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Pumili ng project --</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>

          {selectedProject && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active project
            </div>
          )}
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
            PROJECT CONTENT
        ========================================== */}
        {selectedProjectId && (
          <>
            {/* ======================================
                KPI CARDS
            ====================================== */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              {/* TOTAL */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Total
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <ListTodo size={18} />
                  </div>
                </div>

                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total tasks
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

            {/* ======================================
                TASKS SECTION
            ====================================== */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* HEADER */}
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Project Tasks
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {filteredTasks.length} of {tasks.length} tasks
                    </p>
                  </div>

                  {/* SEARCH */}
                  <div className="relative w-full lg:w-72">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* FILTERS */}
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "in_progress", label: "In Progress" },
                    { key: "for_review", label: "Review" },
                    { key: "completed", label: "Completed" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() =>
                        setStatusFilter(filter.key)
                      }
                      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                        statusFilter === filter.key
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ====================================
                  TASK GRID
              ==================================== */}
              <div className="p-5">

                {tasksLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-xl border border-slate-200 p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="h-10 w-10 rounded-lg bg-slate-200" />
                          <div className="h-6 w-24 rounded-full bg-slate-200" />
                        </div>

                        <div className="mt-5 h-5 w-40 rounded bg-slate-200" />

                        <div className="mt-2 h-4 w-full rounded bg-slate-200" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />

                        <div className="mt-5 space-y-3">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                          <div className="h-4 w-28 rounded bg-slate-200" />
                          <div className="h-4 w-24 rounded bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (

                  /* EMPTY */
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ClipboardList size={24} />
                    </div>

                    <h4 className="mt-4 text-sm font-semibold text-slate-700">
                      No tasks found
                    </h4>

                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {search || statusFilter !== "all"
                        ? "Try changing your search or status filter."
                        : "Wala pang tasks sa project na ito."}
                    </p>

                    {isManager &&
                      !search &&
                      statusFilter === "all" && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                        >
                          <Plus size={14} />
                          Create First Task
                        </button>
                      )}
                  </div>

                ) : (

                  /* TASK CARDS */
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTasks.map((task) => {
                      const config =
                        statusConfig[task.status] ||
                        statusConfig.pending;

                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={task.id}
                          className="flex min-h-[250px] flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
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
                            <h4 className="line-clamp-1 font-semibold text-slate-800">
                              {task.task_name}
                            </h4>

                            {task.description && (
                              <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* META */}
                          <div className="mt-5 space-y-3">

                            {/* ASSIGNEE */}
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <UserRound
                                size={15}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="truncate">
                                {task.employee?.name ||
                                  "Walang naka-assign"}
                              </span>
                            </div>

                            {/* DEADLINE */}
                            {task.deadline && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CalendarDays
                                  size={15}
                                  className="shrink-0 text-slate-400"
                                />

                                <span>
                                  {formatDate(task.deadline)}
                                </span>
                              </div>
                            )}

                            {/* PRIORITY */}
                            {task.priority && (
                              <div className="flex items-center gap-2">
                                <Flag
                                  size={15}
                                  className="shrink-0 text-slate-400"
                                />

                                <span
                                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                                    priorityStyles[
                                      task.priority
                                    ] ||
                                    "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {priorityLabels[
                                    task.priority
                                  ] || task.priority}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* MANAGER COMMENT */}
                          {task.manager_comment && (
                            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare
                                  size={13}
                                  className="text-red-500"
                                />

                                <p className="text-xs font-medium text-red-700">
                                  Manager feedback
                                </p>
                              </div>

                              <p className="mt-1 text-xs leading-5 text-red-600">
                                {task.manager_comment}
                              </p>
                            </div>
                          )}

                          {/* ACTIONS */}
                          {isManager &&
                            task.status === "for_review" && (
                              <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                  onClick={() =>
                                    openRejectModal(task)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>

                                <button
                                  onClick={() =>
                                    handleApprove(task.id)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                                >
                                  <Check size={14} />
                                  Approve
                                </button>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ==========================================
            NO PROJECT SELECTED
        ========================================== */}
        {!selectedProjectId && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <FolderKanban size={28} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              Select a project
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              Choose a project above to view its tasks,
              progress, and status.
            </p>
          </div>
        )}
      </div>

      {/* ==========================================
          CREATE TASK MODAL
      ========================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ClipboardList size={19} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    New Task
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Create and assign a task to your team.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* ERROR */}
            {modalError && (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </p>
            )}

            <form
              onSubmit={handleCreateTask}
              className="mt-5 space-y-4"
            >

              {/* TASK NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Task Name
                </label>

                <input
                  value={newTask.task_name}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      task_name: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. Fix login authentication"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Describe what needs to be done..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ASSIGN TO */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Assign To
                </label>

                <select
                  value={newTask.assigned_to}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assigned_to: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Pumili --</option>

                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRIORITY + DEADLINE */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Priority
                  </label>

                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        deadline: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {modalLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          REJECT MODAL
      ========================================== */}
      {rejectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <XCircle size={19} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Reject Task
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {rejectingTask.task_name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRejectingTask(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* ERROR */}
            {rejectError && (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {rejectError}
              </p>
            )}

            <form
              onSubmit={handleReject}
              className="mt-5"
            >
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Reason / Feedback
              </label>

              <textarea
                value={rejectComment}
                onChange={(e) =>
                  setRejectComment(e.target.value)
                }
                required
                rows={4}
                placeholder="Anong kailangan ayusin?"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setRejectingTask(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <XCircle size={16} />
                  Reject Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TasksPage;