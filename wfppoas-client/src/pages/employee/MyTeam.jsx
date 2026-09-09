import { useEffect, useState } from "react";
import { employeeService } from "../../services/api";

function MyTeam() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await employeeService.getMyProjects();
        setProjects(response.data || []);
      } catch (err) {
        console.error("Failed to fetch my projects:", err);
        setError("Unable to load your project teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
        <p className="mt-2 text-sm text-gray-500">
          Loading your project teams...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            You are not assigned to any project team yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
        <p className="mt-1 text-sm text-gray-500">
          View the teams and managers of your assigned projects.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => {
          const employees = (project.team || []).filter(
            (member) => member.role === "employee"
          );

          return (
            <div
              key={project.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {project.project_name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  📍 {project.location || "No location specified"}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Project Manager:{" "}
                  <span className="font-medium text-slate-800">
                    {project.manager?.name || "Not assigned"}
                  </span>
                </p>
              </div>

              <div className="pt-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Team Members
                </h3>

                {employees.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No other employees are currently assigned to this project.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {employees.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center rounded-lg border border-gray-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">Employee</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTeam;