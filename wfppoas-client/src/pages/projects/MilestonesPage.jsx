import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Circle,
  CircleDot,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  X,
  Milestone,
} from "lucide-react";

import {
  projectService,
  milestoneService,
  getCurrentUser,
} from "../../services/api";
import { canManageProject } from "../../utils/projectPermissions";

import MilestonesPageSkeleton from "../../components/skeletons/MilestonesPage";

function MilestonesPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const [form, setForm] = useState({
    phase_name: "",
    order: "",
    status: "not_started",
    due_date: "",
  });

  const canManage = canManageProject(getCurrentUser(), projects.find((project) => String(project.id) === String(selectedProjectId)));

  useEffect(() => {
    projectService
      .getAll()
      .then((res) => setProjects(res.data || []))
      .catch(() => setError("Hindi ma-load ang projects."))
      .finally(() => setLoading(false));
  }, []);

  const refreshMilestones = () => {
    if (!selectedProjectId) return;

    setMilestonesLoading(true);
    setError("");

    milestoneService
      .getByProject(selectedProjectId)
      .then((res) => setMilestones(res.data || []))
      .catch(() => setError("Hindi ma-load ang milestones."))
      .finally(() => setMilestonesLoading(false));
  };

  useEffect(() => {
    if (!selectedProjectId) {
      setMilestones([]);
      return;
    }

    refreshMilestones();
  }, [selectedProjectId]);

  const openCreateModal = () => {
    setEditingMilestone(null);
    setForm({
      phase_name: "",
      order: milestones.length + 1,
      status: "not_started",
      due_date: "",
    });
    setModalError("");
    setShowModal(true);
  };

  const openEditModal = (milestone) => {
    setEditingMilestone(milestone);

    setForm({
      phase_name: milestone.phase_name,
      order: milestone.order,
      status: milestone.status,
      due_date: milestone.due_date || "",
    });

    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setModalLoading(true);
    setModalError("");

    try {
      if (editingMilestone) {
        await milestoneService.update(
          selectedProjectId,
          editingMilestone.id,
          form
        );
      } else {
        await milestoneService.create(selectedProjectId, form);
      }

      setShowModal(false);
      refreshMilestones();
    } catch (err) {
      setModalError(
        err.response?.data?.message || "Hindi ma-save ang milestone."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (milestoneId) => {
    if (
      !window.confirm(
        "Sigurado ka bang gusto mong i-delete ang milestone na ito?"
      )
    ) {
      return;
    }

    try {
      await milestoneService.delete(selectedProjectId, milestoneId);
      refreshMilestones();
    } catch (err) {
      setError("Hindi ma-delete ang milestone.");
    }
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => a.order - b.order
  );

  const stats = {
    total: milestones.length,
    notStarted: milestones.filter((m) => m.status === "not_started").length,
    inProgress: milestones.filter((m) => m.status === "in_progress").length,
    completed: milestones.filter((m) => m.status === "completed").length,
  };

  const selectedProject = projects.find(
    (project) => String(project.id) === String(selectedProjectId)
  );

  const statusConfig = {
    not_started: {
      label: "Not Started",
      icon: Circle,
      badge: "bg-slate-100 text-slate-600",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-400",
      border: "border-slate-200",
    },

    in_progress: {
      label: "In Progress",
      icon: CircleDot,
      badge: "bg-amber-50 text-amber-700",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      border: "border-amber-100",
    },

    completed: {
      label: "Completed",
      icon: Check,
      badge: "bg-emerald-50 text-emerald-700",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
    },
  };

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

  if (loading) {
    return <MilestonesPageSkeleton />;
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Milestone size={19} />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Milestones
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {canManage
              ? "Manage project phases and track milestone progress."
              : "View project phases and milestone progress."}
          </p>
        </div>

        {canManage && selectedProjectId && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            New Milestone
          </button>
        )}
      </div>

      {/* PROJECT SELECTOR */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FolderKanban size={18} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Project
            </p>

            <p className="mt-0.5 text-sm font-medium text-slate-700">
              {selectedProject?.project_name || "Select a project"}
            </p>
          </div>
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => { setSelectedProjectId(e.target.value); setShowModal(false); setMilestones([]); }}
          className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="">-- Pumili ng project --</option>

          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <X size={16} />
          {error}
        </div>
      )}

      {/* PROJECT CONTENT */}
      {selectedProjectId && (
        <>
          {/* STATS */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Milestone size={17} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {stats.total}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Project milestones
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Not Started
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <Circle size={17} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {stats.notStarted}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Waiting to begin
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  In Progress
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <CircleDot size={17} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {stats.inProgress}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Currently active
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Completed
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Check size={17} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {stats.completed}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Finished milestones
              </p>
            </div>
          </div>

          {/* MILESTONES */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* SECTION HEADER */}
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Project Roadmap
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {milestones.length}{" "}
                    {milestones.length === 1 ? "milestone" : "milestones"} in
                    this project
                  </p>
                </div>
              </div>
            </div>

            {/* CARDS */}
            <div className="p-5">
              {milestonesLoading ? (
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
                      <div className="mt-2 h-4 w-24 rounded bg-slate-200" />

                      <div className="mt-6 h-4 w-32 rounded bg-slate-200" />

                      <div className="mt-5 flex justify-end gap-2">
                        <div className="h-8 w-14 rounded-lg bg-slate-200" />
                        <div className="h-8 w-16 rounded-lg bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedMilestones.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Milestone size={28} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-slate-700">
                    No milestones yet
                  </h4>

                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    Wala pang milestones sa project na ito.
                  </p>

                  {canManage && (
                    <button
                      onClick={openCreateModal}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800"
                    >
                      <Plus size={15} />
                      Create First Milestone
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sortedMilestones.map((m) => {
                    const config =
                      statusConfig[m.status] || statusConfig.not_started;

                    const StatusIcon = config.icon;

                    return (
                      <div
                        key={m.id}
                        className={`group relative rounded-xl border bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${config.border}`}
                      >
                        {/* TOP */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}
                          >
                            <StatusIcon size={20} />
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badge}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {config.label}
                          </span>
                        </div>

                        {/* ORDER */}
                        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Phase {String(m.order).padStart(2, "0")}
                        </p>

                        {/* TITLE */}
                        <h4 className="mt-1 text-base font-semibold text-slate-800">
                          {m.phase_name}
                        </h4>

                        {/* DATE */}
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={15} className="text-slate-400" />

                          {m.due_date ? (
                            <span>
                              Due {formatDate(m.due_date)}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              No due date
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        {canManage && (
                          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                              onClick={() => openEditModal(m)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(m.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
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

      {/* EMPTY PROJECT STATE */}
      {!selectedProjectId && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <FolderKanban size={28} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-700">
            Select a project
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
            Choose a project above to view its milestones and project roadmap.
          </p>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {editingMilestone ? (
                      <Pencil size={16} />
                    ) : (
                      <Plus size={17} />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">
                    {editingMilestone
                      ? "Edit Milestone"
                      : "New Milestone"}
                  </h3>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {editingMilestone
                    ? "Update the milestone details."
                    : "Add a new phase to your project roadmap."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            {/* ERROR */}
            {modalError && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {modalError}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* PHASE NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Phase Name
                </label>

                <input
                  value={form.phase_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phase_name: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. Schematic Design"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ORDER + STATUS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        order: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* DUE DATE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Due Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        due_date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
                      <Check size={16} />
                      {editingMilestone ? "Save Changes" : "Create Milestone"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MilestonesPage;
