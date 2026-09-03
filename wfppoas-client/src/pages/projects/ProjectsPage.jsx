import { useEffect, useState } from "react";
import { projectService, getCurrentUser, getUserRole } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ProjectsList from "./ProjectsList";
import ProjectDetail from "./ProjectDetail";
import ProjectModal from "./ProjectModal";
import { navItems } from "../../config/navigation";


function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const user = getCurrentUser();
  const userRole = getUserRole();

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects when search term or status filter changes
  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Hindi ma-load ang projects. Subukan ulit mamaya.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by search term (project name or client name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.project_name || "").toLowerCase().includes(term) ||
          (p.client_name || "").toLowerCase().includes(term)
      );
    }

    setFilteredProjects(filtered);
  };

  const handleSelectProject = async (project) => {
    try {
      setSelectedProject(project);
      setError("");

      // Fetch team members for this project
      const teamResponse = await projectService.getTeam(project.id);
      setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      setError("Hindi ma-load ang project details.");
    }
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setTeamMembers([]);
  };

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setShowModal(true);
    setModalError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setModalError("");
  };

  const handleCreateProject = async (formData) => {
    try {
      setModalLoading(true);
      setModalError("");
      await projectService.create(formData);
      handleCloseModal();
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Hindi ma-create ang project.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setModalLoading(true);
      setModalError("");
      await projectService.update(editingProject.id, formData);
      handleCloseModal();
      await fetchProjects();
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Hindi ma-update ang project.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Sigurado ka bang gusto mong i-delete ang project? Mawawala rin ang lahat ng tasks at milestones nito. Hindi na mababawi."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      await projectService.delete(projectId);
      await fetchProjects();
      setSelectedProject(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Hindi ma-delete ang project. Subukan ulit mamaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async (userId) => {
    try {
      await projectService.addTeamMember(selectedProject.id, userId);
      // Refresh team members
      const teamResponse = await projectService.getTeam(selectedProject.id);
      setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Hindi ma-add ang team member.");
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    const member = teamMembers.find((m) => m.id === userId);
    const confirmRemove = window.confirm(
      `Sigurado ka bang gusto mong alisin si ${member?.name} mula sa team ng project?`
    );

    if (!confirmRemove) return;

    try {
      await projectService.removeTeamMember(selectedProject.id, userId);
      // Refresh team members
      const teamResponse = await projectService.getTeam(selectedProject.id);
      setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      setError("Hindi ma-remove ang team member.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Naglo-load ng projects...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
     <Sidebar navItems={navItems[userRole] || navItems.employee} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={user?.name || "Manager"} />

        <main className="flex-1 overflow-y-auto p-8">
          {selectedProject ? (
            // Detail View
            <ProjectDetail
              project={selectedProject}
              teamMembers={teamMembers}
              userRole={userRole}
              onBack={handleBackToList}
              onEdit={() => handleOpenModal(selectedProject)}
              onDelete={() => handleDeleteProject(selectedProject.id)}
              onAddTeamMember={handleAddTeamMember}
              onRemoveTeamMember={handleRemoveTeamMember}
              error={error}
              onErrorClear={() => setError("")}
            />
          ) : (
            // List View
            <div>
              <h2 className="text-2xl font-semibold">Projects</h2>
              <p className="mt-1 text-sm text-gray-500">
                Pamahalaan ang lahat ng projects at team members.
              </p>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <ProjectsList
                projects={filteredProjects}
                loading={loading}
                selectedId={selectedProject?.id}
                onSelectProject={handleSelectProject}
                onSearch={setSearchTerm}
                onFilterStatus={setStatusFilter}
                onCreateProject={() => handleOpenModal(null)}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                userRole={userRole}
              />
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      <ProjectModal
        isOpen={showModal}
        project={editingProject}
        onClose={handleCloseModal}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        loading={modalLoading}
        error={modalError}
      />
    </div>
  );
}

export default ProjectsPage;
