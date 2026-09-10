import { useEffect, useRef, useState } from "react";
import { projectService, getUserRole } from "../../services/api"
import ProjectsList from "./ProjectsList";
import ProjectDetail from "./ProjectDetail";
import ProjectModal from "./ProjectModal";
import ProjectsPageSkeleton from "../../components/skeletons/ProjectsPageSkeleton";
import { useSearchParams } from 'react-router-dom';



function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamBusy, setTeamBusy] = useState(false);
  const selectionRequest = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const userRole = getUserRole();
  useEffect(() => {
    const targetId = searchParams.get('project');
    if (!targetId || loading) return;
    const target = projects.find(project => String(project.id) === targetId);
    if (target) handleSelectProject(target);
    else setError('This project is no longer available.');
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, loading, projects]);

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
    const requestId = ++selectionRequest.current;
    try {
      setTeamMembers([]);
      setTeamLoading(true);
      setSelectedProject(project);
      setError("");

      // Fetch team members for this project
      const teamResponse = await projectService.getTeam(project.id);
      if (requestId === selectionRequest.current) setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      if (requestId === selectionRequest.current) setError("Hindi ma-load ang project team. Open the project again to retry.");
    } finally {
      if (requestId === selectionRequest.current) setTeamLoading(false);
    }
  };

  const handleBackToList = () => {
    ++selectionRequest.current;
    setTeamLoading(false);
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
      const response = await projectService.update(editingProject.id, formData);
      setSelectedProject(previous => ({...previous, ...response.data}));
      handleCloseModal();
      await fetchProjects();
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
      setError(err.response?.data?.message || "Hindi ma-delete ang project. Subukan ulit mamaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async (userId) => {
    if (teamBusy) return;
    setTeamBusy(true);
    const requestId = selectionRequest.current;
    try {
      setError("");
      await projectService.addTeamMember(selectedProject.id, userId);
      // Refresh team members
      const teamResponse = await projectService.getTeam(selectedProject.id);
      if (requestId === selectionRequest.current) setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Hindi ma-add ang team member.");
    } finally {
      setTeamBusy(false);
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    if (teamBusy) return;
    const member = teamMembers.find((m) => m.id === userId);
    const confirmRemove = window.confirm(
      `Sigurado ka bang gusto mong alisin si ${member?.name} mula sa team ng project?`
    );

    if (!confirmRemove) return;
    setTeamBusy(true);
    const requestId = selectionRequest.current;

    try {
      await projectService.removeTeamMember(selectedProject.id, userId);
      // Refresh team members
      const teamResponse = await projectService.getTeam(selectedProject.id);
      if (requestId === selectionRequest.current) setTeamMembers(teamResponse.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Hindi ma-remove ang team member.");
    } finally {
      setTeamBusy(false);
    }
  };



  if (loading && projects.length === 0) {
    return <ProjectsPageSkeleton />;
  }

  return (
    <div className="min-w-0 text-slate-800">


      <div className="flex-1 flex flex-col overflow-hidden">
       

        <main className="min-w-0">
          {selectedProject ? (
            // Detail View
            <ProjectDetail
              project={selectedProject}
              teamMembers={teamMembers}
              teamLoading={teamLoading}
              busy={teamBusy || loading}
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
                Track your projects, timelines, and the people behind the work.
              </p>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                  <button onClick={fetchProjects} className="ml-3 underline">Retry</button>
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
