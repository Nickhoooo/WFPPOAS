import PropTypes from "prop-types";
import ProjectCard from "./ProjectCard";

function ProjectsList({
  projects,
  loading,
  selectedId,
  onSelectProject,
  onSearch,
  onFilterStatus,
  onCreateProject,
  searchTerm,
  statusFilter,
  userRole,
}) {
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "ongoing", label: "Ongoing" },
    { value: "on-hold", label: "On-hold" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* Search Bar & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="🔍 Hanapin ang project o client..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          {userRole === "manager" && (
            <button
              onClick={onCreateProject}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              + New Project
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterStatus(option.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                statusFilter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Naglo-load ng projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all"
              ? "Walang project na tumugma sa iyong search."
              : userRole === "manager"
              ? "Walang projects pa. I-click ang [+ New Project] para magsimula."
              : "Walang projects na makikita mo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selectedId === project.id}
              onClick={() => onSelectProject(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

ProjectsList.propTypes = {
  projects: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedId: PropTypes.number,
  onSelectProject: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFilterStatus: PropTypes.func.isRequired,
  onCreateProject: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  statusFilter: PropTypes.string,
  userRole: PropTypes.string.isRequired,
};

export default ProjectsList;
