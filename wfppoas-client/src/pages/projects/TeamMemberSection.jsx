import { useState } from "react";
import PropTypes from "prop-types";

function TeamMemberSection({ projectId, teamMembers, userRole, onAddMember, onRemoveMember }) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch available employees (those not in team)
  const handleShowAddDropdown = async () => {
    if (showAddDropdown) {
      setShowAddDropdown(false);
      return;
    }

    try {
      setLoadingEmployees(true);
      // In a real scenario, you'd fetch available employees from backend
      // For now, we'll handle this when backend provides an endpoint
      // For Phase A, we can simplify this
      setShowAddDropdown(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">👥 TEAM MEMBERS</h3>
        {userRole === "manager" && (
          <button
            onClick={handleShowAddDropdown}
            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* Team Members List */}
      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <p className="text-sm text-gray-500">Walang team members pa.</p>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-slate-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{member.name}</p>
                <p className="text-xs text-gray-400">
                  {member.role === "manager" ? "🔑 Manager (Locked)" : `👤 ${member.role || "Employee"}`}
                </p>
              </div>
              {userRole === "manager" && member.role !== "manager" && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-700 font-bold transition"
                  title="Remove from team"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Member Dropdown Placeholder */}
      {showAddDropdown && userRole === "manager" && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 mb-2">
            💡 Select an employee to add (showing only those not in team):
          </p>
          <p className="text-xs text-gray-400 italic">
            Dropdown for available employees coming soon. Please use the API to fetch employees.
          </p>
          <button
            onClick={() => setShowAddDropdown(false)}
            className="mt-2 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

TeamMemberSection.propTypes = {
  projectId: PropTypes.number.isRequired,
  teamMembers: PropTypes.array.isRequired,
  userRole: PropTypes.string.isRequired,
  onAddMember: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
};

export default TeamMemberSection;
