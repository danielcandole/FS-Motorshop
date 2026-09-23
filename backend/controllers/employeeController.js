
import {validateEmployeeInput, validateEmployeeId} from "../validators/validateEmployee.js";

import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";

import {createEmployeeData, readEmployeeData, updateEmployeeData, deleteEmployeeData} from "../services/employeeService.js";

import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

const employeeRoles = [
  "admin",
  "manager",
  "assistant manager",
  "staff"
];

const passwordAndDeletePermissions = {
  admin: ["manager", "assistant manager", "staff"],
  manager: ["assistant manager", "staff"],
  "assistant manager": ["assistant manager", "staff"],
  staff: []
};

function canManageTarget(requesterRole, targetRole) {
  return passwordAndDeletePermissions[requesterRole]?.includes(targetRole) ?? false;
}

function sendForbidden(response) {
  sendJson(response, 403, {
    message: "You do not have permission to perform this operation."
  });
}

function sendNotFound(response) {
  sendJson(response, 404, {
    message: "Employee not found."
  });
}

function sendValidationError(response, errors) {
  sendJson(response, 400, {
    message: errors.join("\n")
  });
}

// CREATE EMPLOYEE
export async function handleCreateEmployee(request, response) {
  const validation = validateEmployeeInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedEmployee = validation.data;

  try {
    const employee = await authenticate(request, response);

    if (!employee) {
      return;
    }

    if (!authorized(request, response, "admin", "manager", "assistant manager")) {
      return;
    }

    // Only admin may create an admin account.
    if (
      request.validatedEmployee.role === "admin" &&
      employee.role !== "admin"
    ) {
      sendForbidden(response);
      return;
    }

    // Reject unsupported roles.
    if (!employeeRoles.includes(request.validatedEmployee.role)) {
      sendValidationError(response, ["Invalid employee role."]);
      return;
    }

    const data = await createEmployeeData(request);

    sendJson(response, 201, {
      message: "Employee created successfully.",
      data
    });
  }
  catch (error) {
    console.error("Create Employee Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// READ EMPLOYEES
export async function handleReadEmployee(request, response) {
  try {
    const employee = await authenticate(request, response);

    if (!employee) {
      return;
    }

    if (!authorized(request, response, "admin", "manager", "assistant manager")) {
      return;
    }

    const data = await readEmployeeData();

    sendJson(response, 200, {
      message: "Employees retrieved successfully.",
      data
    });
  }
  catch (error) {
    console.error("Read Employee Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// UPDATE EMPLOYEE
export async function handleUpdateEmployee(request, response) {
  const idValidation = validateEmployeeId(request.employeeId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.employeeId = idValidation.data;

  const validation = validateEmployeeInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedEmployee = validation.data;

  try {
    const employee = await authenticate(request, response);

    if (!employee) {
      return;
    }

    if (!authorized(request, response, "admin", "manager", "assistant manager")) {
      return;
    }

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;
    const requesterRole = employee.role;

    // Prevent employees from modifying their own account
    // through employee-management endpoints.
    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    // Role changes are not granted to any role by the
    // supplied permission hierarchy.
    const [targetRole] = await import("../services/employeeService.js");

    // The service does not expose a target lookup operation.
    // Therefore target-role authorization cannot safely be
    // completed here without adding one.
    //
    // Until a target lookup is available, deny password
    // changes and role changes through this handler.
    if (request.validatedEmployee.passwordHash !== undefined) {
      sendForbidden(response);
      return;
    }

    if (request.validatedEmployee.role !== undefined) {
      sendForbidden(response);
      return;
    }

    // Current service updates all supplied account fields.
    // Target role restrictions must be checked before calling it.
    // Do not proceed without a trusted target-role lookup.
    sendForbidden(response);
    return;
  }
  catch (error) {
    console.error("Update Employee Controller:", error);

    if (error.message === "Employee not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}

// DELETE EMPLOYEE
export async function handleDeleteEmployee(request, response) {
  const idValidation = validateEmployeeId(request.employeeId);

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.employeeId = idValidation.data;

  try {
    const employee = await authenticate(request, response);

    if (!employee) {
      return;
    }

    if (!authorized(request, response, "admin", "manager", "assistant manager")) {
      return;
    }

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;
    const requesterRole = employee.role;

    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    // The current service does not provide the target's role.
    // Do not delete until that role can be verified.
    //
    // Deletion must be restricted by the target-role matrix:
    // admin -> manager, assistant manager, staff
    // manager -> assistant manager, staff
    // assistant manager -> assistant manager, staff
    // staff -> none
    //
    // A target-role lookup is required before deletion.
    sendForbidden(response);
    return;
  }
  catch (error) {
    console.error("Delete Employee Controller:", error);

    if (error.message === "Employee not found.") {
      sendNotFound(response);
      return;
    }

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
}
