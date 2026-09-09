import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AccountSetup from "./pages/AccountSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleLayout from "./components/RoleLayout";
import ComingSoon from "./pages/ComingSoon";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";

import ManagerDashboard from "./pages/manager/ManagerDashboard";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

import ProjectsPage from "./pages/projects/ProjectsPage";
import Profile from "./pages/Profile";
import TasksPage from "./pages/projects/TasksPage";
import MilestonesPage from "./pages/projects/MilestonesPage";
import PerformancePage from "./pages/projects/PerformancePage";
import MyTeam from "./pages/employee/MyTeam";
import MyTasks from "./pages/employee/MyTasks";
import DocumentsPage from "./pages/DocumentsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/account-setup" element={<AccountSetup />} />

        {/* ADMIN — isang gate, maraming kwarto sa loob */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RoleLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
          <Route path="employees" element={<ComingSoon title="Employees" />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route
          path="/admin/documents"
          element={<DocumentsPage />}
        />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>

        {/* MANAGER */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <RoleLayout role="manager" />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="milestones" element={<MilestonesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route
          path="/manager/documents"
          element={<DocumentsPage />}
        />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
          <Route path="projects" element={<ProjectsPage />} />

          
        </Route>

        {/* EMPLOYEE */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <RoleLayout role="employee" />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tasks" element={<MyTasks />} />
         <Route path="team" element={<MyTeam />} />
          <Route
            path="/employee/documents"
            element={<DocumentsPage />}
          />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;