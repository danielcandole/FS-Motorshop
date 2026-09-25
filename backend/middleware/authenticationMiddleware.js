import { getCookie } from "../utils/cookie.js";
import { getSession } from "../services/sessionService.js";
import { getEmployeeById } from "../services/employeeService.js";

export async function authenticate(request, response) {
  const sessionToken = getCookie(request, "sessionToken");

  if (!sessionToken) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Authentication required."
    }));
    return null;
  }

  const session = await getSession(sessionToken);

  if (!session) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Invalid session."
    }));
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Session expired."
    }));
    return null;
  }

  const employee = await getEmployeeById(session.employeeAccountId);

  if (!employee) {
    response.writeHead(401, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Employee account not found."
    }));
    return null;
  }

  if (employee.accountStatus !== "active") {
    response.writeHead(403, {"Content-Type": "application/json"});
    response.end(JSON.stringify({
      message: "Employee account is inactive."
    }));
    return null;
  }

  request.employee = employee;
  request.session = session;

  return employee;
}