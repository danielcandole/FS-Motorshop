import {validateEmployeeInput, validateEmployeeUpdateInput, validateEmployeeId} from "../validators/validateEmployee.js";
import { authenticate } from "../middleware/authenticationMiddleware.js";
import { authorized, canManageEmployeeTarget } from "../middleware/authorizationMiddleware.js";
import {createEmployeeData, readEmployeeData, updateEmployeeData, deleteEmployeeData, getEmployeeRole, updateEmployeePassword} from "../services/employeeService.js";
import { getRoleTarget } from "../services/authorizationService.js";
import { sendJson } from "../../frontend/js/utils/jsonUtils.js";

function sendForbidden(response) {
  sendJson(response, 403, {message: "You do not have permission to perform this operation."});
}

function sendNotFound(response) {
  sendJson(response, 404, {message: "Employee not found."});
}

function sendValidationError(response, errors) {
  sendJson(response, 400, {message: errors.join("\n")});
}


export async function handleReadEmployeeRole(request, response) {
  try {
    const employee = await authenticate(request, response);

    if (!employee) {
      return;
    }

    if (!await authorized(request, response, "employee.create")) {
      return;
    }

    const data = await getEmployeeRole();

    sendJson(response, 200, {
      message: "Employee roles retrieved successfully.",
      data
    });
  }
  catch (error) {
    console.error("Read Employee Roles Controller:", error);

    sendJson(response, 500, {
      message: "Internal server error."
    });
  }
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
    if (!await authorized(request, response, "employee.create")) {return;}

    const data = await createEmployeeData(request);

    sendJson(response, 201, {message: "Employee created successfully.", data});
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
    if (!employee) {return;}
    if (!await authorized(request, response, "employee.read")) {return;}

    const data = await readEmployeeData();

    sendJson(response, 200, {message: "Employees retrieved successfully.", data});
  }
  catch (error) {
    console.error("Read Employee Controller:", error);

    sendJson(response, 500, {message: "Internal server error."});
  }
}


// UPDATE EMPLOYEE
export async function handleUpdateEmployee(request, response) {
  const idValidation = validateEmployeeId(request.employeeId);

  if (!idValidation.valid) {
    sendJson(response, 400, {message: idValidation.error});
    return;
  }

  request.employeeId = idValidation.data;

  const validation = validateEmployeeUpdateInput(request.body);

  if (!validation.valid) {
    sendValidationError(response, validation.errors);
    return;
  }

  request.validatedEmployee = validation.data;

  try {
    const employee = await authenticate(request, response);
    if (!employee) {return;}
    if (!await authorized(request, response, "employee.update")) {return;}

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;

    // Employees cannot modify their own account
    // through employee-management endpoints.
    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    const targetEmployee = await getRoleTarget(targetId);

    if (!targetEmployee) {
      sendNotFound(response);
      return;
    }

    if (!canManageEmployeeTarget(employee.roleName, targetEmployee.roleName)) {
      sendForbidden(response);
      return;
    }

    const password = request.validatedEmployee.password;

    if (password) {
      if (!await authorized(request, response, "employee.password.change")) {
        return;
      }
    }

    const data = await updateEmployeeData(request);
    
    if (password || password !== "" || password !== null) {
      await updateEmployeePassword(request);
    }

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
    if (!employee) {return;}
    if (!await authorized(request, response, "employee.delete")) {return;}

    const requesterId = employee.employeeAccountId;
    const targetId = request.employeeId;

    // Employees cannot delete their own account.
    if (requesterId === targetId) {
      sendForbidden(response);
      return;
    }

    const targetEmployee = await getRoleTarget(targetId);

    if (!targetEmployee) {
      sendNotFound(response);
      return;
    }

    if (!canManageEmployeeTarget(employee.roleName, targetEmployee.roleName)) {
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