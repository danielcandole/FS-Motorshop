import { login, logout, getLoggedEmployee } from "../controllers/authController.js";
import { handleCreateJobOrder, handleReadJobOrder, handleUpdateJobOrder, handleDeleteJobOrder } from "../controllers/jobOrderController.js";
import {handleCreateEmployee, handleReadEmployee, handleUpdateEmployee, handleDeleteEmployee, handleReadEmployeeRole} from "../controllers/employeeController.js";

export async function handleAuthRoute(request, response, body) {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
console.log("API Request:", request.method, JSON.stringify(pathname));
  if (pathname === "/api/auth/login" && request.method === "POST") {
    await login(request, response, body);
    return true;
  }

  if (pathname === "/api/auth/me" && request.method === "GET") {
    await getLoggedEmployee(request, response);
    return true;
  }

  if (pathname === "/api/auth/logout" && request.method === "POST") {
    await logout(request, response);
    return true;
  }

  // JOB ORDERS
  if (pathname === "/api/job-orders" && request.method === "POST") {
    request.body = body;
    await handleCreateJobOrder(request, response);
    return true;
  }

  if (pathname === "/api/job-orders" && request.method === "GET") {
    await handleReadJobOrder(request, response);
    return true;
  }
  const jobOrderMatch = pathname.match(/^\/api\/job-orders\/(\d+)$/);

  if (jobOrderMatch) {
    request.jobOrderId = Number(jobOrderMatch[1]);
    if (request.method === "PUT") {
      request.body = body;
      await handleUpdateJobOrder(request, response);
      return true;
    }

    if (request.method === "DELETE") {
      await handleDeleteJobOrder(request, response);
      return true;
    }
  }

  // EMPLOYEE ROLES
  if (pathname === "/api/employee-role" && request.method === "GET") {
    await handleReadEmployeeRole(request, response);
    return true;
  }


  // EMPLOYEES
  if (pathname === "/api/employees" && 
    request.method === "GET") {
    await handleReadEmployee(request, response);
    return true;
  }

  if (pathname === "/api/employees" && request.method === "POST") {
    request.body = body;
    await handleCreateEmployee(request, response);
    return true;
  }

  const employeeMatch = pathname.match(/^\/api\/employees\/(\d+)$/);

  if (employeeMatch) {
    request.employeeId = Number(employeeMatch[1]);

    if (request.method === "PUT") {
      request.body = body;
      await handleUpdateEmployee(request, response);
      return true;
    }

    if (request.method === "DELETE") {
      await handleDeleteEmployee(request, response);
      return true;
    }
  }


  return false;
}