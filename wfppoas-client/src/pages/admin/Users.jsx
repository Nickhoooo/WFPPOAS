import { useEffect, useState } from "react";
import axios from "axios";


const API_URL = "http://127.0.0.1:8000/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editMode, setEditMode] = useState("edit");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "employee", status: "active" });
  const [deleteUser, setDeleteUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [statusUser, setStatusUser] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [viewProfileUser, setViewProfileUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "employee",
  });
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API_URL}/users`, { headers })
      .then((response) => setUsers(response.data))
      .catch((err) => {
        console.error(err);
        setError("Hindi ma-load ang users. Subukan ulit mamaya.");
      })
      .finally(() => setLoading(false));
  }, []);


  const handleNewUserChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.value });
  };

  const handleAddUser = (event) => {
    event.preventDefault();
    setSavingUser(true);
    setAddUserError("");

    const token = localStorage.getItem("token");

    axios
      .post(`${API_URL}/users/invite`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers([...users, response.data]);
        setNewUser({ name: "", email: "", role: "employee" });
        setShowAddUser(false);
        setError("Invitation created. The user is inactive until account setup is completed.");
      })
      .catch((err) => {
        console.error(err);
        const validationErrors = err.response?.data?.errors;
        setAddUserError(
          validationErrors
            ? Object.values(validationErrors)[0][0]
            : "Hindi ma-add ang user. Subukan ulit mamaya."
        );
      })
      .finally(() => setSavingUser(false));
  };

  const openEditModal = (currentUser, mode) => {
    setEditUser(currentUser);
    setEditMode(mode);
    setEditError("");
    setEditForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      role: currentUser.role || "employee",
      status: currentUser.status || "active",
    });
    setOpenMenu(null);
  };

  const handleEditChange = (event) => {
    setEditForm({ ...editForm, [event.target.name]: event.target.value });
  };

  const handleEditUser = (event) => {
    event.preventDefault();
    setSavingEdit(true);
    setEditError("");

    if (user && editUser && Number(editUser.id) === Number(user.id)) {
      setEditError("You cannot change your own account while logged in.");
      setSavingEdit(false);
      return;
    }

    const token = localStorage.getItem("token");
    const updateData = editMode === "role"
      ? { role: editForm.role }
      : editForm;

    axios
      .put(`${API_URL}/users/${editUser.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(users.map((currentUser) =>
          currentUser.id === editUser.id ? response.data : currentUser
        ));
        setEditUser(null);
      })
      .catch((err) => {
        console.error(err);
        const validationErrors = err.response?.data?.errors;
        const backendMessage = err.response?.data?.message;
        setEditError(
          validationErrors
            ? Object.values(validationErrors)[0][0]
            : backendMessage || "Hindi ma-update ang user. Subukan ulit mamaya."
        );
      })
      .finally(() => setSavingEdit(false));
  };

  const openDeleteModal = (currentUser) => {
    setDeleteUser(currentUser);
    setDeleteError("");
    setOpenMenu(null);
  };

  const handleDeleteUser = () => {
    setDeletingUser(true);
    setDeleteError("");

    if (user && deleteUser && Number(deleteUser.id) === Number(user.id)) {
      setDeleteError("You cannot delete your own account while logged in.");
      setDeletingUser(false);
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .delete(`${API_URL}/users/${deleteUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUsers(users.filter((currentUser) => currentUser.id !== deleteUser.id));
        setDeleteUser(null);
      })
      .catch((err) => {
        console.error(err);
        const backendMessage = err.response?.data?.message;
        setDeleteError(backendMessage || "Hindi ma-delete ang user. Subukan ulit mamaya.");
      })
      .finally(() => setDeletingUser(false));
  };

  const openStatusModal = (currentUser) => {
    if (user && Number(currentUser.id) === Number(user.id)) {
      setStatusError("You cannot change your own account status while logged in.");
      setOpenMenu(null);
      return;
    }

    setStatusUser(currentUser);
    setStatusError("");
    setOpenMenu(null);
  };

  const openProfileModal = async (currentUser) => {
    setViewProfileUser(currentUser);
    setProfileError("");
    setProfileLoading(true);
    setOpenMenu(null);

    const token = localStorage.getItem("token");
    const endpointMap = {
      admin: "admin-profile",
      manager: "manager-profile",
      employee: "employee-profile",
    };

    try {
      const { data } = await axios.get(`${API_URL}/users/${currentUser.id}/${endpointMap[currentUser.role] || "employee-profile"}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileDetails(data);
    } catch (err) {
      setProfileDetails({});
      setProfileError(err.response?.status === 404 ? "This user does not have a profile yet." : "Unable to load profile details.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangeStatus = () => {
    setChangingStatus(true);
    setStatusError("");

    if (user && statusUser && Number(statusUser.id) === Number(user.id)) {
      setStatusError("You cannot change your own account status while logged in.");
      setChangingStatus(false);
      return;
    }

    const token = localStorage.getItem("token");
    const nextStatus = statusUser.status === "active" ? "inactive" : "active";

    axios
      .put(
        `${API_URL}/users/${statusUser.id}`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setUsers(users.map((currentUser) =>
          currentUser.id === statusUser.id ? response.data : currentUser
        ));
        setStatusUser(null);
      })
      .catch((err) => {
        console.error(err);
        setStatusError("Hindi ma-update ang status. Subukan ulit mamaya.");
      })
      .finally(() => setChangingStatus(false));
  };

  const filteredUsers = users.filter((currentUser) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      currentUser.name?.toLowerCase().includes(searchText) ||
      currentUser.email?.toLowerCase().includes(searchText);
    const matchesRole = roleFilter === "all" || currentUser.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || (currentUser.status || "inactive") === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const countRole = (role) => users.filter((currentUser) => currentUser.role === role).length;
  const getRoleProfileFields = (role) => {
    if (role === "admin") {
      return [
        { key: "position", label: "Position" },
        { key: "department", label: "Department" },
        { key: "office_number", label: "Office Number" },
        { key: "contact_number", label: "Contact Number" },
      ];
    }

    if (role === "manager") {
      return [
        { key: "position", label: "Position" },
        { key: "department", label: "Department" },
        { key: "team_name", label: "Team Name" },
        { key: "office_number", label: "Office Number" },
        { key: "contact_number", label: "Contact Number" },
      ];
    }

    return [
      { key: "prc_license_no", label: "PRC License No." },
      { key: "specialization", label: "Specialization" },
      { key: "years_of_experience", label: "Years of Experience" },
      { key: "contact_number", label: "Contact Number" },
    ];
  };
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <>
      <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-start">
      
        <button
          type="button"
          onClick={() => {
            setAddUserError("");
            setShowAddUser(true);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add User
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: countRole("admin") },
          { label: "Managers", value: countRole("manager") },
          { label: "Employees", value: countRole("employee") },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3">
          <span className="text-gray-400">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users..."
            className="w-full py-2 text-sm outline-none"
          />
        </div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Naglo-load ng users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Walang users na tumugma.</p>
        ) : (
          <table className="w-full min-w-175 text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((currentUser) => (
                <tr key={currentUser.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {getInitials(currentUser.name)}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{currentUser.role}</td>
                  <td className="px-6 py-4 text-gray-500">{currentUser.department || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span className={`h-2 w-2 rounded-full ${(currentUser.status || "inactive") === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {currentUser.status || "inactive"}
                    </span>
                  </td>
                  <td className="relative px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === currentUser.id ? null : currentUser.id)}
                      aria-label={`Actions for ${currentUser.name}`}
                      className="rounded-lg px-2 py-1 text-xl leading-none text-gray-500 hover:bg-gray-100 hover:text-slate-900"
                    >
                      ⋮
                    </button>
                    {openMenu === currentUser.id && (
                      <div className="absolute right-4 top-12 z-10 w-48 rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg">
                        {["👁 View Profile", "✏ Edit User", "🔄 Change Role", currentUser.status === "active" ? "🚫 Deactivate" : "✅ Activate", "🗑 Delete"].map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => {
                              if (action === "👁 View Profile") openProfileModal(currentUser);
                              if (action === "✏ Edit User") openEditModal(currentUser, "edit");
                              if (action === "🔄 Change Role") openEditModal(currentUser, "role");
                              if (action === "🚫 Deactivate" || action === "✅ Activate") openStatusModal(currentUser);
                              if (action === "🗑 Delete") openDeleteModal(currentUser);
                              if (!["👁 View Profile", "✏ Edit User", "🔄 Change Role", "🚫 Deactivate", "✅ Activate", "🗑 Delete"].includes(action)) setOpenMenu(null);
                            }}
                            disabled={["🔑 Reset Password"].includes(action)}
                            className={`block w-full px-4 py-2 text-sm hover:bg-gray-50 ${action === "🗑 Delete" ? "text-red-600" : "text-gray-700"}`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Add User</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new account.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                aria-label="Close add user form"
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {addUserError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {addUserError}
              </p>
            )}

            <form onSubmit={handleAddUser} className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {savingUser ? "Sending..." : "Create & Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editMode === "role" ? "Change Role" : "Edit User"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">Update {editUser.name}'s account.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                aria-label="Close edit user form"
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {editError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>
            )}

            <form onSubmit={handleEditUser} className="mt-5 space-y-4">
              {editMode === "edit" && (
                <>
                  <div>
                    <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="edit-name"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="edit-status"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="edit-role" className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="edit-role"
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewProfileUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">User Profile</h3>
                <p className="mt-1 text-sm text-gray-500">{viewProfileUser.name} • {viewProfileUser.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewProfileUser(null)}
                aria-label="Close profile details"
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {profileLoading ? (
              <p className="mt-5 text-sm text-gray-500">Loading profile...</p>
            ) : profileError ? (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{profileError}</p>
            ) : (
              <div className="mt-5 space-y-3">
                {getRoleProfileFields(viewProfileUser.role).map((field) => (
                  <div key={field.key} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">{field.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {profileDetails[field.key] ?? "Not set"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewProfileUser(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete User</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Are you sure you want to delete <strong>{deleteUser.name}</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                disabled={deletingUser}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deletingUser ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {statusUser.status === "active" ? "Deactivate User" : "Activate User"}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Are you sure you want to {statusUser.status === "active" ? "deactivate" : "activate"} <strong>{statusUser.name}</strong>?
            </p>

            {statusError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{statusError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusUser(null)}
                disabled={changingStatus}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeStatus}
                disabled={changingStatus}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {changingStatus ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;
