import {validateEmployeeInput, validateEmployeeUpdateInput, validateEmployeeId} from "../validators/validateEmployee.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized } from "../middleware/authorizationMiddleware.js";
import {createEmployeeData, readEmployeeData, getEmployeeAuthorizationData, updateEmployeeData, deleteEmployeeData} from "../services/employeeService.js";
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

const employeeRoles = ["admin", "manager", "assistant manager", "staff"];

const targetRolePermissions = {
  admin: ["manager", "assistant manager", "staff"],
  manager: ["assistant manager", "staff"],
  "assistant manager": ["assistant manager", "staff"],
  staff: []
};

function canManageTarget(requesterRole, targetRole) {
  return targetRolePermissions[requesterRole]?.includes(targetRole) ?? false;
}

function sendForbidden(response) {
  sendJson(response, 403, {message: "You do not have permission to perform this operation."});
}

function sendNotFound(response) {
  sendJson(response, 404, {message: "Employee not found."});
}

function sendValidationError(response, errors) {
  sendJson(response, 400, {message: errors.join("\n")});
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
    if (!employee) {return;}
    if (!authorized(request, response, "admin", "manager", "assistant manager")) {return;}

    // Only an admin may create an admin account.
    if (request.validatedEmployee.role === "admin" && employee.role !== "admin") {
      sendForbidden(response);
      return;
    }

    // Reject unsupported roles.
    if (!employeeRoles.includes(request.validatedEmployee.role)) {
      sendValidationError(response, [
        "Invalid employee role."
      ]);
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

    if (
      !authorized(
        request,
        response,
        "admin",
        "manager",
        "assistant manager"
      )
    ) {
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
  const idValidation = validateEmployeeId(
    request.employeeId
  );

  if (!idValidation.valid) {
    sendJson(response, 400, {
      message: idValidation.error
    });
    return;
  }

  request.employeeId = idValidation.data;

  const validation = validateEmployeeUpdateInput(
    request.body
  );

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

    if (
      !authorized(
        request,
        response,
        "admin",
        "manager",
        "assistant manager"
      )
    ) {
      return;
    }

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;

    // Employees cannot modify their own account
    // through employee-management endpoints.
    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    // Get the target role directly from the database.
    const targetEmployee = await getEmployeeAuthorizationData(
      targetId
    );

    // Apply the target-role hierarchy.
    if (
      !canManageTarget(
        employee.role,
        targetEmployee.role
      )
    ) {
      sendForbidden(response);
      return;
    }

    const data = await updateEmployeeData(request);

    sendJson(response, 200, {
      message: "Employee updated successfully.",
      data
    });
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
  const idValidation = validateEmployeeId(
    request.employeeId
  );

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

    if (
      !authorized(
        request,
        response,
        "admin",
        "manager",
        "assistant manager"
      )
    ) {
      return;
    }

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;

    // Employees cannot delete their own account.
    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    // Get the target role directly from the database.
    const targetEmployee = await getEmployeeAuthorizationData(
      targetId
    );

    // Apply the target-role hierarchy.
    if (
      !canManageTarget(
        employee.role,
        targetEmployee.role
      )
    ) {
      sendForbidden(response);
      return;
    }

    const data = await deleteEmployeeData(request);

    sendJson(response, 200, {
      message: "Employee deleted successfully.",
      data
    });
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