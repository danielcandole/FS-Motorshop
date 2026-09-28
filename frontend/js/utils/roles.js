

// CONFIGURE ROLE PERMISSIONS
export function configureRolePermissions(role) {
  const createButton = document.getElementById("createEmployeeButton");
  const createPasswordGroup = document.getElementById("createPasswordGroup");
  const password = document.getElementById("password");
  const editPasswordGroup = document.getElementById("editPasswordGroup");
  const editPassword = document.getElementById("editPassword");
  const deleteButton = document.getElementById("deleteEmployeeButton");

  if (!createButton || !createPasswordGroup || !password || !editPasswordGroup || !editPassword || !deleteButton) {
    throw new Error("Employee permission elements were not found.");
  }

  const canManageEmployees = role === "admin" || role === "manager" || role === "assistant manager";
  const canChangePassword = role === "admin" || role === "manager";
  const canDeleteEmployees = role === "admin" || role === "manager";

  createButton.hidden = !canManageEmployees;
  createPasswordGroup.hidden = !canManageEmployees;
  password.required = canManageEmployees;

  editPasswordGroup.hidden = !canChangePassword;
  editPassword.disabled = !canChangePassword;

  deleteButton.hidden = !canDeleteEmployees;
}

const allowedRoles = ["admin","manager", "assistant manager"];

export function isEmployeeAllowed(employeeRole) {
  if (allowedRoles.includes(employeeRole)) {
    return true;
  }
  return false;
}

