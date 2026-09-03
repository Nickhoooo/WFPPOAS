import PropTypes from "prop-types";

function ProjectCard({ project, isSelected, onClick }) {
  const statusBadges = {
    ongoing: { label: "Ongoing", color: "bg-green-100 text-green-800" },
    "on-hold": { label: "On-hold", color: "bg-yellow-100 text-yellow-800" },
    completed: { label: "Completed", color: "bg-blue-100 text-blue-800" },
  };

  const status = statusBadges[project.status] || { label: project.status, color: "bg-gray-100 text-gray-800" };

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-5 transition ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
      }`}
    >
      <h3 className="font-semibold text-slate-900">{project.project_name || "Untitled"}</h3>
      <p className="mt-1 text-sm text-gray-600">Client: {project.client_name || "N/A"}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-400">Click to view details</p>
    </button>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default ProjectCard;
