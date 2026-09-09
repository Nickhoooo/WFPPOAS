import axios from "axios";

// ─────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────

const API_URL = "http://127.0.0.1:8000/api";

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid/expired, clear it
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────
// Authentication Endpoints
// ─────────────────────────────────────────────────────

export const authService = {
  // Login with email and password
  login: (email, password) =>
    apiClient.post("/login", { email, password }),

  // Logout (clears token from localStorage and backend)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return apiClient.post("/logout");
  },

  // Request password reset email
  forgotPassword: (email) =>
    apiClient.post("/forgot-password", { email }),

  // Reset password with token
  resetPassword: (email, password, password_confirmation, token) =>
    apiClient.post("/reset-password", {
      email,
      password,
      password_confirmation,
      token,
    }),
};

// ─────────────────────────────────────────────────────
// Project Endpoints
// ─────────────────────────────────────────────────────

export const projectService = {
  // Get all projects (for current user)
  getAll: () =>
    apiClient.get("/projects"),

  // Get a single project with its details
  getOne: (projectId) =>
    apiClient.get(`/projects/${projectId}`),

  // Create a new project
  create: (projectData) =>
    apiClient.post("/projects", projectData),

  getTeamEmployees: (projectId) =>
  apiClient.get(`/projects/${projectId}/team/employees`),

  // Update a project
  update: (projectId, projectData) =>
    apiClient.put(`/projects/${projectId}`, projectData),

  // Delete a project
  delete: (projectId) =>
    apiClient.delete(`/projects/${projectId}`),

  // Get project team members
  getTeam: (projectId) =>
    apiClient.get(`/projects/${projectId}/team`),

  // Add a member to project team
  addTeamMember: (projectId, userId) =>
    apiClient.post(`/projects/${projectId}/team`, { user_id: userId }),

  // Remove a member from project team
  removeTeamMember: (projectId, userId) =>
    apiClient.delete(`/projects/${projectId}/team/${userId}`),
  
  getAvailableEmployees: (projectId) =>
  apiClient.get(`/projects/${projectId}/available-employees`),

 
};

// ─────────────────────────────────────────────────────
// Task Endpoints
// ─────────────────────────────────────────────────────

export const taskService = {
  getByProject: (projectId) =>
    apiClient.get(`/projects/${projectId}/tasks`),

  getMyTasks: () =>
    apiClient.get("/my-tasks"),

  getOne: (projectId, taskId) =>
    apiClient.get(`/projects/${projectId}/tasks/${taskId}`),

  create: (projectId, taskData) =>
    apiClient.post(`/projects/${projectId}/tasks`, taskData),

  update: (projectId, taskId, taskData) =>
    apiClient.put(`/projects/${projectId}/tasks/${taskId}`, taskData),

  delete: (projectId, taskId) =>
    apiClient.delete(`/projects/${projectId}/tasks/${taskId}`),

  submitForReview: (projectId, taskId, employeeComment) =>
  apiClient.post(`/projects/${projectId}/tasks/${taskId}/submit`, {
    employee_comment: employeeComment,
  }),

  approve: (projectId, taskId) =>
    apiClient.post(`/projects/${projectId}/tasks/${taskId}/approve`),

  reject: (projectId, taskId, managerComment) =>
    apiClient.post(`/projects/${projectId}/tasks/${taskId}/reject`, {
      manager_comment: managerComment,
    }),
};
// ─────────────────────────────────────────────────────
// Performance Endpoints
// ─────────────────────────────────────────────────────

export const milestoneService = {
  getByProject: (projectId) =>
    apiClient.get(`/projects/${projectId}/milestones`),

  create: (projectId, data) =>
    apiClient.post(`/projects/${projectId}/milestones`, data),

  update: (projectId, milestoneId, data) =>
    apiClient.put(`/projects/${projectId}/milestones/${milestoneId}`, data),

  delete: (projectId, milestoneId) =>
    apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`),
};
// ─────────────────────────────────────────────────────
// Milestone Endpoints
// ─────────────────────────────────────────────────────

export const performanceService = {
  getByEmployee: (userId, projectId = null) =>
    apiClient.get(`/users/${userId}/performance`, { params: { project_id: projectId } }),

  compute: (userId, period, projectId = null) =>
    apiClient.post(`/users/${userId}/performance/compute`, {
      period,
      project_id: projectId,
    }),
};

export const userService = {
  getAll: () =>
    apiClient.get("/users"),

  getEmployees: () =>
    apiClient.get("/employees"),
};

// ─────────────────────────────────────────────────────
// Utility: Get Current User
// ─────────────────────────────────────────────────────

export const getCurrentUser = () => {
  const userString = localStorage.getItem("user");
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────
// Utility: Check if User is Authenticated
// ─────────────────────────────────────────────────────

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// ─────────────────────────────────────────────────────
// Utility: Get Current User Role
// ─────────────────────────────────────────────────────

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// ─────────────────────────────────────────────────────
// Dashboard Endpoints
// ─────────────────────────────────────────────────────

export const dashboardService = {
  // Get admin dashboard summary
  getAdminSummary: () =>
    apiClient.get("/dashboard/admin"),

  // Get manager dashboard summary
  getManagerSummary: () =>
    apiClient.get("/dashboard/manager"),

  // Get employee dashboard summary
  getEmployeeSummary: () =>
    apiClient.get("/dashboard/employee"),

  // Get recent activity
  getActivity: () =>
    apiClient.get("/dashboard/activity"),

  getPerformanceOverview: () =>
  apiClient.get("/dashboard/performance-overview"),
};

// ─────────────────────────────────────────────────────
// Document Endpoints
// ─────────────────────────────────────────────────────

export const documentService = {
  download: async (document) => {
    try {
      const response = await apiClient.get(`/documents/${document.id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.file_path.split("/").pop();
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      let message = "Failed to download document.";
      if (error.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await error.response.data.text()).message || message;
        } catch { /* Use the fallback for non-JSON errors. */ }
      }
      throw new Error(message);
    }
  },

  getByProject: (projectId) =>
    apiClient.get(`/projects/${projectId}/documents`),

  upload: (projectId, formData) =>
    apiClient.post(`/projects/${projectId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (documentId) =>
    apiClient.delete(`/documents/${documentId}`),

  getAll: () =>
    apiClient.get("/documents"),
};

export const employeeService = {
  getMyProjects: () => apiClient.get("/my-projects"),
};

export const notificationService = {
  getAll: () => apiClient.get("/notifications"),

  markAsRead: (notificationId) =>
    apiClient.put(`/notifications/${notificationId}/read`),
};

export default apiClient;
