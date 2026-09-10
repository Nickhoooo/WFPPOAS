import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  ClipboardList,
  CalendarDays,
  User,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

import {
  projectService,
  taskService,
  documentService,
  getCurrentUser,
} from "../../services/api";
import { canManageProject } from "../../utils/projectPermissions";
import TasksPageSkeleton from '../../components/skeletons/TasksPageSkeleton';
import TaskCardsSkeleton from '../../components/skeletons/TaskCardsSkeleton';

function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Notification target task
  const [targetTaskId, setTargetTaskId] = useState(null);

  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Review task modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [managerComment, setManagerComment] = useState("");

  // Create task form
  const [formData, setFormData] = useState({
    task_name: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    deadline: "",
    milestone_id: "",
  });

  const canManage = canManageProject(getCurrentUser(), projects.find((project) => String(project.id) === String(selectedProjectId)));

  /*
  |--------------------------------------------------------------------------
  | Handle Notification Navigation
  |--------------------------------------------------------------------------
  |
  | Example:
  | /manager/tasks?project=5&task=23
  |
  | The notification sends the manager to the correct project and task.
  |
  */
  useEffect(() => {
    const projectId = searchParams.get("project");
    const taskId = searchParams.get("task");

    if (!projectId) {
      return;
    }

    setSelectedProjectId(String(projectId));

    // Make sure the target task is visible
    // even if filters were previously active.
    setSearch("");
    setStatusFilter("all");

    if (taskId) {
      setTargetTaskId(String(taskId));
    }

    // Remove query parameters after reading them.
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  /*
  |--------------------------------------------------------------------------
  | Load Projects
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await projectService.getAll();

        const projectList = response.data || [];

        setProjects(projectList);

        // Automatically select the first project
        // only when there is no project selected yet.
        if (projectList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(String(projectList[0].id));
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Tasks + Team Members
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      setTeamMembers([]);
      return;
    }

    const loadProjectData = async () => {
      try {
        setTasksLoading(true);
        setError("");

        const [tasksResponse, teamResponse] = await Promise.all([
          taskService.getByProject(selectedProjectId),
          projectService.getTeamEmployees(selectedProjectId),
        ]);

        setTasks(tasksResponse.data || []);
        setTeamMembers(teamResponse.data || []);
      } catch (err) {
        console.error("Failed to load project tasks:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load tasks."
        );

        setTasks([]);
        setTeamMembers([]);
      } finally {
        setTasksLoading(false);
      }
    };

    loadProjectData();
  }, [selectedProjectId]);

  /*
  |--------------------------------------------------------------------------
  | Scroll to Notification Target Task
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!targetTaskId || tasks.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      const taskElement = document.getElementById(
        `task-${targetTaskId}`
      );

      if (!taskElement) {
        return;
      }

      taskElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      taskElement.classList.add(
        "ring-2",
        "ring-blue-500",
        "ring-offset-2"
      );

      const removeHighlightTimer = setTimeout(() => {
        taskElement.classList.remove(
          "ring-2",
          "ring-blue-500",
          "ring-offset-2"
        );

        setTargetTaskId(null);
      }, 3000);

      return () => clearTimeout(removeHighlightTimer);
    }, 300);

    return () => clearTimeout(timer);
  }, [tasks, targetTaskId]);

  /*
  |--------------------------------------------------------------------------
  | Selected Project
  |--------------------------------------------------------------------------
  */
  const selectedProject = useMemo(() => {
    return projects.find(
      (project) =>
        String(project.id) === String(selectedProjectId)
    );
  }, [projects, selectedProjectId]);

  /*
  |--------------------------------------------------------------------------
  | Filter Tasks
  |--------------------------------------------------------------------------
  */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        task.task_name
          ?.toLowerCase()
          .includes(searchText) ||
        task.description
          ?.toLowerCase()
          .includes(searchText) ||
        task.employee?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | Create Task
  |--------------------------------------------------------------------------
  */
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!selectedProjectId) {
      return;
    }

    try {
      setError("");

      await taskService.create(selectedProjectId, {
        task_name: formData.task_name,
        description: formData.description,
        assigned_to: Number(formData.assigned_to),
        priority: formData.priority,
        deadline: formData.deadline || null,
        milestone_id: formData.milestone_id
          ? Number(formData.milestone_id)
          : null,
      });

      // Reload tasks
      const response = await taskService.getByProject(
        selectedProjectId
      );

      setTasks(response.data || []);

      // Reset form
      setFormData({
        task_name: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        deadline: "",
        milestone_id: "",
      });

      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create task:", err);

      const message =
        err.response?.data?.message ||
        "Failed to create task.";

      setError(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Review Task
  |--------------------------------------------------------------------------
  */
  const handleReview = async (task) => {
    if (!selectedProjectId) {
      return;
    }

    try {
      setError("");

      const response = await taskService.getOne(
        selectedProjectId,
        task.id
      );

      setReviewTask(response.data);
      setShowReviewModal(true);
    } catch (err) {
      console.error("Failed to load task details:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load task details."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Approve Task
  |--------------------------------------------------------------------------
  */
  const handleApprove = async (task) => {
    if (!selectedProjectId || !task) {
      return;
    }

    try {
      setError("");

      await taskService.approve(
        selectedProjectId,
        task.id
      );

      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: "completed",
              }
            : item
        )
      );

      // Update the review modal task as well
      setReviewTask((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
            }
          : null
      );

      setShowReviewModal(false);
      setReviewTask(null);
    } catch (err) {
      console.error("Failed to approve task:", err);

      setError(
        err.response?.data?.message ||
          "Failed to approve task."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Open Reject Modal
  |--------------------------------------------------------------------------
  */
  const handleOpenReject = (task) => {
    setSelectedTask(task);
    setManagerComment("");

    // Close review modal before opening reject modal
    setShowReviewModal(false);

    setShowRejectModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Reject Task
  |--------------------------------------------------------------------------
  */
  const handleReject = async (e) => {
    e.preventDefault();

    if (!selectedTask || !selectedProjectId) {
      return;
    }

    if (!managerComment.trim()) {
      return;
    }

    try {
      setError("");

      await taskService.reject(
        selectedProjectId,
        selectedTask.id,
        managerComment
      );

      setTasks((prev) =>
        prev.map((item) =>
          item.id === selectedTask.id
            ? {
                ...item,
                status: "in_progress",
                manager_comment: managerComment,
              }
            : item
        )
      );

      setShowRejectModal(false);
      setSelectedTask(null);
      setManagerComment("");
      setReviewTask(null);
    } catch (err) {
      console.error("Failed to reject task:", err);

      setError(
        err.response?.data?.message ||
          "Failed to reject task."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Task
  |--------------------------------------------------------------------------
  */
  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.task_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await taskService.delete(
        selectedProjectId,
        task.id
      );

      setTasks((prev) =>
        prev.filter((item) => item.id !== task.id)
      );
    } catch (err) {
      console.error("Failed to delete task:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete task."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Status Badge
  |--------------------------------------------------------------------------
  */
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            Completed
          </span>
        );

      case "for_review":
        return (
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
            For Review
          </span>
        );

      case "in_progress":
        return (
          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
            In Progress
          </span>
        );

      case "pending":
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            Pending
          </span>
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Priority Badge
  |--------------------------------------------------------------------------
  */
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <span className="text-xs font-medium text-red-600">
            High
          </span>
        );

      case "medium":
        return (
          <span className="text-xs font-medium text-yellow-600">
            Medium
          </span>
        );

      case "low":
        return (
          <span className="text-xs font-medium text-green-600">
            Low
          </span>
        );

      default:
        return (
          <span className="text-xs font-medium text-gray-500">
            Medium
          </span>
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return <TasksPageSkeleton />;
  }

  return (
    <div className="space-y-6">

      {/* ================================================================
          HEADER
      ================================================================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor project tasks.
          </p>
        </div>

        {canManage && selectedProjectId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>

      {/* ================================================================
          ERROR
      ================================================================= */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ================================================================
          PROJECT SELECTOR
      ================================================================= */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Project
        </label>

        <select
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setTargetTaskId(null);
            setShowCreateModal(false);
            setShowReviewModal(false);
            setShowRejectModal(false);
            setTasks([]);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:w-96"
        >
          <option value="">
            Select a project
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.project_name}
            </option>
          ))}
        </select>
      </div>

      {/* ================================================================
          PROJECT INFORMATION
      ================================================================= */}
      {selectedProject && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {selectedProject.project_name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedProject.client_name ||
                  "No client specified"}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {teamMembers.length} team member
              {teamMembers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          FILTERS
      ================================================================= */}
      {selectedProjectId && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="for_review">
              For Review
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>
      )}

      {/* ================================================================
          TASKS
      ================================================================= */}
      {!selectedProjectId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <ClipboardList
            size={40}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 text-sm text-gray-500">
            Select a project to view its tasks.
          </p>
        </div>
      ) : tasksLoading ? (
        <TaskCardsSkeleton />
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <ClipboardList
            size={40}
            className="mx-auto text-gray-300"
          />

          <p className="mt-3 text-sm font-medium text-gray-600">
            No tasks found.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              id={`task-${task.id}`}
              className="flex min-h-[250px] flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >

              {/* ========================================================
                  TASK HEADER
              ========================================================= */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-800">
                    {task.task_name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() =>
                      handleDelete(task)
                    }
                    className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete task"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ========================================================
                  DESCRIPTION
              ========================================================= */}
              <p className="mt-4 line-clamp-3 text-sm text-gray-500">
                {task.description ||
                  "No task description provided."}
              </p>

              {/* ========================================================
                  TASK INFORMATION
              ========================================================= */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User size={14} />

                  <span>
                    {task.employee?.name ||
                      "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={14} />

                  <span>
                    {task.deadline
                      ? new Date(
                          task.deadline
                        ).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
              </div>

              {/* ========================================================
                  PROGRESS
              ========================================================= */}
              <div className="mt-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Progress
                  </span>

                  <span className="text-xs font-semibold text-slate-700">
                    {task.progress_percent || 0}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-slate-700 transition-all"
                    style={{
                      width: `${task.progress_percent || 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* ========================================================
                  EMPLOYEE COMMENT
              ========================================================= */}
              {task.employee_comment && (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-700">
                    Employee Comment
                  </p>

                  <p className="mt-1 text-xs text-blue-600">
                    {task.employee_comment}
                  </p>
                </div>
              )}

              {/* ========================================================
                  MANAGER COMMENT
              ========================================================= */}
              {task.manager_comment && (
                <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700">
                    Manager Feedback
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {task.manager_comment}
                  </p>
                </div>
              )}

              {/* ========================================================
                  ACTIONS
              ========================================================= */}
              <div className="mt-auto pt-5">

                {task.status === "for_review" &&
                  canManage && (
                    <button
                      onClick={() =>
                        handleReview(task)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-900"
                    >
                      <ClipboardList size={15} />
                      Review Task
                    </button>
                  )}

              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProjectId && !canManage && <p className="text-sm text-slate-500">Read-only: only the project manager or an admin can manage tasks.</p>}

      {/* ================================================================
          CREATE TASK MODAL
      ================================================================= */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Create Task
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add a new task to this project.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="space-y-4"
            >

              {/* Task Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Task Name
                </label>

                <input
                  type="text"
                  value={formData.task_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      task_name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Enter task name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  placeholder="Enter task description"
                />
              </div>

              {/* Assign Employee */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign To
                </label>

                <select
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assigned_to: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">
                    Select employee
                  </option>

                  {teamMembers.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>

                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Deadline
                </label>

                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          REVIEW TASK MODAL
      ================================================================= */}
      {showReviewModal && reviewTask && canManage && String(reviewTask.project_id) === String(selectedProjectId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Review Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Review Task
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Review the submitted work before making a decision.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewTask(null);
                }}
                className="text-gray-400 transition hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Review Content */}
            <div className="space-y-5 p-6">

              {/* Task Name */}
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Task
                </p>

                <h3 className="mt-1 text-xl font-semibold text-slate-800">
                  {reviewTask.task_name}
                </h3>
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                  Status
                </p>

                {getStatusBadge(reviewTask.status)}
              </div>

              {/* Description */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {reviewTask.description ||
                    "No description provided."}
                </p>
              </div>

              {/* Employee + Deadline */}
              <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Assigned Employee
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {reviewTask.employee?.name ||
                      "Unknown employee"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Deadline
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {reviewTask.deadline
                      ? new Date(
                          reviewTask.deadline
                        ).toLocaleDateString()
                      : "No deadline"}
                  </p>
                </div>

              </div>

              {/* Progress */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Progress
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {reviewTask.progress_percent || 0}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-slate-700 transition-all"
                    style={{
                      width: `${
                        reviewTask.progress_percent || 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Employee Comment */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase text-blue-600">
                  Employee Comment
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  {reviewTask.employee_comment ||
                    "No comment provided."}
                </p>
              </div>

              {/* Submitted Documents */}
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Submitted Documents / Proof
                </p>

                {reviewTask.documents &&
                reviewTask.documents.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {reviewTask.documents.map(
                      (document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {document.file_path
                                ?.split("/")
                                .pop() ||
                                "Document"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {document.file_type ||
                                "File"}
                            </p>
                          </div>

                          <button
                            onClick={() => documentService.download(document).catch((error) => window.alert(error.message))}
                            className="ml-4 shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Download
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    No documents submitted.
                  </p>
                )}
              </div>

              {/* Manager Feedback if exists */}
              {reviewTask.manager_comment && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase text-red-600">
                    Manager Feedback
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {reviewTask.manager_comment}
                  </p>
                </div>
              )}

            </div>

            {/* Review Actions */}
            {reviewTask.status === "for_review" && (
              <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">

                <button
                  onClick={() =>
                    handleOpenReject(reviewTask)
                  }
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  <X size={16} />
                  Reject
                </button>

                <button
                  onClick={() =>
                    handleApprove(reviewTask)
                  }
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  <Check size={16} />
                  Approve
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================================
          REJECT MODAL
      ================================================================= */}
      {showRejectModal && selectedTask && canManage && String(selectedTask.project_id) === String(selectedProjectId) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Reject Task
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Provide feedback so the employee can revise the task.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTask(null);
                  setManagerComment("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleReject}
              className="space-y-4"
            >

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  {selectedTask.task_name}
                </p>

                <textarea
                  value={managerComment}
                  onChange={(e) =>
                    setManagerComment(
                      e.target.value
                    )
                  }
                  required
                  rows={5}
                  placeholder="Enter your feedback..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTask(null);
                    setManagerComment("");

                    // Reopen review modal
                    setReviewTask(selectedTask);
                    setShowReviewModal(true);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject Task
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default TasksPage;
