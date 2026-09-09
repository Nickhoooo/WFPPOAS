// UI visibility only; Laravel enforces the same rule on every management request.
export function canManageProject(user, project) {
  if (!user || !project) return false;
  return user.role === "admin" || (
    user.role === "manager" && user.id != null && project.manager_id != null &&
    Number(user.id) === Number(project.manager_id)
  );
}
