import { login } from "../controllers/authController.js";

export async function handleAuthRoute(request, response, body) {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === "/api/auth/login" && request.method === "POST") {
    await login(request, response, body);
    return true;
  }
  return false;
}