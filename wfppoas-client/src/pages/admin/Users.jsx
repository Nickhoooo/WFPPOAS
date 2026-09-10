import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from 'react-router-dom';
import { Search, UserPlus, Users as UsersIcon, ShieldCheck, BriefcaseBusiness, UserRound, Eye, Pencil, RefreshCw, Power, Trash2, MoreVertical, X } from 'lucide-react';
import UsersSkeleton from '../../components/skeletons/UsersSkeleton';
import UserDetailsModal from './UserDetailsModal';


import { API_URL } from "../../config/api";

function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "employee",
  });
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const targetId = searchParams.get('user');
    if (!targetId) return;
    setViewProfileUser({ id: targetId });
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

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
        setUsers(previous => [...previous, response.data.user]);
        setNewUser({ name: "", email: "", role: "employee" });
        setShowAddUser(false);
        setSuccess("Invitation created. The user is inactive until account setup is completed.");
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

  const openProfileModal = (currentUser) => { setViewProfileUser(currentUser); setOpenMenu(null); };

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
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  if (loading) return <UsersSkeleton />;
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">User management</h1><p className="mt-2 text-sm text-slate-500">Manage accounts, roles, and professional profiles.</p></div>
      
        <button
          type="button"
          onClick={() => {
            setAddUserError("");
            setShowAddUser(true);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <span className="inline-flex items-center gap-2"><UserPlus size={17} />Invite user</span>
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Users", value: users.length, icon: UsersIcon },
          { label: "Admins", value: countRole("admin"), icon: ShieldCheck },
          { label: "Managers", value: countRole("manager"), icon: BriefcaseBusiness },
          { label: "Employees", value: countRole("employee"), icon: UserRound },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <card.icon size={20} className="mb-4 text-slate-400" />
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
            className="min-w-0 w-full bg-transparent py-2 text-sm outline-none"
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

      <div className="users-list mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Naglo-load ng users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Walang users na tumugma.</p>
        ) : (
          <table className="users-table w-full table-fixed text-left text-sm">
            <caption className="sr-only">User accounts and management actions</caption>
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="w-[32%] px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((currentUser) => (
                <tr key={currentUser.id} className="border-b border-gray-100 last:border-0">
                  <td className="user-identity px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {getInitials(currentUser.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="break-words font-medium text-slate-900">{currentUser.name}</p>
                        <p className="mt-1 break-all text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize"><span className="user-field-label">Role</span>{currentUser.role}</td>
                  <td className="break-words px-6 py-4 text-gray-500"><span className="user-field-label">Department</span>{currentUser.department || "Not assigned"}</td>
                  <td className="px-6 py-4"><span className="user-field-label">Status</span>
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span className={`h-2 w-2 rounded-full ${(currentUser.status || "inactive") === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                      {currentUser.status || "inactive"}
                    </span>
                  </td>
                  <td className="user-actions relative px-6 py-4 text-right">
                    <button onClick={() => openProfileModal(currentUser)} aria-label={`View ${currentUser.name}`} title="View user" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-slate-500 hover:bg-slate-100"><Eye size={17} /><span className="md:hidden">View profile</span></button>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === currentUser.id ? null : currentUser.id)}
                      aria-label={`Actions for ${currentUser.name}`}
                      aria-expanded={openMenu === currentUser.id}
                      aria-controls={`user-actions-${currentUser.id}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-slate-900"
                    >
                      <MoreVertical size={18} /><span className="md:hidden">Manage</span>
                    </button>
                    {openMenu === currentUser.id && (
                      <div id={`user-actions-${currentUser.id}`} onKeyDown={event => { if (event.key === 'Escape') { setOpenMenu(null); event.currentTarget.previousElementSibling?.focus(); } }} className="mt-2 w-full rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg md:absolute md:right-4 md:top-full md:z-10 md:mt-0 md:w-48">
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
                            disabled={action !== "👁 View Profile" && Number(currentUser.id) === Number(user?.id)}
                            className={`block min-h-11 w-full px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 ${action === "🗑 Delete" ? "text-red-600" : "text-gray-700"}`}
                          >
                            <span className="flex items-center gap-2">{action.includes('View') ? <Eye size={15} /> : action.includes('Edit') ? <Pencil size={15} /> : action.includes('Role') ? <RefreshCw size={15} /> : action.includes('Delete') ? <Trash2 size={15} /> : <Power size={15} />}{action.replace(/^[^A-Za-z]+/, '')}</span>
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
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Add User</h3>
                <p className="mt-1 text-sm text-gray-500">Send an invitation so the user can set up their account.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                aria-label="Close add user form"
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
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
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
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
                <X size={20} />
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

      {viewProfileUser && <UserDetailsModal key={viewProfileUser.id} userId={viewProfileUser.id} onClose={() => setViewProfileUser(null)} />}

      {deleteUser && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
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
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl">
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

