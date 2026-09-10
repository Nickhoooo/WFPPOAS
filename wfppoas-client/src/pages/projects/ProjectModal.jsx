import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function ProjectModal({ isOpen, project, onClose, onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    project_name: "",
    client_name: "",
    location: "",
    description: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "ongoing",
  });

  const [validationError, setValidationError] = useState("");

  // Pre-fill form if editing
  useEffect(() => {
    if (project) {
      setFormData({
      project_name: project.project_name || "",
      client_name: project.client_name || "",
      location: project.location || "",
      description: project.description || "",
      budget: project.budget ?? "",
      start_date: project.start_date?.slice(0, 10) || "",
      end_date: project.end_date?.slice(0, 10) || "",
      status: project.status || "ongoing",
    });
    } else {
      setFormData({
        project_name: "",
        client_name: "",
        location: "",
        description: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "ongoing",
      });
    }
    setValidationError("");
  }, [project, isOpen]);

  const validateForm = () => {
    if (!formData.project_name.trim()) {
      setValidationError("Project name is required.");
      return false;
    }
    if (!formData.client_name.trim()) {
      setValidationError("Client name is required.");
      return false;
    }
    if (!formData.location.trim()) {
    setValidationError("Project location is required.");
    return false;
  }
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setValidationError("End date must be after or equal to start date.");
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;

    const submitData = {
      ...formData,
      budget: formData.budget === "" || formData.budget == null ? null : Number(formData.budget),
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  const isEditing = !!project;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="project-modal-title" className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="project-modal-title" className="text-xl font-semibold text-slate-900">
            {isEditing ? "Edit project" : "New project"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close project form"
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {validationError && (
          <div className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            {validationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              placeholder="e.g., Green Tower Renovation"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              required
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="e.g., ABC Development Corp"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              required
            />
          </div>

          {/**Project Location */}

          <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Location <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          name="location"
          disabled={loading}
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Quezon City, Metro Manila"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          required
        />
      </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project details..."
              disabled={loading}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (Optional)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., 5000000"
              disabled={loading}
              step="0.01"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="ongoing">Ongoing</option>
              <option value="on-hold">On-hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  project: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default ProjectModal;
