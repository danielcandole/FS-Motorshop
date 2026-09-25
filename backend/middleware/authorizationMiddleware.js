import { hasPermission } from "../services/authorizationService.js";

const targetRolePermissions = {
  admin: ["manager", "assistant manager", "staff"],
  manager: ["assistant manager", "staff"],
  "assistant manager": ["assistant manager", "staff"],
  staff: []
};

export function canManageEmployeeTarget(requesterRole, targetRole) {
  return targetRolePermissions[requesterRole] ? targetRolePermissions[requesterRole].includes(targetRole) : false;
}

export async function authorized(request, response, permissionName) {
  if (!request.employee) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Authentication required."
    }));
    return false;
  }

  const authorized = await hasPermission(request.employee.employeeAccountId,permissionName);

  if (!authorized) {
    response.writeHead(403, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Access denied."
    }));
    return false;
  }

  return true;
}