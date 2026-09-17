import { login, logout, getLoggedEmployee } from "../controllers/authController.js";

export async function handleAuthRoute(request, response, body) {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

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
  
  return false;
}