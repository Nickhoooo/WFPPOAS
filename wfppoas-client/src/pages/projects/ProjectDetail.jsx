import PropTypes from "prop-types";
import TeamMemberSection from "./TeamMemberSection";
import { getCurrentUser } from "../../services/api";
import { canManageProject } from "../../utils/projectPermissions";

function ProjectDetail({
  project,
  teamMembers,
  onBack,
  onEdit,
  onDelete,
  onAddTeamMember,
  onRemoveTeamMember,
  error,
  onErrorClear,
}) {
  const canManage = canManageProject(getCurrentUser(), project);
  const statusBadges = {
    ongoing: { label: "✅ Ongoing", color: "text-green-600" },
    "on-hold": { label: "⏸ On-hold", color: "text-yellow-600" },
    completed: { label: "✓ Completed", color: "text-blue-600" },
  };

  const status = statusBadges[project.status] || { label: project.status, color: "text-gray-600" };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{project.project_name}</h2>
            <p className="text-sm text-gray-500">Client: {project.client_name}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {!canManage && <p className="text-sm text-slate-500">Read-only: only the project manager or an admin can manage this project.</p>}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={onErrorClear}
            className="ml-2 text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Project Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">📋 PROJECT INFORMATION</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
         <div>
        <p className="text-gray-500">Location</p>
        <p className="font-semibold">
          {project.location || "N/A"}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Status</p>
        <p className="font-semibold">{project.status}</p>
      </div>

      <div>
        <p className="text-gray-500">Budget</p>
        <p className="font-semibold">
          {project.budget ? `₱${project.budget}` : "N/A"}
        </p>
      </div>

      <div>
        <p className="text-gray-500">Start Date</p>
        <p className="font-semibold">{project.start_date || "N/A"}</p>
      </div>

      <div>
        <p className="text-gray-500">End Date</p>
        <p className="font-semibold">{project.end_date || "N/A"}</p>
      </div>
        </div>

        {project.description && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-gray-500">Description</p>
            <p className="mt-1 text-slate-700">{project.description}</p>
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <TeamMemberSection
        projectId={project.id}
        teamMembers={teamMembers}
        canManage={canManage}
        managerId={project.manager_id}
        onAddMember={onAddTeamMember}
        onRemoveMember={onRemoveTeamMember}
      />

      {/* Milestones Section (Read-only for Phase A) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">🎯 MILESTONES (Phase A: Read-only)</h3>
        <p className="text-sm text-gray-500">Milestone management available in Phase B.</p>
      </div>

      {/* Tasks Section (Read-only for Phase A) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">✓ TASKS (Phase A: Read-only)</h3>
        <p className="text-sm text-gray-500">Task management available in Phase C.</p>
      </div>
    </div>
  );
}

ProjectDetail.propTypes = {
  project: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddTeamMember: PropTypes.func.isRequired,
  onRemoveTeamMember: PropTypes.func.isRequired,
  error: PropTypes.string,
  onErrorClear: PropTypes.func,
};

export default ProjectDetail;
