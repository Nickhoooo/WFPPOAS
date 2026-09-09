import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  FileCheck,
  Download,
  Trash2,
  X,
  Loader2,
  FolderOpen,
} from "lucide-react";

import {
  documentService,
  projectService,
  taskService,
  employeeService,
  getCurrentUser,
} from "../services/api";
import { canManageProject } from "../utils/projectPermissions";


function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  );
}


function DocumentsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter skeleton */}
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-48" />
        <Skeleton className="h-10 w-full md:w-40" />
      </div>

      {/* Document skeletons */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <Skeleton className="h-5 w-32" />
        </div>

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between border-b border-gray-100 px-6 py-5 last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-lg" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function getFileName(filePath) {
  if (!filePath) return "Unnamed document";

  const parts = filePath.split("/");
  return parts[parts.length - 1] || "Unnamed document";
}


function getFileIcon(type) {
  if (type === "photo") {
    return <ImageIcon size={21} />;
  }

  if (type === "permit") {
    return <FileCheck size={21} />;
  }

  return <FileText size={21} />;
}


function getTypeLabel(type) {
  if (type === "drawing") return "Drawing";
  if (type === "photo") return "Photo";
  if (type === "permit") return "Permit";

  return type || "Document";
}


function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


export default function DocumentsPage() {
  const user = getCurrentUser();
  const role = user?.role;

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isEmployee = role === "employee";

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const activeProject = projects.find((project) => String(project.id) === String(selectedProject));
  const canUpload = !!activeProject && (isAdmin || isEmployee ||
    (isManager && Number(activeProject.manager_id) === Number(user.id)));

  const [documents, setDocuments] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    project_id: "",
    task_id: "",
    file_type: "drawing",
    file: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // --------------------------------------------------
  // LOAD PROJECTS
  // --------------------------------------------------

  useEffect(() => {
    loadProjects();
  }, []);


  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      let response;

      if (isEmployee) {
        response = await employeeService.getMyProjects();
      } else {
        response = await projectService.getAll();
      }

      // /my-projects already scopes employees by membership. Managers must
      // select only owned projects, matching DocumentController's access rule.
      const data = (response.data || []).filter((project) =>
        isEmployee || canManageProject(user, project)
      );

      setProjects(data);

      setSelectedProject(data.length > 0 ? String(data[0].id) : "");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  };


  // --------------------------------------------------
  // LOAD DOCUMENTS
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedProject) {
      setDocuments([]);
      return;
    }

    loadDocuments(selectedProject);
  }, [selectedProject]);


  const loadDocuments = async (projectId) => {
    try {
      setLoadingDocuments(true);
      setError("");

      const response = await documentService.getByProject(projectId);

      setDocuments(response.data || []);
    } catch (err) {
      console.error(err);

      setDocuments([]);

      setError(
        err.response?.data?.message ||
        "Failed to load documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  };


  // --------------------------------------------------
  // LOAD TASKS
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    loadTasks(selectedProject);
  }, [selectedProject]);


  const loadTasks = async (projectId) => {
    try {
      if (isEmployee) {
        const response = await taskService.getMyTasks();

        const myTasks = (response.data || []).filter(
          (task) => Number(task.project_id) === Number(projectId)
        );

        setTasks(myTasks);
      } else {
        const response = await taskService.getByProject(projectId);

        setTasks(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);

      // Task selection is optional, so don't block document upload.
      setTasks([]);
    }
  };


  // --------------------------------------------------
  // FILTER DOCUMENTS
  // --------------------------------------------------

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const fileName = getFileName(document.file_path);

      const matchesSearch =
        fileName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        document.file_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter]);


  // --------------------------------------------------
  // OPEN UPLOAD MODAL
  // --------------------------------------------------

  const openUploadModal = () => {
    setUploadForm({
      project_id: selectedProject || "",
      task_id: "",
      file_type: "drawing",
      file: null,
    });

    setError("");
    setSuccess("");
    setShowUploadModal(true);
  };


  const closeUploadModal = () => {
    if (uploading) return;

    setShowUploadModal(false);

    setUploadForm({
      project_id: selectedProject || "",
      task_id: "",
      file_type: "drawing",
      file: null,
    });
  };


  // --------------------------------------------------
  // UPLOAD
  // --------------------------------------------------

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.project_id) {
      setError("Please select a project.");
      return;
    }

    if (!uploadForm.file) {
      setError("Please choose a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", uploadForm.file);
      formData.append("file_type", uploadForm.file_type);

      if (uploadForm.task_id) {
        formData.append("task_id", uploadForm.task_id);
      }

      await documentService.upload(
        uploadForm.project_id,
        formData
      );

      setSuccess("Document uploaded successfully.");

      setShowUploadModal(false);

      setUploadForm({
        project_id: selectedProject,
        task_id: "",
        file_type: "drawing",
        file: null,
      });

      await loadDocuments(selectedProject);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to upload document."
      );
    } finally {
      setUploading(false);
    }
  };


  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (document) => {
    const fileName = getFileName(document.file_path);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await documentService.delete(document.id);

      await loadDocuments(selectedProject);

      setSuccess("Document deleted successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to delete document."
      );
    }
  };


  // --------------------------------------------------
  // DOWNLOAD / VIEW
  // --------------------------------------------------

  const handleView = async (document) => {
    try {
      setError("");
      await documentService.download(document);
    } catch (err) {
      setError(err.message);
    }
  };


  // --------------------------------------------------
  // LOADING PROJECTS
  // --------------------------------------------------

  if (loadingProjects) {
    return (
      <div className="min-h-full bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-72" />
            </div>

            <Skeleton className="h-10 w-40" />
          </div>

          <DocumentsSkeleton />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-full bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* ------------------------------------------- */}
        {/* HEADER */}
        {/* ------------------------------------------- */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Documents
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage project documents, drawings, photos, and permits.
            </p>
          </div>

          {canUpload && (
            <button
              onClick={openUploadModal}
              disabled={projects.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={17} />
              Upload Document
            </button>
          )}
        </div>


        {/* ------------------------------------------- */}
        {/* ALERTS */}
        {/* ------------------------------------------- */}

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-4"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{success}</span>

            <button
              onClick={() => setSuccess("")}
              className="ml-4"
            >
              <X size={17} />
            </button>
          </div>
        )}


        {/* ------------------------------------------- */}
        {/* FILTERS */}
        {/* ------------------------------------------- */}

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>


            {/* Project */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              {projects.length === 0 ? (
                <option value="">
                  No projects
                </option>
              ) : (
                projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.project_name}
                  </option>
                ))
              )}
            </select>


            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="all">All Types</option>
              <option value="drawing">Drawing</option>
              <option value="photo">Photo</option>
              <option value="permit">Permit</option>
            </select>

          </div>
        </div>


        {/* ------------------------------------------- */}
        {/* DOCUMENT LIST */}
        {/* ------------------------------------------- */}

        {loadingDocuments ? (
          <DocumentsSkeleton />
        ) : projects.length === 0 ? (

          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <FolderOpen
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-base font-semibold text-gray-800">
              No projects available
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              You don't have any projects available yet.
            </p>
          </div>

        ) : filteredDocuments.length === 0 ? (

          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <FileText
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-4 text-base font-semibold text-gray-800">
              No documents found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search || typeFilter !== "all"
                ? "Try changing your search or filters."
                : "This project doesn't have any documents yet."}
            </p>

            {canUpload && documents.length === 0 && (
              <button
                onClick={openUploadModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Upload size={16} />
                Upload Document
              </button>
            )}
          </div>

        ) : (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Project Documents
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {filteredDocuments.length} document
                  {filteredDocuments.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>


            {filteredDocuments.map((document) => {
              const fileName = getFileName(
                document.file_path
              );

              return (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >

                  {/* Document info */}
                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                      {getFileIcon(document.file_type)}
                    </div>


                    <div className="min-w-0">

                      <h3
                        className="truncate text-sm font-semibold text-gray-900"
                        title={fileName}
                      >
                        {fileName}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">

                        <span>
                          {getTypeLabel(document.file_type)}
                        </span>

                        <span>•</span>

                        <span>
                          Version {document.version || 1}
                        </span>

                        {document.task && (
                          <>
                            <span>•</span>
                            <span>
                              {document.task.task_name}
                            </span>
                          </>
                        )}

                      </div>


                      <p className="mt-1 text-xs text-gray-400">
                        Uploaded by{" "}
                        <span className="text-gray-500">
                          {document.uploader?.name || "Unknown"}
                        </span>
                        {" • "}
                        {formatDate(document.created_at)}
                      </p>

                    </div>

                  </div>


                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      onClick={() => handleView(document)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Download size={15} />
                      Download
                    </button>

                    {(isAdmin || (isManager && projects.some((project) =>
                      Number(project.id) === Number(document.project_id) &&
                      Number(project.manager_id) === Number(user.id)
                    ))) && (
                      <button
                        onClick={() => handleDelete(document)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Delete document"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* UPLOAD MODAL */}
      {/* ================================================= */}

      {showUploadModal && canUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload Document
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Add a document to a project.
                </p>
              </div>

              <button
                onClick={closeUploadModal}
                disabled={uploading}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleUpload}
              className="space-y-5 p-6"
            >

              {/* Project */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Project
                </label>

                <select
                  value={uploadForm.project_id}
                  onChange={(e) => {
                    const projectId = e.target.value;

                    setUploadForm((prev) => ({
                      ...prev,
                      project_id: projectId,
                      task_id: "",
                    }));

                    if (projectId !== selectedProject) {
                      setSelectedProject(projectId);
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">
                    Select project
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


              {/* Task */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Task
                  <span className="ml-1 font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <select
                  value={uploadForm.task_id}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      task_id: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">
                    No task
                  </option>

                  {tasks.map((task) => (
                    <option
                      key={task.id}
                      value={task.id}
                    >
                      {task.task_name}
                    </option>
                  ))}
                </select>
              </div>


              {/* Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Document Type
                </label>

                <select
                  value={uploadForm.file_type}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file_type: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                >
                  <option value="drawing">
                    Drawing
                  </option>

                  <option value="photo">
                    Photo
                  </option>

                  <option value="permit">
                    Permit
                  </option>
                </select>
              </div>


              {/* File */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  File
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                  className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Maximum file size: 10 MB
                </p>
              </div>


              {/* Form error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}


              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">

                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Document
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
