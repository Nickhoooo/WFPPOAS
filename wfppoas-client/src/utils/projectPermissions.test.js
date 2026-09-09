import test from "node:test";
import assert from "node:assert/strict";
import { canManageProject } from "./projectPermissions.js";

test("management controls require an admin or the owning manager", () => {
  const project = { manager_id: 12 };
  assert.equal(canManageProject({ id: 12, role: "manager" }, project), true);
  assert.equal(canManageProject({ id: "12", role: "manager" }, project), true);
  assert.equal(canManageProject({ id: 25, role: "admin" }, project), true);
  assert.equal(canManageProject({ id: 25, role: "manager" }, project), false);
  assert.equal(canManageProject({ id: 12, role: "employee" }, project), false);
  assert.equal(canManageProject(null, project), false);
  assert.equal(canManageProject({ id: 12, role: "manager" }, null), false);
  assert.equal(canManageProject({ role: "manager" }, {}), false);
});
